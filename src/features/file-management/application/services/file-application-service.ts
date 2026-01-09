import { FileService } from '../../domain/services/file-service';
import { FilePath } from '../../domain/value-objects/file-path';

/**
 * ファイル管理のアプリケーションサービス（関数型）
 */
export function createFileApplicationService(
  fileService: FileService
): {
  checkFileExists: (filePath: FilePath) => Promise<boolean>;
  downloadFile: (url: string, filePath: FilePath) => Promise<void>;
} {
  return {
    checkFileExists: async (filePath: FilePath): Promise<boolean> => {
      return await fileService.fileExists(filePath);
    },

    downloadFile: async (
      url: string,
      filePath: FilePath
    ): Promise<void> => {
      await fileService.downloadFile(url, filePath);
    },
  };
}
