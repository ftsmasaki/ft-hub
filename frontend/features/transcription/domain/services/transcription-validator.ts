import { TranscriptionResult } from '../entities/transcription-result';

/**
 * 文字起こし結果のバリデーション
 */
export const validateTranscriptionResult = (
  result: unknown
): result is TranscriptionResult => {
  if (!result || typeof result !== 'object') {
    return false;
  }

  const res = result as Record<string, unknown>;

  if (typeof res.text !== 'string') {
    return false;
  }

  if (typeof res.isComplete !== 'boolean') {
    return false;
  }

  if (typeof res.timestamp !== 'number') {
    return false;
  }

  return true;
};
