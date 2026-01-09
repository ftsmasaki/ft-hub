import { Audio } from 'expo-av';
import { RecordingService } from '../../domain/services/recording-service';
import { PermissionService } from '../../domain/services/permission-service';
import {
  Recording,
  createRecordingRecording,
} from '../../domain/entities/recording';
import { AudioUri, createAudioUri } from '../../domain/value-objects/audio-uri';

/**
 * Expo Audioクライアントの状態（クロージャで管理）
 */
type ExpoAudioClientState = {
  recording: Audio.Recording | null;
  recordingStartTime: Date | null;
};

/**
 * Expo Audioクライアントを作成するファクトリー関数
 */
export function createExpoAudioClient(): {
  recordingService: RecordingService;
  permissionService: PermissionService;
  isRecording: () => boolean;
} {
  const state: ExpoAudioClientState = {
    recording: null,
    recordingStartTime: null,
  };

  const permissionService: PermissionService = {
    requestMicrophonePermission: async (): Promise<boolean> => {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    },
  };

  const recordingService: RecordingService = {
    startRecording: async (): Promise<Recording> => {
      if (state.recording) {
        throw new Error('Recording is already in progress');
      }

      // オーディオモードを設定
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 録音を作成
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      state.recording = recording;
      state.recordingStartTime = new Date();

      return createRecordingRecording(state.recordingStartTime);
    },

    stopRecording: async (): Promise<AudioUri> => {
      if (!state.recording) {
        throw new Error('No recording in progress');
      }

      await state.recording.stopAndUnloadAsync();
      const uri = state.recording.getURI();

      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      state.recording = null;
      state.recordingStartTime = null;

      return createAudioUri(uri);
    },
  };

  const isRecording = (): boolean => {
    return state.recording !== null;
  };

  return {
    recordingService,
    permissionService,
    isRecording,
  };
}
