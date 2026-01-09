import { AudioUri } from '../value-objects/audio-uri';

/**
 * 録音状態のエンティティ（関数型）
 */
export type RecordingStatus = 'idle' | 'recording' | 'stopped';

export type Recording = {
  readonly status: RecordingStatus;
  readonly audioUri: AudioUri | null;
  readonly startedAt: Date | null;
  readonly stoppedAt: Date | null;
};

/**
 * アイドル状態の録音を作成
 */
export function createIdleRecording(): Recording {
  return {
    status: 'idle',
    audioUri: null,
    startedAt: null,
    stoppedAt: null,
  };
}

/**
 * 録音中の録音を作成
 */
export function createRecordingRecording(startedAt: Date): Recording {
  return {
    status: 'recording',
    audioUri: null,
    startedAt,
    stoppedAt: null,
  };
}

/**
 * 停止した録音を作成
 */
export function createStoppedRecording(
  audioUri: AudioUri,
  startedAt: Date
): Recording {
  return {
    status: 'stopped',
    audioUri,
    startedAt,
    stoppedAt: new Date(),
  };
}

/**
 * 録音がアイドル状態かチェック
 */
export function isIdleRecording(recording: Recording): boolean {
  return recording.status === 'idle';
}

/**
 * 録音中かチェック
 */
export function isRecordingRecording(recording: Recording): boolean {
  return recording.status === 'recording';
}

/**
 * 録音が停止したかチェック
 */
export function isStoppedRecording(recording: Recording): boolean {
  return recording.status === 'stopped';
}
