import * as Linking from 'expo-linking';
import { DeepLinkService } from '../../domain/services/deep-link-service';
import {
  DeepLinkUrl,
  createDeepLinkUrl,
} from '../../domain/value-objects/deep-link-url';

/**
 * Expo Linkingクライアントを作成するファクトリー関数
 */
export function createExpoLinkingClient(): DeepLinkService {
  return {
    getInitialUrl: async (): Promise<DeepLinkUrl | null> => {
      const url = await Linking.getInitialURL();
      return url ? createDeepLinkUrl(url) : null;
    },

    addUrlListener: (
      callback: (url: DeepLinkUrl) => void
    ): (() => void) => {
      const subscription = Linking.addEventListener('url', (event) => {
        callback(createDeepLinkUrl(event.url));
      });

      return () => subscription.remove();
    },
  };
}
