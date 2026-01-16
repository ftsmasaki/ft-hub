/**
 * 文字起こし結果エンティティ
 */
export interface TranscriptionResult {
  text: string;
  isComplete: boolean;
  timestamp: number; // 文字起こしが生成された時刻
}
