import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StatusIndicator } from './status-indicator';
import { TranscriptionDisplay } from './transcription-display';
import { RecordingButton } from '../../../audio-recording/presentation/components/recording-button';

interface SpeechRecognitionScreenProps {
  status: string;
  error: string | null;
  isRecording: boolean;
  isModelLoading: boolean;
  transcribedText: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

/**
 * 音声認識画面のメインコンポーネント
 */
export function SpeechRecognitionScreen({
  status,
  error,
  isRecording,
  isModelLoading,
  transcribedText,
  onStartRecording,
  onStopRecording,
}: SpeechRecognitionScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <StatusIndicator status={status} />
      {error && <StatusIndicator status={error} />}
      <RecordingButton
        isRecording={isRecording}
        disabled={isModelLoading}
        onPress={isRecording ? onStopRecording : onStartRecording}
      />
      <TranscriptionDisplay
        transcribedText={transcribedText}
        onChangeText={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
});
