/**
 * 音声ファイルURIの値オブジェクト（関数型）
 */
export type AudioUri = {
  readonly value: string;
};

/**
 * 音声URIのバリデーション
 */
function validateAudioUri(value: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error('AudioUri cannot be empty');
  }
}

/**
 * 音声URIを作成するファクトリー関数
 */
export function createAudioUri(value: string): AudioUri {
  validateAudioUri(value);
  return { value };
}

/**
 * 音声URIの値を取得
 */
export function getAudioUriValue(audioUri: AudioUri): string {
  return audioUri.value;
}

/**
 * 2つの音声URIが等しいかチェック
 */
export function equalsAudioUri(a: AudioUri, b: AudioUri): boolean {
  return a.value === b.value;
}
