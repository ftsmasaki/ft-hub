import { TranscriptionRequest } from '../entities/transcription-request';

/**
 * 文字起こしリクエストのバリデーション
 */
export const validateTranscriptionRequest = (
  request: unknown
): request is TranscriptionRequest => {
  if (!request || typeof request !== 'object') {
    return false;
  }

  const req = request as Record<string, unknown>;

  if (typeof req.audioData !== 'string' || req.audioData.length === 0) {
    return false;
  }

  if (typeof req.mimeType !== 'string' || req.mimeType.length === 0) {
    return false;
  }

  // サポートされているMIMEタイプをチェック
  const supportedMimeTypes = ['audio/pcm', 'audio/mp3', 'audio/wav', 'audio/m4a'];
  if (!supportedMimeTypes.includes(req.mimeType)) {
    return false;
  }

  return true;
};
