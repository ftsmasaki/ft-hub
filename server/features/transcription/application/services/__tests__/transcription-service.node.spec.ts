import { describe, test, expect, mock } from 'bun:test';
import type { TranscriptionRequest } from '../../../domain/entities/transcription-request';
import type { GeminiClient } from '../../../infrastructure/clients/gemini-client';
import { createTranscriptionService } from '../transcription-service';

describe('createTranscriptionService', () => {
  test('正常なリクエストでストリーミング文字起こしが動作する', async () => {
    // モックGeminiClientを作成
    const mockGeminiClient: GeminiClient = {
      transcribeStream: mock(async function* (request: TranscriptionRequest) {
        yield 'こんにちは';
        yield '世界';
      }),
    };

    const service = createTranscriptionService({
      geminiClient: mockGeminiClient,
    });

    const request: TranscriptionRequest = {
      audioData: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
    };

    const chunks: string[] = [];
    for await (const chunk of service.transcribeStream(request)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['こんにちは', '世界']);
    expect(mockGeminiClient.transcribeStream).toHaveBeenCalledWith(request);
  });

  test('無効なリクエストの場合、エラーをthrowする', async () => {
    const mockGeminiClient: GeminiClient = {
      transcribeStream: mock(async function* () {
        yield 'test';
      }),
    };

    const service = createTranscriptionService({
      geminiClient: mockGeminiClient,
    });

    // 無効なリクエスト（audioDataが空）
    const invalidRequest = {
      audioData: '',
      mimeType: 'audio/m4a',
    };

    await expect(async () => {
      for await (const _ of service.transcribeStream(invalidRequest)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Invalid transcription request');

    // GeminiClientは呼ばれない
    expect(mockGeminiClient.transcribeStream).not.toHaveBeenCalled();
  });

  test('無効なMIMEタイプの場合、エラーをthrowする', async () => {
    const mockGeminiClient: GeminiClient = {
      transcribeStream: mock(async function* () {
        yield 'test';
      }),
    };

    const service = createTranscriptionService({
      geminiClient: mockGeminiClient,
    });

    // 無効なMIMEタイプ
    const invalidRequest = {
      audioData: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'invalid/mime',
    };

    await expect(async () => {
      for await (const _ of service.transcribeStream(invalidRequest)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Invalid transcription request');

    // GeminiClientは呼ばれない
    expect(mockGeminiClient.transcribeStream).not.toHaveBeenCalled();
  });

  test('リクエストがnullの場合、エラーをthrowする', async () => {
    const mockGeminiClient: GeminiClient = {
      transcribeStream: mock(async function* () {
        yield 'test';
      }),
    };

    const service = createTranscriptionService({
      geminiClient: mockGeminiClient,
    });

    await expect(async () => {
      for await (const _ of service.transcribeStream(null as unknown as TranscriptionRequest)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Invalid transcription request');
  });

  test('GeminiClientでエラーが発生した場合、エラーを伝播する', async () => {
    const mockGeminiClient: GeminiClient = {
      transcribeStream: mock(async function* () {
        throw new Error('Gemini API Error');
      }),
    };

    const service = createTranscriptionService({
      geminiClient: mockGeminiClient,
    });

    const request: TranscriptionRequest = {
      audioData: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
    };

    await expect(async () => {
      for await (const _ of service.transcribeStream(request)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Gemini API Error');
  });
});
