import { TranscriptionService } from '../../domain/services/transcription-service';
import { ModelRepository } from '../repositories/model-repository';
import { AudioUri } from '../../../audio-recording/domain/value-objects/audio-uri';
import { TranscriptionResult } from '../../domain/entities/transcription-result';
import { ModelPath } from '../../domain/value-objects/model-path';
import { transcribeAudioUseCase } from '../../domain/use-cases/transcribe-audio-use-case';

/**
 * 文字起こしのアプリケーションサービス（関数型）
 */
export function createTranscriptionApplicationService(
  transcriptionService: TranscriptionService,
  modelRepository: ModelRepository
): {
  initializeModel: (modelPath: ModelPath) => Promise<void>;
  isModelInitialized: () => boolean;
  transcribeAudio: (
    audioUri: AudioUri,
    language?: string
  ) => Promise<TranscriptionResult>;
} {
  return {
    initializeModel: async (modelPath: ModelPath): Promise<void> => {
      await modelRepository.initializeModel(modelPath);
    },

    isModelInitialized: (): boolean => {
      return modelRepository.isModelInitialized();
    },

    transcribeAudio: async (
      audioUri: AudioUri,
      language: string = 'ja'
    ): Promise<TranscriptionResult> => {
      if (!modelRepository.isModelInitialized()) {
        throw new Error('Model is not initialized');
      }

      return await transcribeAudioUseCase(
        transcriptionService,
        audioUri,
        language
      );
    },
  };
}
