import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface StopButtonProps {
  size?: number;
  color?: string;
  onPress?: () => void;
}

/**
 * 停止ボタンコンポーネント
 * 録音停止時に使用
 */
export const StopButton: React.FC<StopButtonProps> = ({
  size = 128,
  color = '#ef4444', // red-500
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.stopButton,
          {
            width: size * 0.6,
            height: size * 0.6,
            backgroundColor: color,
            borderRadius: size * 0.1,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    // 四角形の停止ボタン
  },
});
