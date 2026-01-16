import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VolumeBarProps {
  volumeLevel: number; // 0-1の範囲
  totalBars?: number;
}

/**
 * 音量バーコンポーネント
 * TailwindスタイルのプログレスバーをReact Nativeで実装
 */
export const VolumeBar: React.FC<VolumeBarProps> = ({
  volumeLevel,
  totalBars = 17,
}) => {
  const filledBars = Math.round(volumeLevel * totalBars);
  const percentage = Math.round(volumeLevel * 100);

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {Array.from({ length: totalBars }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              index < filledBars ? styles.barFilled : styles.barEmpty,
            ]}
          />
        ))}
      </View>
      <View style={styles.percentageContainer}>
        <View style={styles.percentageBar}>
          <View
            style={[
              styles.percentageFill,
              { width: `${percentage}%` },
            ]}
          />
        </View>
        <View style={styles.percentageTextContainer}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 2,
  },
  bar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  barFilled: {
    backgroundColor: '#3b82f6', // blue-500
  },
  barEmpty: {
    backgroundColor: '#e5e7eb', // gray-200
  },
  percentageContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb', // gray-200
    borderRadius: 2,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#3b82f6', // blue-500
  },
  percentageTextContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280', // gray-500
  },
});
