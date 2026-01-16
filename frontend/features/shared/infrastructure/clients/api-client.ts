import { TranscriptionChunk, ApiError } from '../../domain/types/api-types';
import { AudioChunk } from '../../../recording/domain/entities/audio-chunk';

/**
 * ApiClientの依存関係
 */
export interface ApiClientDeps {
  baseUrl: string;
  fetch?: typeof fetch;
}

/**
 * ApiClientのインターフェース
 */
export interface ApiClient {
  /**
   * 音声データを文字起こし（ストリーミング）
   */
  transcribeStream(
    audioChunk: AudioChunk
  ): AsyncGenerator<TranscriptionChunk, void, unknown>;
}

/**
 * SSE形式のデータをパースする純粋関数
 */
export const parseSSE = (text: string): TranscriptionChunk[] => {
  const chunks: TranscriptionChunk[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        chunks.push(data as TranscriptionChunk);
      } catch (error) {
        // 無効なJSONはスキップ
        console.error('Failed to parse SSE data:', error, 'Line:', line);
      }
    }
  }

  return chunks;
};

/**
 * APIクライアントを作成（関数型アプローチ）
 */
export const createApiClient = (deps: ApiClientDeps): ApiClient => {
  const { baseUrl, fetch: fetchFn } = deps;

  // baseUrlの検証
  if (!baseUrl || baseUrl.trim() === '') {
    const errorMessage =
      'EXPO_PUBLIC_API_BASE_URL environment variable is not set.\n' +
      'Please set it in your .env file or as an environment variable.\n' +
      'Example: EXPO_PUBLIC_API_BASE_URL=http://<your-server-ip>:<port>';

    console.error('ApiClient:', errorMessage);
    throw new Error(errorMessage);
  }

  const fetchFunction = fetchFn || globalThis.fetch;

  return {
    /**
     * 音声データを文字起こし（ストリーミング）
     */
    async *transcribeStream(
      audioChunk: AudioChunk
    ): AsyncGenerator<TranscriptionChunk, void, unknown> {
      try {
        console.log('ApiClient.transcribeStream: Sending request to', `${baseUrl}/api/transcription`);
        console.log('ApiClient.transcribeStream: Audio chunk size:', audioChunk.data.length);
        console.log('ApiClient.transcribeStream: MIME type:', audioChunk.mimeType);

        const requestBody = {
          audioData: audioChunk.data, // バックエンドはaudioDataを期待
          mimeType: audioChunk.mimeType,
          timestamp: audioChunk.timestamp,
        };

        console.log('ApiClient.transcribeStream: Request body keys:', Object.keys(requestBody));

        const response = await fetchFunction(`${baseUrl}/api/transcription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('ApiClient.transcribeStream: Response status:', response.status);
        console.log('ApiClient.transcribeStream: Response ok:', response.ok);

        if (!response.ok) {
          // エラーレスポンスを安全にパース
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const error: ApiError = await response.json();
              errorMessage = error.message || errorMessage;
            } else {
              // JSONでない場合はテキストとして読み取る
              const text = await response.text();
              errorMessage = text || errorMessage;
            }
          } catch (parseError) {
            console.error('ApiClient.transcribeStream: Failed to parse error response:', parseError);
          }
          console.error('ApiClient.transcribeStream: Error response:', errorMessage);
          throw new Error(errorMessage);
        }

        // Server-Sent Eventsを処理
        // React Nativeではresponse.bodyがnullになることがあるため、
        // response.text()を使用して全体を取得してからSSE形式としてパースする
        let text: string;
        try {
          text = await response.text();
        } catch (textError) {
          const errorMessage = `Failed to read response body (status: ${response.status})`;
          console.error('ApiClient.transcribeStream: Failed to read response:', textError);
          throw new Error(errorMessage);
        }

        if (!text) {
          throw new Error(`Response body is empty (status: ${response.status})`);
        }

        // SSE形式のデータをパース
        const chunks = parseSSE(text);
        for (const chunk of chunks) {
          console.log('ApiClient.transcribeStream: Received SSE data:', chunk);
          yield chunk;

          if (chunk.isComplete) {
            console.log('ApiClient.transcribeStream: Transcription completed');
            return;
          }
        }
      } catch (error) {
        console.error('Transcription stream error:', error);
        throw error;
      }
    },
  };
};
