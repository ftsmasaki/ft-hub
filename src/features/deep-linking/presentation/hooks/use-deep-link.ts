import { useEffect } from 'react';

/**
 * ディープリンク機能のカスタムフック
 */
export function useDeepLink(
  deepLinkService: {
    getInitialUrl: () => Promise<{ value: string } | null>;
    addUrlListener: (
      callback: (url: { value: string }) => void
    ) => () => void;
    isRecordCommand: (url: { value: string }) => boolean;
  },
  onRecordCommand: () => void
) {
  useEffect(() => {
    // 初期URLをチェック
    deepLinkService.getInitialUrl().then((url) => {
      if (url && deepLinkService.isRecordCommand(url)) {
        // 少し待ってから開始（モデルロード等のため）
        setTimeout(() => {
          onRecordCommand();
        }, 1000);
      }
    });

    // URL変更イベントのリスナーを登録
    const removeListener = deepLinkService.addUrlListener((url) => {
      if (deepLinkService.isRecordCommand(url)) {
        // 少し待ってから開始（モデルロード等のため）
        setTimeout(() => {
          onRecordCommand();
        }, 1000);
      }
    });

    return () => {
      removeListener();
    };
  }, [deepLinkService, onRecordCommand]);
}
