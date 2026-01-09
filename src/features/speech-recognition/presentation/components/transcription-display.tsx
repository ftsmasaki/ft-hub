import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';

interface TranscriptionDisplayProps {
  transcribedText: string;
  onChangeText: (text: string) => void;
}

export function TranscriptionDisplay({
  transcribedText,
  onChangeText,
}: TranscriptionDisplayProps) {
  return (
    <>
      <Text style={styles.label}>文字起こし結果:</Text>
      <TextInput
        style={styles.input}
        multiline
        value={transcribedText}
        onChangeText={onChangeText}
        textAlignVertical="top"
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
