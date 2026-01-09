import { initWhisper, WhisperContext } from 'whisper.rn';
import { TranscriptionService } from '../../domain/services/transcription-service';
import { AudioUri } from '../../../audio-recording/domain/value-objects/audio-uri';
import { TranscriptionResult, createTranscriptionResult } from '../../domain/entities/transcription-result';
import { getAudioUriValue } from '../../../audio-recording/domain/value-objects/audio-uri';

/**
 * Whisperクライアントの状態（クロージャで管理）
 */
type WhisperClientState = {
  context: WhisperContext | null;
};

/**
 * Whisperクライアントを作成するファクトリー関数
 */
export function createWhisperClient(): {
  service: TranscriptionService;
  initialize: (modelPath: string) => Promise<void>;
  isInitialized: () => boolean;
} {
  const state: WhisperClientState = {
    context: null,
  };

  const service: TranscriptionService = {
    transcribe: async (audioUri: AudioUri, language: string) => {
      if (!state.context) {
        throw new Error('Whisper context is not initialized');
      }

      const { result } = await state.context.transcribe(
        getAudioUriValue(audioUri),
        {
          language,
        }
      );

      return createTranscriptionResult(audioUri, result, language);
    },
  };

  const initialize = async (modelPath: string): Promise<void> => {
    state.context = await initWhisper({ filePath: modelPath });
  };

  const isInitialized = (): boolean => {
    return state.context !== null;
  };

  return {
    service,
    initialize,
    isInitialized,
  };
}
