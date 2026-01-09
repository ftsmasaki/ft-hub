import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface StatusIndicatorProps {
  status: string;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  return <Text style={styles.status}>{status}</Text>;
}

const styles = StyleSheet.create({
  status: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
