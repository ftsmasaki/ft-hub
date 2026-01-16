import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import type { GoogleGenerativeAI } from '@google/generative-ai';
import type { TranscriptionRequest } from '../../../domain/entities/transcription-request';
import { createGeminiClient } from '../gemini-client';

// モック用の型定義
type MockModel = {
  generateContentStream: ReturnType<typeof mock>;
};

type MockClient = {
  getGenerativeModel: ReturnType<typeof mock>;
};

describe('createGeminiClient', () => {
  let mockModel: MockModel;
  let mockClient: MockClient;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // 環境変数をバックアップ
    originalEnv = process.env.GEMINI_API_KEY;

    // モックモデルを作成
    mockModel = {
      generateContentStream: mock(() => {
        // ストリーミングレスポンスをシミュレート
        const chunks = ['こんにちは', '世界'];
        return {
          stream: (async function* () {
            for (const chunk of chunks) {
              yield { text: () => chunk };
            }
          })(),
        };
      }),
    };

    // モッククライアントを作成
    mockClient = {
      getGenerativeModel: mock(() => mockModel),
    };
  });

  afterEach(() => {
    // 環境変数を復元
    if (originalEnv !== undefined) {
      process.env.GEMINI_API_KEY = originalEnv;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  test('正常にクライアントを作成できる', () => {
    // 環境変数を設定
    process.env.GEMINI_API_KEY = 'test-api-key';

    const client = createGeminiClient({
      apiKey: 'test-api-key',
      model: 'gemini-2.5-flash-lite',
      createClient: () => mockClient as unknown as GoogleGenerativeAI,
    });

    expect(client).toBeDefined();
    expect(mockClient.getGenerativeModel).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash-lite',
    });
  });

  test('APIキーが設定されていない場合、エラーをthrowする', () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => {
      createGeminiClient({
        apiKey: '',
        model: 'gemini-2.5-flash-lite',
        createClient: () => mockClient as unknown as GoogleGenerativeAI,
      });
    }).toThrow('GEMINI_API_KEY is not set');
  });

  test('ストリーミング文字起こしが正常に動作する', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    const request: TranscriptionRequest = {
      audioData: 'dGVzdC1hdWRpby1kYXRh', // Base64エンコードされたテストデータ
      mimeType: 'audio/m4a',
    };

    const client = createGeminiClient({
      apiKey: 'test-api-key',
      model: 'gemini-2.5-flash-lite',
      createClient: () => mockClient as unknown as GoogleGenerativeAI,
    });

    const chunks: string[] = [];
    for await (const chunk of client.transcribeStream(request)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['こんにちは', '世界']);
    expect(mockModel.generateContentStream).toHaveBeenCalled();
  });

  test('Gemini APIエラーが発生した場合、エラーをthrowする', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    // エラーをthrowするモックモデル
    const errorModel: MockModel = {
      generateContentStream: mock(() => {
        throw new Error('API Error');
      }),
    };

    const errorClient: MockClient = {
      getGenerativeModel: mock(() => errorModel),
    };

    const request: TranscriptionRequest = {
      audioData: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
    };

    const client = createGeminiClient({
      apiKey: 'test-api-key',
      model: 'gemini-2.5-flash-lite',
      createClient: () => errorClient as unknown as GoogleGenerativeAI,
    });

    await expect(async () => {
      for await (const _ of client.transcribeStream(request)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('Transcription failed');
  });
});
