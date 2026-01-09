import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

interface RecordingButtonProps {
  isRecording: boolean;
  disabled: boolean;
  onPress: () => void;
}

export function RecordingButton({
  isRecording,
  disabled,
  onPress,
}: RecordingButtonProps) {
  return (
    <View style={styles.buttonContainer}>
      <Button
        title={isRecording ? '録音停止 & 文字起こし' : '録音開始'}
        onPress={onPress}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: 30,
  },
});
