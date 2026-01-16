import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Mic } from 'lucide-react-native';

interface MicrophoneIconProps {
  size?: number;
  color?: string;
}

export const MicrophoneIcon: React.FC<MicrophoneIconProps> = ({
  size = 128,
  color = '#000000',
}) => {
  return (
    <View style={styles.container}>
      {/* @ts-ignore - lucide-react-nativeの型定義が不完全 */}
      <Mic size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
