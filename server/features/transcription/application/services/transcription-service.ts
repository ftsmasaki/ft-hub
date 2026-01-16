import type { GeminiClient } from '../../infrastructure/clients/gemini-client';
import type { TranscriptionRequest } from '../../domain/entities/transcription-request';
import { validateTranscriptionRequest } from '../../domain/services/transcription-validator';

/**
 * TranscriptionServiceの依存関係
 */
export interface TranscriptionServiceDeps {
  geminiClient: GeminiClient;
}

/**
 * TranscriptionServiceのインターフェース
 */
export interface TranscriptionService {
  /**
   * 音声データを文字起こし（ストリーミング）
   */
  transcribeStream(
    request: unknown
  ): AsyncGenerator<string, void, unknown>;
}

/**
 * 文字起こしサービスを作成（関数型アプローチ）
 * アプリケーション層のサービス
 */
export const createTranscriptionService = (
  deps: TranscriptionServiceDeps
): TranscriptionService => {
  const { geminiClient } = deps;

  return {
    /**
     * 音声データを文字起こし（ストリーミング）
     */
    async *transcribeStream(
      request: unknown
    ): AsyncGenerator<string, void, unknown> {
      // バリデーション
      if (!validateTranscriptionRequest(request)) {
        throw new Error('Invalid transcription request');
      }

      // Gemini APIにリクエスト
      yield* geminiClient.transcribeStream(request);
    },
  };
};
