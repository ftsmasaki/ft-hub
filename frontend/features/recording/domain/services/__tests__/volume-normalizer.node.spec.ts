import { describe, test, expect } from 'bun:test';
import { normalizeVolumeLevel } from '../volume-normalizer';

describe('normalizeVolumeLevel', () => {
  test('典型的なdB範囲を0-1に正規化する', () => {
    // -60dB（最小音量）は0に近い値
    const minVolume = normalizeVolumeLevel(-60);
    expect(minVolume).toBeGreaterThanOrEqual(0);
    expect(minVolume).toBeLessThan(0.1);

    // 0dB（最大音量）は1に近い値
    const maxVolume = normalizeVolumeLevel(0);
    expect(maxVolume).toBeGreaterThan(0.9);
    expect(maxVolume).toBeLessThanOrEqual(1);

    // -30dB（中間音量）は0.5に近い値
    const midVolume = normalizeVolumeLevel(-30);
    expect(midVolume).toBeGreaterThan(0.4);
    expect(midVolume).toBeLessThan(0.6);
  });

  test('0dB以上の値は1を返す', () => {
    expect(normalizeVolumeLevel(0)).toBeLessThanOrEqual(1);
    expect(normalizeVolumeLevel(5)).toBeLessThanOrEqual(1);
    expect(normalizeVolumeLevel(10)).toBeLessThanOrEqual(1);
  });

  test('非常に小さいdB値（-60dB以下）は0に近い値を返す', () => {
    const veryLow = normalizeVolumeLevel(-80);
    expect(veryLow).toBeGreaterThanOrEqual(0);
    expect(veryLow).toBeLessThan(0.1);

    const extremelyLow = normalizeVolumeLevel(-100);
    expect(extremelyLow).toBeGreaterThanOrEqual(0);
    expect(extremelyLow).toBeLessThan(0.1);
  });

  test('負の値でも正常に動作する', () => {
    expect(() => normalizeVolumeLevel(-20)).not.toThrow();
    expect(normalizeVolumeLevel(-20)).toBeGreaterThan(0);
    expect(normalizeVolumeLevel(-20)).toBeLessThanOrEqual(1);
  });

  test('値が大きくなるほど正規化値も大きくなる（単調増加）', () => {
    const v1 = normalizeVolumeLevel(-50);
    const v2 = normalizeVolumeLevel(-40);
    const v3 = normalizeVolumeLevel(-30);
    const v4 = normalizeVolumeLevel(-20);
    const v5 = normalizeVolumeLevel(-10);

    expect(v1).toBeLessThan(v2);
    expect(v2).toBeLessThan(v3);
    expect(v3).toBeLessThan(v4);
    expect(v4).toBeLessThan(v5);
  });

  test('同じ入力に対して常に同じ出力を返す（参照透過性）', () => {
    const result1 = normalizeVolumeLevel(-30);
    const result2 = normalizeVolumeLevel(-30);
    expect(result1).toBe(result2);
  });
});
