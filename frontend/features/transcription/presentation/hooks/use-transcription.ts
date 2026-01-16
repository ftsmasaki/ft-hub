import { useState, useCallback, useRef, useMemo } from 'react';
import { createTranscriptionService } from '../../application/services/transcription-service';
import { createApiClient } from '../../../shared/infrastructure/clients/api-client';
import { TranscriptionResult } from '../../domain/entities/transcription-result';
import { AudioChunk } from '../../../recording/domain/entities/audio-chunk';

/**
 * 文字起こし機能のカスタムフック
 */
export const useTranscription = () => {
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult>({
    text: '',
    isComplete: false,
    timestamp: 0,
  });

  // 関数型サービスを作成（useMemoでメモ化）
  const transcriptionService = useMemo(() => {
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error(
        'EXPO_PUBLIC_API_BASE_URL environment variable is not set.\n' +
          'Please set it in your .env file or as an environment variable.\n' +
          'Example: EXPO_PUBLIC_API_BASE_URL=http://<your-server-ip>:<port>'
      );
    }

    const apiClient = createApiClient({
      baseUrl: apiBaseUrl,
    });

    return createTranscriptionService({
      apiClient,
    });
  }, []);

  const transcriptionServiceRef = useRef(transcriptionService);

  // 音声チャンクを文字起こし
  const transcribeChunk = useCallback(async (audioChunk: AudioChunk | null) => {
    console.log('transcribeChunk: Starting transcription...');

    if (!audioChunk) {
      console.warn('transcribeChunk: No audio chunk available');
      return;
    }

    try {
      console.log('transcribeChunk: Calling transcription service...');
      // ストリーミングレスポンスを処理
      for await (const result of transcriptionServiceRef.current.transcribeStream(audioChunk)) {
        console.log('transcribeChunk: Received result:', result);

        // エラーメッセージが含まれている場合
        if (result.text && result.text.startsWith('Error: ')) {
          console.error('transcribeChunk: Error in transcription result:', result.text);
          setTranscriptionResult({
            text: result.text,
            isComplete: true,
            timestamp: result.timestamp,
          });
          return;
        }

        setTranscriptionResult(result);

        // 完了した場合は終了
        if (result.isComplete) {
          console.log('transcribeChunk: Transcription completed');
          return;
        }
      }
      console.log('transcribeChunk: Transcription stream ended');
    } catch (error) {
      console.error('transcribeChunk: Transcription error:', error);
      // エラーをユーザーに表示
      setTranscriptionResult({
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isComplete: true,
        timestamp: Date.now(),
      });
    }
  }, []);

  // 文字起こし結果をリセット
  const reset = useCallback(() => {
    transcriptionServiceRef.current.reset();
    setTranscriptionResult({
      text: '',
      isComplete: false,
      timestamp: 0,
    });
  }, []);

  return {
    transcriptionResult,
    transcribeChunk,
    reset,
  };
};
