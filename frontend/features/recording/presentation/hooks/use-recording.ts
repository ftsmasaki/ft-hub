import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import SoundLevel from 'react-native-sound-level';
import { RecordingState, MAX_RECORDING_DURATION } from '../../domain/services/audio-recorder';
import { AudioChunk } from '../../domain/entities/audio-chunk';
import { useSoundLevel } from '../../application/hooks/use-sound-level';

/**
 * 録音機能のカスタムフック
 */
export const useRecording = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    maxDuration: MAX_RECORDING_DURATION,
  });
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // expo-audioのフックを使用
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, () => {
    // ステータス更新時のコールバック
  });

  const recorderState = useAudioRecorderState(audioRecorder);

  // 音量レベル監視フック（関数型アプローチ）
  const soundLevelModule = useMemo(() => SoundLevel, []);
  const { volumeLevel, start: startSoundLevel, stop: stopSoundLevel } = useSoundLevel({
    soundLevelModule,
    monitoringInterval: 100,
    enabled: recorderState.isRecording,
  });

  // 録音権限とオーディオモードの初期化
  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          console.warn('Permission to access microphone was denied');
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    })();
  }, []);

  // 録音状態を同期
  useEffect(() => {
    setRecordingState({
      isRecording: recorderState.isRecording,
      duration: recorderState.durationMillis || 0,
      maxDuration: MAX_RECORDING_DURATION,
    });
  }, [recorderState.isRecording, recorderState.durationMillis]);

  // 録音開始時に音量レベル監視を開始、停止時に終了
  useEffect(() => {
    if (recorderState.isRecording) {
      startSoundLevel().catch((error) => {
        console.error('Failed to start sound level monitoring:', error);
      });
    } else {
      stopSoundLevel().catch((error) => {
        console.error('Failed to stop sound level monitoring:', error);
      });
    }
  }, [recorderState.isRecording, startSoundLevel, stopSoundLevel]);


  // 録音開始
  const startRecording = useCallback(async () => {
    try {
      // 権限を確認
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.warn('Permission to access microphone was denied');
        return;
      }

      // iOSで録音を有効にする（録音開始前に確実に実行）
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      // 録音を準備して開始
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [audioRecorder]);

  // 録音停止
  const stopRecording = useCallback(async () => {
    try {
      if (recorderState.isRecording) {
        await audioRecorder.stop();
        // 音量レベル監視はuseEffectで自動的に停止される
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [audioRecorder, recorderState.isRecording]);

  // 録音停止後のファイルを取得してAudioChunkとして返す
  const getRecordedAudioChunk = useCallback(async (): Promise<AudioChunk | null> => {
    try {
      console.log('getRecordedAudioChunk: Starting...');
      console.log('getRecordedAudioChunk: recorderState.isRecording =', recorderState.isRecording);
      
      // 録音が停止していることを確認
      if (recorderState.isRecording) {
        console.warn('Recording is still in progress. Stop recording first.');
        return null;
      }

      // expo-audioでは、audioRecorderから直接URIを取得する必要がある
      // audioRecorder.getURI()またはaudioRecorder.getRecordingUri()のようなメソッドがある可能性
      // まず、audioRecorderオブジェクトの構造を確認
      console.log('getRecordedAudioChunk: audioRecorder =', audioRecorder);
      console.log('getRecordedAudioChunk: recorderState =', recorderState);
      
      // audioRecorderからURIを取得を試みる
      let recordingUri: string | null = null;
      
      // 方法1: audioRecorderにgetURIメソッドがあるか確認
      if (typeof (audioRecorder as any).getURI === 'function') {
        recordingUri = (audioRecorder as any).getURI();
        console.log('getRecordedAudioChunk: Got URI from audioRecorder.getURI():', recordingUri);
      }
      // 方法2: recorderStateにuriプロパティがあるか確認
      else if ((recorderState as any).uri) {
        recordingUri = (recorderState as any).uri;
        console.log('getRecordedAudioChunk: Got URI from recorderState.uri:', recordingUri);
      }
      // 方法3: audioRecorderにuriプロパティがあるか確認
      else if ((audioRecorder as any).uri) {
        recordingUri = (audioRecorder as any).uri;
        console.log('getRecordedAudioChunk: Got URI from audioRecorder.uri:', recordingUri);
      }
      
      if (!recordingUri) {
        console.warn('getRecordedAudioChunk: Recording URI is not available');
        console.warn('getRecordedAudioChunk: Available properties:', {
          audioRecorderKeys: Object.keys(audioRecorder || {}),
          recorderStateKeys: Object.keys(recorderState || {}),
        });
        return null;
      }

      console.log('getRecordedAudioChunk: Reading file from URI:', recordingUri);
      
      // ファイルをBase64エンコード
      const base64 = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: 'base64' as const,
      });

      console.log('getRecordedAudioChunk: File read successfully, size:', base64.length);

      return {
        data: base64,
        mimeType: 'audio/m4a', // expo-audioのデフォルトフォーマット
        timestamp: Date.now() - startTimeRef.current,
      };
    } catch (error) {
      console.error('getRecordedAudioChunk: Failed to get recorded audio chunk:', error);
      return null;
    }
  }, [audioRecorder, recorderState]);

  // 音声チャンクを取得
  const getAudioChunk = useCallback(async (): Promise<AudioChunk | null> => {
    try {
      if (!recorderState.isRecording) {
        return null;
      }

      // expo-audioでは録音中のURI取得が制限されているため、
      // 録音中のチャンク取得は難しい
      // 暫定的な実装: 録音完了後にファイルを送信する方式を推奨
      // 実際の実装では、録音完了後にファイルURIを取得して送信
      
      // 現在の実装では、録音中のチャンク取得はスキップ
      return null;
    } catch (error) {
      console.error('Failed to get audio chunk:', error);
      return null;
    }
  }, [audioRecorder, recorderState.isRecording]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
      if (recorderState.isRecording) {
        audioRecorder.stop().catch(console.error);
      }
    };
  }, [audioRecorder, recorderState.isRecording]);

  return {
    recordingState,
    volumeLevel,
    startRecording,
    stopRecording,
    getAudioChunk,
    getRecordedAudioChunk,
  };
};
