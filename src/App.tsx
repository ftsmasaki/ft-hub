import React, { useMemo, useCallback } from 'react';

// Services & Config
import { initializeAppServices } from './libs/services/app-services';
import { MODEL_FILE_NAME } from './libs/config/app-config';

// Presentation Hooks
import { useSpeechRecognition } from './features/speech-recognition/presentation/hooks/use-speech-recognition';
import { useRecording } from './features/audio-recording/presentation/hooks/use-recording';
import { useDeepLink } from './features/deep-linking/presentation/hooks/use-deep-link';
import { useAppSetup } from './features/speech-recognition/presentation/hooks/use-app-setup';

// Components
import { SpeechRecognitionScreen } from './features/speech-recognition/presentation/components/speech-recognition-screen';

export default function App() {
  // サービスの初期化（一度だけ実行）
  const services = useMemo(() => initializeAppServices(), []);

  // モデルパスを設定
  const modelPath = useMemo(() => {
    const documentDir = services.fileSystemClient.getDocumentDirectory();
    return `${documentDir}${MODEL_FILE_NAME}`;
  }, [services.fileSystemClient]);

  // Presentation層のフックを使用
  const {
    isModelLoading,
    status,
    transcribedText,
    error: transcriptionError,
    initializeModel,
    transcribeAudio,
  } = useSpeechRecognition(
    services.transcriptionService,
    '', // modelUrlは使用されていないため空文字
    modelPath
  );

  const {
    recording,
    isRecording,
    error: recordingError,
    requestPermissions,
    startRecording,
    stopRecording,
  } = useRecording(services.recordingService);

  // アプリケーションの初期化
  useAppSetup(
    services,
    modelPath,
    requestPermissions,
    initializeModel
  );

  // 録音開始ハンドラー
  const handleStartRecording = useCallback(async () => {
    await startRecording();
  }, [startRecording]);

  // 録音停止と文字起こしハンドラー
  const handleStopRecording = useCallback(async () => {
    const audioUri = await stopRecording();
    if (audioUri) {
      try {
        await transcribeAudio(audioUri);
      } catch (e) {
        console.error('文字起こしエラー', e);
      }
    }
  }, [stopRecording, transcribeAudio]);

  // ディープリンク処理
  const handleRecordCommand = useCallback(async () => {
    if (!isModelLoading && !isRecording) {
      await handleStartRecording();
    }
  }, [isModelLoading, isRecording, handleStartRecording]);

  useDeepLink(services.deepLinkService, handleRecordCommand);

  const error = transcriptionError || recordingError;

  return (
    <SpeechRecognitionScreen
      status={status}
      error={error}
      isRecording={isRecording}
      isModelLoading={isModelLoading}
      transcribedText={transcribedText}
      onStartRecording={handleStartRecording}
      onStopRecording={handleStopRecording}
    />
  );
}
