/**
 * 音声チャンクエンティティ
 */
export interface AudioChunk {
  data: string; // Base64エンコードされた音声データ
  mimeType: string; // 音声フォーマット
  timestamp: number; // 録音開始からの経過時間（ミリ秒）
}
