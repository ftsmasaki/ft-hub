import type { SoundLevelResult, SoundLevelMonitorConfig } from 'react-native-sound-level';

/**
 * SoundLevelサービスの依存関係
 */
export interface SoundLevelServiceDeps {
  soundLevelModule: {
    start: (config?: number | SoundLevelMonitorConfig) => Promise<void>;
    stop: () => Promise<void>;
    onNewFrame: ((result: SoundLevelResult) => void) | null;
  };
  onNewFrame?: (result: SoundLevelResult) => void;
}

/**
 * SoundLevelサービスのインターフェース
 */
export interface SoundLevelService {
  /**
   * 音量レベル監視を開始
   */
  start(config?: SoundLevelMonitorConfig): Promise<void>;

  /**
   * 音量レベル監視を停止
   */
  stop(): Promise<void>;
}

/**
 * SoundLevelサービスを作成（関数型アプローチ）
 * react-native-sound-levelのラッパー
 */
export const createSoundLevelService = (
  deps: SoundLevelServiceDeps
): SoundLevelService => {
  const { soundLevelModule, onNewFrame } = deps;

  // コールバックを設定
  if (onNewFrame) {
    soundLevelModule.onNewFrame = onNewFrame;
  }

  return {
    /**
     * 音量レベル監視を開始
     */
    async start(config?: SoundLevelMonitorConfig): Promise<void> {
      try {
        await soundLevelModule.start(config);
      } catch (error) {
        console.error('Failed to start sound level monitoring:', error);
        throw error;
      }
    },

    /**
     * 音量レベル監視を停止
     */
    async stop(): Promise<void> {
      try {
        await soundLevelModule.stop();
        // コールバックをクリア
        soundLevelModule.onNewFrame = null;
      } catch (error) {
        console.error('Failed to stop sound level monitoring:', error);
        throw error;
      }
    },
  };
};
