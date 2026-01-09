import { useEffect } from 'react';
import { createFilePath } from '../../../../features/file-management/domain/value-objects/file-path';
import { MODEL_URL } from '../../../../libs/config/app-config';
import type { AppServices } from '../../../../libs/services/app-services';

/**
 * アプリケーションの初期化を管理するカスタムフック
 */
export function useAppSetup(
  services: AppServices,
  modelPath: string,
  requestPermissions: () => Promise<boolean>,
  initializeModel: () => Promise<void>
) {
  useEffect(() => {
    const setup = async () => {
      try {
        // 1. 権限確認
        const granted = await requestPermissions();
        if (!granted) {
          return;
        }

        // 2. モデルのダウンロードとロード
        const modelFilePath = createFilePath(modelPath);
        const fileExists = await services.fileService.checkFileExists(
          modelFilePath
        );
        if (!fileExists) {
          await services.fileService.downloadFile(MODEL_URL, modelFilePath);
        }

        // 3. モデルの初期化
        await initializeModel();
      } catch (e) {
        console.error('セットアップエラー', e);
      }
    };

    setup();
  }, [requestPermissions, services.fileService, modelPath, initializeModel]);
}
