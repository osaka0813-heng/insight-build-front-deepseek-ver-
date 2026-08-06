import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Signal } from '../types/insight';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing, type } from '../theme/tokens';

type Props = { index: number; onPress?: () => void; signal: Signal };

export function SignalCard({ index, onPress, signal }: Props) {
  const { t } = useI18n();
  return (
    <Pressable accessibilityHint={t('explore')} accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.metaRow}>
        <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
        <Text style={styles.label}>{signal.label}</Text>
        <Text style={styles.explore}>{t('explore')} ↗</Text>
      </View>
      <Text style={styles.title}>{signal.title}</Text>
      <Text style={styles.body}>{signal.body}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: spacing.md, paddingTop: spacing.md },
  pressed: { opacity: 0.58, transform: [{ translateX: 2 }] },
  metaRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.sm },
  index: { color: colors.gray500, fontSize: type.micro, fontWeight: '700', letterSpacing: 1.5, width: 38 },
  label: { color: colors.gray600, flex: 1, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.8 },
  explore: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: colors.ink, fontSize: 18, fontWeight: '700', lineHeight: 25, marginBottom: 5 },
  body: { color: colors.gray700, fontSize: 14, lineHeight: 21 },
});
