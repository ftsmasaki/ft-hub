import { useState, useEffect, useRef, useCallback } from 'react';
import type { SoundLevelResult, SoundLevelMonitorConfig } from 'react-native-sound-level';
import { normalizeVolumeLevel } from '../../domain/services/volume-normalizer';
import { createSoundLevelService } from '../../infrastructure/services/sound-level-service';

/**
 * useSoundLevelフックの依存関係
 */
export interface UseSoundLevelDeps {
  soundLevelModule: {
    start: (config?: number | SoundLevelMonitorConfig) => Promise<void>;
    stop: () => Promise<void>;
    onNewFrame: ((result: SoundLevelResult) => void) | null;
  };
  monitoringInterval?: number;
  enabled?: boolean;
}

/**
 * useSoundLevelフックの戻り値
 */
export interface UseSoundLevelReturn {
  /**
   * 正規化された音量レベル（0-1の範囲）
   */
  volumeLevel: number;

  /**
   * 音量レベル監視が有効かどうか
   */
  isActive: boolean;

  /**
   * 監視を開始
   */
  start: () => Promise<void>;

  /**
   * 監視を停止
   */
  stop: () => Promise<void>;
}

/**
 * 音量レベルを監視するカスタムフック（関数型アプローチ）
 * @param deps 依存関係
 * @returns 音量レベルと制御関数
 */
export const useSoundLevel = (deps: UseSoundLevelDeps): UseSoundLevelReturn => {
  const { soundLevelModule, monitoringInterval = 100, enabled = true } = deps;
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const serviceRef = useRef<ReturnType<typeof createSoundLevelService> | null>(null);

  // 音量レベル更新のコールバック
  const handleNewFrame = useCallback((result: SoundLevelResult) => {
    // dB値を0-1の範囲に正規化
    const normalized = normalizeVolumeLevel(result.value);
    setVolumeLevel(normalized);
  }, []);

  // 監視を開始
  const start = useCallback(async () => {
    if (isActive) {
      return;
    }

    try {
      // サービスインスタンスを作成（コールバックを設定）
      const service = createSoundLevelService({
        soundLevelModule,
        onNewFrame: handleNewFrame,
      });

      serviceRef.current = service;
      await service.start({ monitoringInterval });
      setIsActive(true);
    } catch (error) {
      console.error('Failed to start sound level monitoring:', error);
      setVolumeLevel(0);
    }
  }, [isActive, monitoringInterval, handleNewFrame, soundLevelModule]);

  // 監視を停止
  const stop = useCallback(async () => {
    if (!isActive || !serviceRef.current) {
      return;
    }

    try {
      await serviceRef.current.stop();
      serviceRef.current = null;
      setIsActive(false);
      setVolumeLevel(0);
    } catch (error) {
      console.error('Failed to stop sound level monitoring:', error);
    }
  }, [isActive]);

  // enabledがfalseの場合は自動的に停止
  useEffect(() => {
    if (!enabled && isActive) {
      stop();
    }
  }, [enabled, isActive, stop]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return {
    volumeLevel,
    isActive,
    start,
    stop,
  };
};
