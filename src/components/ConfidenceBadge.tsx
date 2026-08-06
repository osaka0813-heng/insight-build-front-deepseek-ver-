import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import type { ConfidenceLevel } from '../types/insight';
import { colors, type } from '../theme/tokens';

type Props = { level: ConfidenceLevel; inverse?: boolean };

export function ConfidenceBadge({ level, inverse = false }: Props) {
  const { t } = useI18n();
  const label = level === 'verified' ? t('verified') : level === 'developing' ? t('developing') : t('hypothesis');
  return (
    <View style={[styles.badge, inverse ? styles.badgeInverse : styles.badgeDefault]}>
      <Text style={[styles.text, inverse ? styles.textInverse : styles.textDefault]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, paddingVertical: 5 },
  badgeDefault: { borderColor: colors.gray300 }, badgeInverse: { borderColor: colors.gray600 },
  text: { fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  textDefault: { color: colors.gray600 }, textInverse: { color: colors.gray300 },
});
