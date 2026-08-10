import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import type { DailyContinuity } from '../types/dailyContinuity';
import { colors, spacing, type } from '../theme/tokens';

type Props = { continuity: DailyContinuity; compact?: boolean };

export function DailyContinuityCard({ continuity, compact = false }: Props) {
  const { t } = useI18n();
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Text style={styles.kicker}>{t('sinceLastReading')}</Text>
      {continuity.lastSeenTitle ? (
        <View style={styles.previousBlock}>
          <Text style={styles.label}>{t('youLastSaw')}</Text>
          <Text style={styles.previousTitle}>{continuity.lastSeenTitle}</Text>
          {continuity.lastSeenDate ? <Text style={styles.date}>{continuity.lastSeenDate}</Text> : null}
        </View>
      ) : null}

      {continuity.additions.length ? (
        <View style={styles.additionsBlock}>
          <Text style={styles.label}>{t('addedSinceThen')}</Text>
          {continuity.additions.slice(0, compact ? 2 : 3).map((item, index) => (
            <View key={item.id} style={styles.additionRow}>
              <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={styles.additionBody}>
                <Text style={styles.additionTitle}>{item.title}</Text>
                {!compact ? <Text style={styles.additionSummary}>{item.summary}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.judgmentBlock}>
        <Text style={styles.label}>{t('currentJudgment')}</Text>
        <Text style={styles.judgmentTitle}>{continuity.judgmentTitle}</Text>
        {!compact ? <Text style={styles.judgmentSummary}>{continuity.judgmentSummary}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: colors.gray300, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.lg, padding: spacing.lg },
  compact: { marginTop: spacing.md, padding: spacing.md },
  kicker: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.5 },
  previousBlock: { marginTop: spacing.md },
  additionsBlock: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingTop: spacing.md },
  judgmentBlock: { backgroundColor: colors.ink, marginHorizontal: -spacing.lg, marginBottom: -spacing.lg, marginTop: spacing.md, padding: spacing.lg },
  label: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  previousTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', lineHeight: 23, marginTop: 7 },
  date: { color: colors.gray500, fontSize: 10, fontWeight: '700', marginTop: 5 },
  additionRow: { flexDirection: 'row', paddingTop: 12 },
  index: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1, width: 28 },
  additionBody: { flex: 1 },
  additionTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  additionSummary: { color: colors.gray600, fontSize: 12, lineHeight: 18, marginTop: 4 },
  judgmentTitle: { color: colors.white, fontSize: 18, fontWeight: '800', lineHeight: 25, marginTop: 8 },
  judgmentSummary: { color: colors.gray300, fontSize: 13, lineHeight: 20, marginTop: 7 },
});
