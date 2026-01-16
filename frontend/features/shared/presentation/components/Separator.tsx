import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * セパレータコンポーネント
 */
export const Separator: React.FC = () => {
  return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb', // gray-200
    marginVertical: 16,
  },
});
