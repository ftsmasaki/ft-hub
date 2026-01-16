import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptionRequest } from '../../domain/entities/transcription-request';

/**
 * GeminiClientの依存関係
 */
export interface GeminiClientDeps {
  apiKey: string;
  model: string;
  createClient?: (apiKey: string) => GoogleGenerativeAI;
}

/**
 * GeminiClientのインターフェース
 */
export interface GeminiClient {
  /**
   * 音声データを文字起こし（ストリーミング）
   */
  transcribeStream(
    request: TranscriptionRequest
  ): AsyncGenerator<string, void, unknown>;
}

/**
 * Gemini APIクライアントを作成（関数型アプローチ）
 * ストリーミング文字起こしを実装
 */
export const createGeminiClient = (deps: GeminiClientDeps): GeminiClient => {
  const { apiKey, model, createClient } = deps;

  // APIキーの検証
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set');
  }

  // クライアントを作成（テスト時にモック可能）
  const createGoogleClient = createClient || ((apiKey: string) => new GoogleGenerativeAI(apiKey));
  const client = createGoogleClient(apiKey);
  const geminiModel = client.getGenerativeModel({ model });

  return {
    /**
     * 音声データを文字起こし（ストリーミング）
     */
    async *transcribeStream(
      request: TranscriptionRequest
    ): AsyncGenerator<string, void, unknown> {
      try {
        // Base64デコード
        const audioBytes = Buffer.from(request.audioData, 'base64');

        // Gemini APIにストリーミングリクエスト
        const result = await geminiModel.generateContentStream([
          {
            inlineData: {
              data: audioBytes.toString('base64'),
              mimeType: request.mimeType,
            },
          },
          {
            text: 'この音声を文字起こししてください。',
          },
        ]);

        // ストリーミングレスポンスを処理
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            yield chunkText;
          }
        }
      } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error(
          `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },
  };
};
