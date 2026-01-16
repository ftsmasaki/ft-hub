/**
 * API共通型定義
 */

export interface ApiError {
  message: string;
  code?: string;
}

export interface TranscriptionChunk {
  text: string;
  isComplete: boolean;
}
