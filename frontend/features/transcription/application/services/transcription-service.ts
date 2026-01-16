import type { ApiClient } from '../../../shared/infrastructure/clients/api-client';
import type { TranscriptionResult } from '../../domain/entities/transcription-result';
import type { AudioChunk } from '../../../recording/domain/entities/audio-chunk';
import type { TranscriptionChunk } from '../../../shared/domain/types/api-types';

/**
 * TranscriptionServiceの依存関係
 */
export interface TranscriptionServiceDeps {
  apiClient: ApiClient;
}

/**
 * TranscriptionServiceのインターフェース
 */
export interface TranscriptionService {
  /**
   * 音声チャンクを文字起こし（ストリーミング）
   */
  transcribeStream(
    audioChunk: AudioChunk
  ): AsyncGenerator<TranscriptionResult, void, unknown>;

  /**
   * 累積テキストをリセット
   */
  reset(): void;
}

/**
 * テキストを累積する純粋関数
 */
export const accumulateText = (
  currentText: string,
  newChunk: TranscriptionChunk
): { accumulatedText: string; shouldReset: boolean } => {
  let accumulatedText = currentText;
  let shouldReset = false;

  if (newChunk.text) {
    accumulatedText += newChunk.text;
  }

  if (newChunk.isComplete) {
    shouldReset = true;
  }

  return { accumulatedText, shouldReset };
};

/**
 * 文字起こしサービスを作成（関数型アプローチ）
 */
export const createTranscriptionService = (
  deps: TranscriptionServiceDeps
): TranscriptionService => {
  const { apiClient } = deps;
  let accumulatedText = '';

  return {
    /**
     * 音声チャンクを文字起こし（ストリーミング）
     */
    async *transcribeStream(
      audioChunk: AudioChunk
    ): AsyncGenerator<TranscriptionResult, void, unknown> {
      try {
        // APIクライアントからストリーミングレスポンスを取得
        for await (const chunk of apiClient.transcribeStream(audioChunk)) {
          // テキストを累積（純粋関数を使用）
          const { accumulatedText: newText, shouldReset } = accumulateText(
            accumulatedText,
            chunk
          );
          accumulatedText = newText;

          const result: TranscriptionResult = {
            text: accumulatedText,
            isComplete: chunk.isComplete,
            timestamp: Date.now(),
          };

          yield result;

          // 完了したら累積テキストをリセット
          if (shouldReset) {
            accumulatedText = '';
          }
        }
      } catch (error) {
        console.error('Transcription service error:', error);
        throw error;
      }
    },

    /**
     * 累積テキストをリセット
     */
    reset(): void {
      accumulatedText = '';
    },
  };
};
