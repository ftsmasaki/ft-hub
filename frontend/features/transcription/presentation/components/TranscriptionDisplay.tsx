import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { TranscriptionResult } from '../../domain/entities/transcription-result';

interface TranscriptionDisplayProps {
  transcriptionResult: TranscriptionResult;
}

/**
 * 文字起こし結果を表示するコンポーネント
 * 読み取り専用のTextInputでストリーミング更新に対応
 */
export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcriptionResult,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={transcriptionResult.text}
        editable={false}
        multiline
        placeholder="文字起こし結果がここに表示されます..."
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
  },
  textInput: {
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    textAlignVertical: 'top',
  },
});
