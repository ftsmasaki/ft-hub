/**
 * Result型パターン
 * エラーハンドリングを型安全に行うための型
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Result型のヘルパー関数
 */
export const success = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

export const failure = <T>(error: string): Result<T> => ({
  success: false,
  error,
});
