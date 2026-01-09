import { ModelPath, getModelPathValue } from '../../domain/value-objects/model-path';

/**
 * モデルリポジトリの関数型定義
 */
export type ModelRepository = {
  initializeModel: (modelPath: ModelPath) => Promise<void>;
  isModelInitialized: () => boolean;
};

/**
 * Whisperモデルリポジトリを作成するファクトリー関数
 */
export function createWhisperModelRepository(
  whisperClient: {
    initialize: (modelPath: string) => Promise<void>;
    isInitialized: () => boolean;
  }
): ModelRepository {
  return {
    initializeModel: async (modelPath: ModelPath): Promise<void> => {
      await whisperClient.initialize(getModelPathValue(modelPath));
    },
    isModelInitialized: (): boolean => {
      return whisperClient.isInitialized();
    },
  };
}
