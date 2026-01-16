import { describe, test, expect, mock } from 'bun:test';
import type { AudioChunk } from '../../../../recording/domain/entities/audio-chunk';
import type { TranscriptionChunk } from '../../../../shared/domain/types/api-types';
import type { ApiClient } from '../../../../shared/infrastructure/clients/api-client';
import { createTranscriptionService } from '../transcription-service';

describe('createTranscriptionService', () => {
  test('正常なストリーミング処理でテキストが累積される', async () => {
    // モックApiClientを作成
    const mockApiClient: ApiClient = {
      transcribeStream: mock(async function* (audioChunk: AudioChunk) {
        yield { text: 'こんにちは', isComplete: false };
        yield { text: '世界', isComplete: false };
        yield { text: '', isComplete: true };
      }),
    };

    const service = createTranscriptionService({
      apiClient: mockApiClient,
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    const results = [];
    for await (const result of service.transcribeStream(audioChunk)) {
      results.push(result);
    }

    expect(results).toHaveLength(3);
    expect(results[0].text).toBe('こんにちは');
    expect(results[0].isComplete).toBe(false);
    expect(results[1].text).toBe('こんにちは世界');
    expect(results[1].isComplete).toBe(false);
    expect(results[2].text).toBe('こんにちは世界');
    expect(results[2].isComplete).toBe(true);
  });

  test('完了時に累積テキストがリセットされる', async () => {
    const mockApiClient: ApiClient = {
      transcribeStream: mock(async function* () {
        yield { text: 'テスト', isComplete: false };
        yield { text: '', isComplete: true };
      }),
    };

    const service = createTranscriptionService({
      apiClient: mockApiClient,
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    // 最初のストリーミング
    const results1 = [];
    for await (const result of service.transcribeStream(audioChunk)) {
      results1.push(result);
    }

    expect(results1[results1.length - 1].text).toBe('テスト');
    expect(results1[results1.length - 1].isComplete).toBe(true);

    // 2回目のストリーミング（リセット後）
    const results2 = [];
    for await (const result of service.transcribeStream(audioChunk)) {
      results2.push(result);
    }

    // リセットされているため、累積テキストは再び「テスト」から始まる
    expect(results2[0].text).toBe('テスト');
  });

  test('空のテキストチャンクは累積されない', async () => {
    const mockApiClient: ApiClient = {
      transcribeStream: mock(async function* () {
        yield { text: 'こんにちは', isComplete: false };
        yield { text: '', isComplete: false }; // 空のテキスト
        yield { text: '世界', isComplete: false };
        yield { text: '', isComplete: true };
      }),
    };

    const service = createTranscriptionService({
      apiClient: mockApiClient,
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    const results = [];
    for await (const result of service.transcribeStream(audioChunk)) {
      results.push(result);
    }

    // 空のテキストは累積されない
    expect(results[0].text).toBe('こんにちは');
    expect(results[1].text).toBe('こんにちは'); // 空のテキストは累積されない
    expect(results[2].text).toBe('こんにちは世界');
  });

  test('ApiClientでエラーが発生した場合、エラーを伝播する', async () => {
    const mockApiClient: ApiClient = {
      transcribeStream: mock(async function* () {
        throw new Error('API Error');
      }),
    };

    const service = createTranscriptionService({
      apiClient: mockApiClient,
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    await expect(async () => {
      for await (const _ of service.transcribeStream(audioChunk)) {
        // エラーが発生するまでイテレート
      }
    }).toThrow('API Error');
  });

  test('タイムスタンプが設定される', async () => {
    const mockApiClient: ApiClient = {
      transcribeStream: mock(async function* () {
        yield { text: 'テスト', isComplete: false };
        yield { text: '', isComplete: true };
      }),
    };

    const service = createTranscriptionService({
      apiClient: mockApiClient,
    });

    const audioChunk: AudioChunk = {
      data: 'dGVzdC1hdWRpby1kYXRh',
      mimeType: 'audio/m4a',
      timestamp: Date.now(),
    };

    const results = [];
    const beforeTime = Date.now();
    for await (const result of service.transcribeStream(audioChunk)) {
      results.push(result);
    }
    const afterTime = Date.now();

    // タイムスタンプが設定されていることを確認
    expect(results[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(results[0].timestamp).toBeLessThanOrEqual(afterTime);
    expect(results[1].timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(results[1].timestamp).toBeLessThanOrEqual(afterTime);
  });
});
