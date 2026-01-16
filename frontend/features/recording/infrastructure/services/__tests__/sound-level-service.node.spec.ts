import { describe, test, expect, mock, beforeEach } from 'bun:test';
import type { SoundLevelResult } from 'react-native-sound-level';
import { createSoundLevelService } from '../sound-level-service';

// react-native-sound-levelのモック
const createMockSoundLevel = () => ({
  start: mock(() => Promise.resolve()),
  stop: mock(() => Promise.resolve()),
  onNewFrame: null as ((result: SoundLevelResult) => void) | null,
});

describe('createSoundLevelService', () => {
  let mockSoundLevel: ReturnType<typeof createMockSoundLevel>;

  beforeEach(() => {
    mockSoundLevel = createMockSoundLevel();
  });

  test('正常にサービスを作成できる', () => {
    const service = createSoundLevelService({
      soundLevelModule: mockSoundLevel as any,
    });

    expect(service).toBeDefined();
    expect(service.start).toBeDefined();
    expect(service.stop).toBeDefined();
  });

  test('startメソッドで監視を開始できる', async () => {
    const service = createSoundLevelService({
      soundLevelModule: mockSoundLevel as any,
    });

    await service.start({ monitoringInterval: 100 });

    expect(mockSoundLevel.start).toHaveBeenCalledWith({
      monitoringInterval: 100,
    });
  });

  test('stopメソッドで監視を停止できる', async () => {
    const service = createSoundLevelService({
      soundLevelModule: mockSoundLevel as any,
    });

    await service.stop();

    expect(mockSoundLevel.stop).toHaveBeenCalled();
  });

  test('onNewFrameコールバックが設定される', () => {
    const onFrame = mock((result: SoundLevelResult) => {
      expect(result.value).toBe(-30);
    });

    const service = createSoundLevelService({
      soundLevelModule: mockSoundLevel as any,
      onNewFrame: onFrame,
    });

    // サービス作成時にコールバックが設定される
    expect(mockSoundLevel.onNewFrame).toBe(onFrame);
  });

  test('onNewFrameコールバックが呼ばれる', () => {
    const onFrame = mock((result: SoundLevelResult) => {});

    const service = createSoundLevelService({
      soundLevelModule: mockSoundLevel as any,
      onNewFrame: onFrame,
    });

    // モックのコールバックを直接呼び出す
    if (mockSoundLevel.onNewFrame) {
      mockSoundLevel.onNewFrame({
        id: 1,
        value: -30,
        rawValue: 0.5,
      });
    }

    expect(onFrame).toHaveBeenCalledWith({
      id: 1,
      value: -30,
      rawValue: 0.5,
    });
  });

  test('startでエラーが発生した場合、エラーをthrowする', async () => {
    const errorService = {
      start: mock(() => Promise.reject(new Error('INVALID_STATE'))),
      stop: mock(() => Promise.resolve()),
      onNewFrame: null,
    };

    const service = createSoundLevelService({
      soundLevelModule: errorService as any,
    });

    await expect(service.start()).rejects.toThrow('INVALID_STATE');
  });

  test('stopでエラーが発生した場合、エラーをthrowする', async () => {
    const errorService = {
      start: mock(() => Promise.resolve()),
      stop: mock(() => Promise.reject(new Error('INVALID_STATE'))),
      onNewFrame: null,
    };

    const service = createSoundLevelService({
      soundLevelModule: errorService as any,
    });

    await expect(service.stop()).rejects.toThrow('INVALID_STATE');
  });
});
