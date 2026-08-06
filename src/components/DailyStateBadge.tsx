import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DailyInsightState } from '../types/dailyState';
import { colors } from '../theme/tokens';

type Props = {
  label: string;
  state: DailyInsightState;
  inverse?: boolean;
};

export function DailyStateBadge({ label, state, inverse = false }: Props) {
  return (
    <View style={[styles.badge, inverse && styles.badgeInverse]}>
      <View
        style={[
          styles.dot,
          state === 'publish_new' && styles.dotStrong,
          state === 'no_new_global_insight' && styles.dotQuiet,
          inverse && styles.dotInverse,
        ]}
      />
      <Text style={[styles.label, inverse && styles.labelInverse]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderColor: colors.gray300,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeInverse: { borderColor: 'rgba(255,255,255,0.28)' },
  dot: { backgroundColor: colors.gray500, borderRadius: 3, height: 6, width: 6 },
  dotStrong: { backgroundColor: colors.ink },
  dotQuiet: { backgroundColor: colors.gray300 },
  dotInverse: { backgroundColor: colors.paper },
  label: { color: colors.gray600, fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  labelInverse: { color: colors.paper },
});
