import { AudioUri } from '../../../audio-recording/domain/value-objects/audio-uri';

/**
 * 文字起こし結果のエンティティ（関数型）
 */
export type TranscriptionResult = {
  readonly audioUri: AudioUri;
  readonly text: string;
  readonly language: string;
  readonly createdAt: Date;
};

/**
 * 文字起こし結果のバリデーション
 */
function validateTranscriptionResult(
  text: string,
  language: string
): void {
  if (!text || text.trim().length === 0) {
    throw new Error('Transcription text cannot be empty');
  }
  if (!language || language.trim().length === 0) {
    throw new Error('Language cannot be empty');
  }
}

/**
 * 文字起こし結果を作成するファクトリー関数
 */
export function createTranscriptionResult(
  audioUri: AudioUri,
  text: string,
  language: string
): TranscriptionResult {
  validateTranscriptionResult(text, language);
  return {
    audioUri,
    text,
    language,
    createdAt: new Date(),
  };
}
