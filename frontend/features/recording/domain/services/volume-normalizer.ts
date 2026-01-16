/**
 * 音量レベル正規化関数
 * デシベル（dB）値を0-1の範囲に正規化する純粋関数
 */

/**
 * 典型的なマイク入力のdB範囲
 * -60dB: 静寂レベル（最小音量）
 * 0dB: 最大音量
 */
const MIN_DB = -60;
const MAX_DB = 0;

/**
 * dB値を0-1の範囲に正規化する
 * @param dB デシベル値（通常は-60から0の範囲）
 * @returns 0-1の範囲の正規化された値
 */
export const normalizeVolumeLevel = (dB: number): number => {
  // 0dB以上の値は1にクランプ
  if (dB >= MAX_DB) {
    return 1;
  }

  // MIN_DB以下の値は0にクランプ
  if (dB <= MIN_DB) {
    return 0;
  }

  // 線形補間で0-1の範囲にマッピング
  // dB値が大きいほど（0に近いほど）正規化値も大きくなる
  const normalized = (dB - MIN_DB) / (MAX_DB - MIN_DB);

  // 0-1の範囲にクランプ（念のため）
  return Math.max(0, Math.min(1, normalized));
};
