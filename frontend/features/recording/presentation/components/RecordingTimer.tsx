import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { RecordingState } from '../../domain/services/audio-recorder';

interface RecordingTimerProps {
  recordingState: RecordingState;
}

/**
 * 録音時間を表示するコンポーネント
 * 形式: 00:18 / 15:00
 */
export const RecordingTimer: React.FC<RecordingTimerProps> = ({ recordingState }) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const currentTime = formatTime(recordingState.duration);
  const maxTime = formatTime(recordingState.maxDuration);

  return (
    <Text style={styles.timer}>
      {currentTime} / {maxTime}
    </Text>
  );
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
});
