import { useState, useCallback } from 'react';
import { ModelPath, createModelPath } from '../../domain/value-objects/model-path';
import { AudioUri } from '../../../audio-recording/domain/value-objects/audio-uri';
import { TranscriptionResult } from '../../domain/entities/transcription-result';

/**
 * 音声認識機能のカスタムフック
 */
export function useSpeechRecognition(
  transcriptionService: {
    initializeModel: (modelPath: ModelPath) => Promise<void>;
    isModelInitialized: () => boolean;
    transcribeAudio: (
      audioUri: AudioUri,
      language?: string
    ) => Promise<TranscriptionResult>;
  },
  modelUrl: string,
  modelPath: string
) {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [status, setStatus] = useState('初期化中...');
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const initializeModel = useCallback(async () => {
    try {
      setError(null);
      setStatus('Whisperロード中...');
      await transcriptionService.initializeModel(createModelPath(modelPath));
      setIsModelLoading(false);
      setStatus('準備完了');
    } catch (err) {
      setError('モデル初期化エラー');
      setStatus('エラーが発生しました');
      console.error('モデル初期化エラー', err);
    }
  }, [transcriptionService, modelPath]);

  const transcribeAudio = useCallback(
    async (audioUri: AudioUri, language: string = 'ja') => {
      try {
        setError(null);
        setStatus('処理中...');
        const result = await transcriptionService.transcribeAudio(
          audioUri,
          language
        );
        setTranscribedText((prev) => prev + '\n' + result.text);
        setStatus('完了');
        return result;
      } catch (err) {
        setError('文字起こしエラー');
        setStatus('文字起こしエラー');
        console.error('文字起こしエラー', err);
        throw err;
      }
    },
    [transcriptionService]
  );

  const clearTranscription = useCallback(() => {
    setTranscribedText('');
  }, []);

  return {
    isModelLoading,
    status,
    transcribedText,
    error,
    initializeModel,
    transcribeAudio,
    clearTranscription,
  };
}
