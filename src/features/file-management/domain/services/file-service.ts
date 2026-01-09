import { FilePath } from '../value-objects/file-path';

/**
 * ファイルサービスの関数型定義
 * Domain Layerで定義される純粋な関数型
 */
export type FileService = {
  /**
   * ファイルが存在するかチェック
   */
  fileExists: (filePath: FilePath) => Promise<boolean>;

  /**
   * URLからファイルをダウンロードする
   * @param url ダウンロード元のURL
   * @param filePath 保存先のファイルパス
   */
  downloadFile: (url: string, filePath: FilePath) => Promise<void>;
};
