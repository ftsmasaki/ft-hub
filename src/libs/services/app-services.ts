/**
 * アプリケーション全体のサービス初期化モジュール
 * 依存性注入の責務を担当
 */

// Infrastructure
import { createWhisperClient } from '../../features/speech-recognition/infrastructure/clients/whisper-client';
import { createExpoAudioClient } from '../../features/audio-recording/infrastructure/clients/expo-audio-client';
import { createExpoLinkingClient } from '../../features/deep-linking/infrastructure/clients/expo-linking-client';
import { createExpoFileSystemClient } from '../../features/file-management/infrastructure/clients/expo-file-system-client';
import { createWhisperModelRepository } from '../../features/speech-recognition/application/repositories/model-repository';

// Application
import { createTranscriptionApplicationService } from '../../features/speech-recognition/application/services/transcription-application-service';
import { createRecordingApplicationService } from '../../features/audio-recording/application/services/recording-application-service';
import { createDeepLinkApplicationService } from '../../features/deep-linking/application/services/deep-link-application-service';
import { createFileApplicationService } from '../../features/file-management/application/services/file-application-service';

/**
 * アプリケーション全体のサービスを初期化
 */
export function initializeAppServices() {
  // Infrastructure層のクライアントを初期化
  const whisperClient = createWhisperClient();
  const audioClient = createExpoAudioClient();
  const linkingClient = createExpoLinkingClient();
  const fileSystemClient = createExpoFileSystemClient();

  // Repository層を初期化
  const modelRepository = createWhisperModelRepository(whisperClient);

  // Application層のサービスを初期化
  const transcriptionService = createTranscriptionApplicationService(
    whisperClient.service,
    modelRepository
  );

  const recordingService = createRecordingApplicationService(
    audioClient.recordingService,
    audioClient.permissionService
  );

  const deepLinkService = createDeepLinkApplicationService(linkingClient);

  const fileService = createFileApplicationService(fileSystemClient.service);

  return {
    transcriptionService,
    recordingService,
    deepLinkService,
    fileService,
    fileSystemClient,
  };
}

/**
 * アプリケーションサービスの型定義
 */
export type AppServices = ReturnType<typeof initializeAppServices>;
