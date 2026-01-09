import { DeepLinkUrl } from '../value-objects/deep-link-url';

/**
 * ディープリンクサービスの関数型定義
 * Domain Layerで定義される純粋な関数型
 */
export type DeepLinkService = {
  /**
   * 初期URLを取得する（アプリが完全に閉じている状態から開かれた場合）
   */
  getInitialUrl: () => Promise<DeepLinkUrl | null>;

  /**
   * URL変更イベントのリスナーを登録
   * @param callback URL変更時のコールバック
   * @returns リスナーの削除関数
   */
  addUrlListener: (
    callback: (url: DeepLinkUrl) => void
  ) => () => void;
};
