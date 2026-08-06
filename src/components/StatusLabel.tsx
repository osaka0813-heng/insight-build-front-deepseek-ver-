import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import type { InsightStatus } from '../types/insight';
import { colors, type } from '../theme/tokens';

type Props = { status: InsightStatus };

export function StatusLabel({ status }: Props) {
  const { t } = useI18n();
  const label = status === 'publish_new' ? t('publishNew') : status === 'update_living' ? t('updateLiving') : t('noNew');
  return <Text style={styles.label}>{label}</Text>;
}

const styles = StyleSheet.create({ label: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 } });
