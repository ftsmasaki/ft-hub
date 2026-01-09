/**
 * ディープリンクURLの値オブジェクト（関数型）
 */
export type DeepLinkUrl = {
  readonly value: string;
};

/**
 * ディープリンクURLのバリデーション
 */
function validateDeepLinkUrl(value: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error('DeepLinkUrl cannot be empty');
  }
}

/**
 * ディープリンクURLを作成するファクトリー関数
 */
export function createDeepLinkUrl(value: string): DeepLinkUrl {
  validateDeepLinkUrl(value);
  return { value };
}

/**
 * ディープリンクURLの値を取得
 */
export function getDeepLinkUrlValue(url: DeepLinkUrl): string {
  return url.value;
}

/**
 * URLに特定のパスが含まれているかチェック
 */
export function includesDeepLinkUrl(
  url: DeepLinkUrl,
  path: string
): boolean {
  return url.value.includes(path);
}

/**
 * 2つのディープリンクURLが等しいかチェック
 */
export function equalsDeepLinkUrl(
  a: DeepLinkUrl,
  b: DeepLinkUrl
): boolean {
  return a.value === b.value;
}
