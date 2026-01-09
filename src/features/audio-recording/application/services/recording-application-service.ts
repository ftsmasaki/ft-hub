import { RecordingService } from '../../domain/services/recording-service';
import { PermissionService } from '../../domain/services/permission-service';
import { Recording } from '../../domain/entities/recording';
import { AudioUri } from '../../domain/value-objects/audio-uri';

/**
 * 録音のアプリケーションサービス（関数型）
 */
export function createRecordingApplicationService(
  recordingService: RecordingService,
  permissionService: PermissionService
): {
  requestPermissions: () => Promise<boolean>;
  startRecording: () => Promise<Recording>;
  stopRecording: () => Promise<AudioUri>;
} {
  return {
    requestPermissions: async (): Promise<boolean> => {
      return await permissionService.requestMicrophonePermission();
    },

    startRecording: async (): Promise<Recording> => {
      return await recordingService.startRecording();
    },

    stopRecording: async (): Promise<AudioUri> => {
      return await recordingService.stopRecording();
    },
  };
}
