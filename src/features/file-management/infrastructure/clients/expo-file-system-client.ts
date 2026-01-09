import * as FileSystem from 'expo-file-system';
import { FileService } from '../../domain/services/file-service';
import { FilePath, getFilePathValue } from '../../domain/value-objects/file-path';

/**
 * Expo File Systemクライアントを作成するファクトリー関数
 */
export function createExpoFileSystemClient(): {
  service: FileService;
  getDocumentDirectory: () => string;
} {
  const service: FileService = {
    fileExists: async (filePath: FilePath): Promise<boolean> => {
      const fileInfo = await FileSystem.getInfoAsync(getFilePathValue(filePath));
      return fileInfo.exists;
    },

    downloadFile: async (url: string, filePath: FilePath): Promise<void> => {
      await FileSystem.downloadAsync(url, getFilePathValue(filePath));
    },
  };

  const getDocumentDirectory = (): string => {
    return FileSystem.documentDirectory || '';
  };

  return {
    service,
    getDocumentDirectory,
  };
}
