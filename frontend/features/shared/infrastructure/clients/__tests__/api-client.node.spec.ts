import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import type { AudioChunk } from '../../../../recording/domain/entities/audio-chunk';
import type { TranscriptionChunk } from '../../../../domain/types/api-types';
import { createApiClient } from '../api-client';

describe('createApiClient', () => {
  let originalEnv: string | undefined;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    // 環境変数をバックアップ
    originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
    // fetchをバックアップ
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    // 環境変数を復元
    if (originalEnv !== undefined) {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    } else {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    }
    // fetchを復元
    globalThis.fetch = originalFetch;
  });

  test('正常にクライアントを作成できる', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
    });

    expect(client).toBeDefined();
  });

  test('baseUrlが空の場合、エラーをthrowする', () => {
    expect(() => {
      createApiClient({
        baseUrl: '',
      });
    }).toThrow('EXPO_PUBLIC_API_BASE_URL');
  });

  test('SSE形式のレスポンスを正しくパースできる', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';

    // SSE形式のレスポンスをシミュレート
    const sseResponse = `data: {"text":"こんにちは","isComplete":false}

data: {"text":"世界","isComplete":false}

data: {"text":"","isComplete":true}

`;

    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: async () => sseResponse,
      } as Response)
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    const chunks: TranscriptionChunk[] = [];
    for await (const chunk of client.transcribeStream(audioChunk)) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual({ text: 'こんにちは', isComplete: false });
    expect(chunks[1]).toEqual({ text: '世界', isComplete: false });
    expect(chunks[2]).toEqual({ text: '', isComplete: true });
  });

  test('HTTPエラーレスポンスの場合、エラーをthrowする', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';

    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: (name: string) => (name === 'content-type' ? 'application/json' : null),
        },
        json: async () => ({ message: 'Server Error' }),
      } as Response)
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    await expect(async () => {
      for await (const _ of client.transcribeStream(audioChunk)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Server Error');
  });

  test('レスポンスボディが空の場合、エラーをthrowする', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';

    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: async () => '',
      } as Response)
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    await expect(async () => {
      for await (const _ of client.transcribeStream(audioChunk)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Response body is empty');
  });

  test('無効なSSEデータが含まれている場合、その行をスキップする', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';

    // 無効なJSONを含むSSE形式のレスポンス
    const sseResponse = `data: {"text":"こんにちは","isComplete":false}

data: invalid json

data: {"text":"","isComplete":true}

`;

    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: async () => sseResponse,
      } as Response)
    );

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    const chunks: TranscriptionChunk[] = [];
    for await (const chunk of client.transcribeStream(audioChunk)) {
      chunks.push(chunk);
    }

    // 無効なJSONはスキップされ、有効なデータのみが取得される
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toEqual({ text: 'こんにちは', isComplete: false });
    expect(chunks[1]).toEqual({ text: '', isComplete: true });
  });

  test('fetchエラーが発生した場合、エラーをthrowする', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';

    globalThis.fetch = mock(() => Promise.reject(new Error('Network Error')));

    const client = createApiClient({
      baseUrl: 'http://localhost:3000',
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    await expect(async () => {
      for await (const _ of client.transcribeStream(audioChunk)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Network Error');
  });
});
