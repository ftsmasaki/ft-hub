/**
 * Whisperモデルファイルパスの値オブジェクト（関数型）
 */
export type ModelPath = {
  readonly value: string;
};

/**
 * モデルパスのバリデーション
 */
function validateModelPath(value: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error('ModelPath cannot be empty');
  }
}

/**
 * モデルパスを作成するファクトリー関数
 */
export function createModelPath(value: string): ModelPath {
  validateModelPath(value);
  return { value };
}

/**
 * モデルパスの値を取得
 */
export function getModelPathValue(modelPath: ModelPath): string {
  return modelPath.value;
}

/**
 * 2つのモデルパスが等しいかチェック
 */
export function equalsModelPath(
  a: ModelPath,
  b: ModelPath
): boolean {
  return a.value === b.value;
}
