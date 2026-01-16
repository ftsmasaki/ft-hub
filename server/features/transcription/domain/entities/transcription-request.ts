/**
 * 文字起こしリクエストエンティティ
 */
export interface TranscriptionRequest {
  audioData: string; // Base64エンコードされた音声データ
  mimeType: string; // 音声フォーマット（例: audio/pcm, audio/mp3）
}
