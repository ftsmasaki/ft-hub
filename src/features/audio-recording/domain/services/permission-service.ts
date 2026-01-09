/**
 * 権限サービスの関数型定義
 */
export type PermissionService = {
  /**
   * マイク権限をリクエストする
   */
  requestMicrophonePermission: () => Promise<boolean>;
};
