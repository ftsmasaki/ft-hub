import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRecording } from '../hooks/use-recording';
import { useTranscription } from '../../../transcription/presentation/hooks/use-transcription';
import { MicrophoneIcon } from './MicrophoneIcon';
import { StopButton } from './StopButton';
import { RecordingTimer } from './RecordingTimer';
import { VolumeBar } from './VolumeBar';
import { Separator } from '../../../shared/presentation/components/Separator';
import { TranscriptionDisplay } from '../../../transcription/presentation/components/TranscriptionDisplay';

/**
 * 録音画面コンポーネント
 * アプリ起動時に自動で録音を開始
 */
export const RecordingScreen: React.FC = () => {
  const { recordingState, volumeLevel, startRecording, stopRecording, getAudioChunk, getRecordedAudioChunk } = useRecording();
  const { transcriptionResult, transcribeChunk, reset } = useTranscription();
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldTranscribeOnStopRef = useRef<boolean>(false);

  // 停止ボタンを押したときの処理
  const handleStopRecording = async () => {
    console.log('handleStopRecording: Stop button pressed');
    try {
      shouldTranscribeOnStopRef.current = true; // 停止後に文字起こしを実行するフラグを立てる
      await stopRecording();
      console.log('handleStopRecording: Recording stopped, waiting for state update...');
    } catch (error) {
      console.error('handleStopRecording: Error:', error);
      shouldTranscribeOnStopRef.current = false;
    }
  };

  // 録音が停止したときに自動的にファイルを取得して文字起こし
  useEffect(() => {
    if (!recordingState.isRecording && shouldTranscribeOnStopRef.current) {
      console.log('RecordingScreen: Recording stopped, getting audio chunk...');
      shouldTranscribeOnStopRef.current = false; // フラグをリセット
      
      // 少し待ってからファイルを取得（録音が完全に停止するまで）
      const timeoutId = setTimeout(async () => {
        const audioChunk = await getRecordedAudioChunk();
        console.log('RecordingScreen: Got audio chunk:', audioChunk ? 'Yes' : 'No');
        
        if (audioChunk) {
          console.log('RecordingScreen: Sending to transcription service...');
          await transcribeChunk(audioChunk);
          console.log('RecordingScreen: Transcription request sent');
        } else {
          console.warn('RecordingScreen: No audio chunk available');
        }
      }, 500); // 500ms待機

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [recordingState.isRecording, getRecordedAudioChunk, transcribeChunk]);

  // アプリ起動時に自動で録音開始
  useEffect(() => {
    startRecording();
  }, [startRecording]);

  // 録音中のチャンク送信
  useEffect(() => {
    if (!recordingState.isRecording) {
      return;
    }

    // 定期的に音声チャンクを取得して文字起こし
    chunkIntervalRef.current = setInterval(async () => {
      const audioChunk = await getAudioChunk();
      if (audioChunk) {
        await transcribeChunk(audioChunk);
      }
    }, 3000); // 3秒ごとにチャンク送信

    return () => {
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }
    };
  }, [recordingState.isRecording, getAudioChunk, transcribeChunk]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
      reset();
    };
  }, [reset]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 録音中は停止ボタン、停止中はマイクアイコン */}
        {recordingState.isRecording ? (
          <StopButton size={128} color="#ef4444" onPress={handleStopRecording} />
        ) : (
          <MicrophoneIcon size={128} color="#3b82f6" />
        )}

        {/* 録音時間表示 */}
        <View style={styles.timerContainer}>
          <RecordingTimer recordingState={recordingState} />
        </View>

        {/* 音量バー */}
        <View style={styles.volumeBarContainer}>
          <VolumeBar volumeLevel={volumeLevel} />
        </View>

        {/* セパレータ */}
        <Separator />

        {/* 文字起こし結果表示 */}
        <TranscriptionDisplay transcriptionResult={transcriptionResult} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  volumeBarContainer: {
    width: '100%',
    marginBottom: 16,
  },
});
