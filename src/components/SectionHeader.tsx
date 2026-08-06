import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../theme/tokens';

type Props = { index: string; label: string; secondary: string };

export function SectionHeader({ index, label, secondary }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.index}>{index}</Text><View style={styles.rule} />
      <View><Text style={styles.label}>{label}</Text><Text style={styles.secondary}>{secondary}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row' },
  index: { color: colors.gray500, fontSize: type.micro, fontWeight: '700', letterSpacing: 1.8, width: 24 },
  rule: { backgroundColor: colors.gray300, height: StyleSheet.hairlineWidth, marginRight: spacing.sm, width: 34 },
  label: { color: colors.ink, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.5 },
  secondary: { color: colors.gray500, fontSize: type.micro, marginTop: 2 },
});
