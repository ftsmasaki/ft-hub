import { Recording } from '../entities/recording';
import { AudioUri } from '../value-objects/audio-uri';

/**
 * 録音サービスの関数型定義
 * Domain Layerで定義される純粋な関数型
 */
export type RecordingService = {
  /**
   * 録音を開始する
   * @returns 録音状態
   */
  startRecording: () => Promise<Recording>;

  /**
   * 録音を停止する
   * @returns 停止した録音のURI
   */
  stopRecording: () => Promise<AudioUri>;
};
