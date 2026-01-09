import { AudioUri } from '../../../audio-recording/domain/value-objects/audio-uri';
import { TranscriptionResult } from '../entities/transcription-result';

/**
 * 文字起こしサービスの関数型定義
 * Domain Layerで定義される純粋な関数型
 */
export type TranscriptionService = {
  /**
   * 音声ファイルを文字起こしする
   * @param audioUri 音声ファイルのURI
   * @param language 言語コード（例: 'ja'）
   * @returns 文字起こし結果
   */
  transcribe: (
    audioUri: AudioUri,
    language: string
  ) => Promise<TranscriptionResult>;
};
