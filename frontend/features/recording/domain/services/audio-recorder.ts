import { AudioChunk } from '../entities/audio-chunk';

/**
 * 録音状態
 */
export interface RecordingState {
  isRecording: boolean;
  duration: number; // 録音時間（ミリ秒）
  maxDuration: number; // 最大録音時間（ミリ秒、15分 = 900000ms）
}

/**
 * 音声録音サービスのインターフェース
 */
export interface AudioRecorderService {
  /**
   * 録音を開始
   */
  startRecording(): Promise<void>;

  /**
   * 録音を停止
   */
  stopRecording(): Promise<void>;

  /**
   * 現在の録音状態を取得
   */
  getRecordingState(): RecordingState;

  /**
   * 音声チャンクを取得（定期的に呼び出し）
   */
  getAudioChunk(): Promise<AudioChunk | null>;

  /**
   * 音量レベルを取得（0-1の範囲）
   */
  getVolumeLevel(): number;
}

/**
 * 最大録音時間（15分）
 */
export const MAX_RECORDING_DURATION = 15 * 60 * 1000; // 15分 = 900000ms
