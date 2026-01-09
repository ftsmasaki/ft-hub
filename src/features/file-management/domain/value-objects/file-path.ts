/**
 * ファイルパスの値オブジェクト（関数型）
 */
export type FilePath = {
  readonly value: string;
};

/**
 * ファイルパスのバリデーション
 */
function validateFilePath(value: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error('FilePath cannot be empty');
  }
}

/**
 * ファイルパスを作成するファクトリー関数
 */
export function createFilePath(value: string): FilePath {
  validateFilePath(value);
  return { value };
}

/**
 * ファイルパスの値を取得
 */
export function getFilePathValue(filePath: FilePath): string {
  return filePath.value;
}

/**
 * 2つのファイルパスが等しいかチェック
 */
export function equalsFilePath(a: FilePath, b: FilePath): boolean {
  return a.value === b.value;
}
