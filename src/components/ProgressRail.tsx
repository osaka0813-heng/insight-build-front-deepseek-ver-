import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  current: number;
  total: number;
};

export function ProgressRail({ current, total }: Props) {
  return (
    <View pointerEvents="none" style={styles.rail}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[styles.mark, current === index && styles.active]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: 7,
    position: 'absolute',
    right: 10,
    top: '44%',
  },
  mark: {
    backgroundColor: colors.gray300,
    height: 1,
    width: 8,
  },
  active: {
    backgroundColor: colors.ink,
    width: 18,
  },
});
