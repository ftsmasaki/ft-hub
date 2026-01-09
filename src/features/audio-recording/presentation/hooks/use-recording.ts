import { useState, useCallback } from 'react';
import {
  Recording,
  createIdleRecording,
  createStoppedRecording,
  isRecordingRecording,
} from '../../domain/entities/recording';
import { AudioUri } from '../../domain/value-objects/audio-uri';

/**
 * 録音機能のカスタムフック
 */
export function useRecording(recordingService: {
  requestPermissions: () => Promise<boolean>;
  startRecording: () => Promise<Recording>;
  stopRecording: () => Promise<AudioUri>;
}) {
  const [recording, setRecording] = useState<Recording>(
    createIdleRecording()
  );
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      const granted = await recordingService.requestPermissions();
      if (!granted) {
        setError('マイク権限が必要です');
        return false;
      }
      setError(null);
      return true;
    } catch (err) {
      setError('権限リクエストエラー');
      return false;
    }
  }, [recordingService]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const newRecording = await recordingService.startRecording();
      setRecording(newRecording);
    } catch (err) {
      setError('録音開始エラー');
      console.error('録音開始エラー', err);
    }
  }, [recordingService]);

  const stopRecording = useCallback(async (): Promise<AudioUri | null> => {
    try {
      setError(null);
      const audioUri = await recordingService.stopRecording();
      setRecording(
        createStoppedRecording(
          audioUri,
          recording.startedAt || new Date()
        )
      );
      return audioUri;
    } catch (err) {
      setError('録音停止エラー');
      console.error('録音停止エラー', err);
      return null;
    }
  }, [recordingService, recording.startedAt]);

  return {
    recording,
    isRecording: isRecordingRecording(recording),
    error,
    requestPermissions,
    startRecording,
    stopRecording,
  };
}
