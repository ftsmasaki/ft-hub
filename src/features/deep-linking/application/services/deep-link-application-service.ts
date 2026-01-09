import { DeepLinkService } from '../../domain/services/deep-link-service';
import {
  DeepLinkUrl,
  includesDeepLinkUrl,
} from '../../domain/value-objects/deep-link-url';

/**
 * ディープリンクのアプリケーションサービス（関数型）
 */
export function createDeepLinkApplicationService(
  deepLinkService: DeepLinkService
): {
  getInitialUrl: () => Promise<DeepLinkUrl | null>;
  addUrlListener: (
    callback: (url: DeepLinkUrl) => void
  ) => () => void;
  isRecordCommand: (url: DeepLinkUrl) => boolean;
} {
  return {
    getInitialUrl: async (): Promise<DeepLinkUrl | null> => {
      return await deepLinkService.getInitialUrl();
    },

    addUrlListener: (
      callback: (url: DeepLinkUrl) => void
    ): (() => void) => {
      return deepLinkService.addUrlListener(callback);
    },

    isRecordCommand: (url: DeepLinkUrl): boolean => {
      return includesDeepLinkUrl(url, 'record');
    },
  };
}
