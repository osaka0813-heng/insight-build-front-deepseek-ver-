import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/I18nProvider';
import type { TranslationKey } from '../i18n/translations';
import type { EvolutionImpact, EvolutionStage, WorldProcess } from '../types/worldProcess';
import { colors, spacing, type } from '../theme/tokens';

type Props = {
  process: WorldProcess;
  onBack: () => void;
  onOpenInsight: (insightId: string) => void;
};

export function EvolutionScreen({ process, onBack, onOpenInsight }: Props) {
  const { t } = useI18n();
  const currentStageKey: TranslationKey = `evolution_${process.currentStage}`;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>{t('backProcess')}</Text>
          </Pressable>
          <LanguageSwitcher />
        </View>
        <Text style={styles.eyebrow}>{t('processEvolution')}</Text>
        <Text style={styles.title}>{process.title}</Text>
        <Text style={styles.summary}>{t('evolutionIntro')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.currentCard}>
          <Text style={styles.label}>{t('currentStage')}</Text>
          <View style={styles.stageRow}>
            <View style={styles.liveDot} />
            <Text style={styles.stage}>{t(currentStageKey)}</Text>
          </View>
          <Text style={styles.stageTitle}>{process.currentStageLabel}</Text>
          <Text style={styles.stageSummary}>{process.stageSummary}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('evolutionTimeline')}</Text>
        <View style={styles.timeline}>
          {process.evolution.map((item, index) => (
            <View key={item.id} style={styles.eventRow}>
              <View style={styles.rail}>
                <View style={[styles.dot, index === process.evolution.length - 1 && styles.dotCurrent]} />
                {index < process.evolution.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.eventBody}>
                <View style={styles.eventMeta}>
                  <Text style={styles.date}>{item.dateDisplay}</Text>
                  <Text style={styles.impact}>{t(impactKey(item.impact))}</Text>
                </View>
                <Text style={styles.eventStage}>{t(stageKey(item.stage))}</Text>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.implicationBox}>
                  <Text style={styles.implicationLabel}>{t('whatChanged')}</Text>
                  <Text style={styles.implication}>{item.implication}</Text>
                </View>
                {item.insightId ? (
                  <Pressable onPress={() => onOpenInsight(item.insightId!)} hitSlop={8}>
                    <Text style={styles.open}>{t('openInsight')} →</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.observeSection}>
          <Text style={styles.sectionLabel}>{t('observeNext')}</Text>
          {process.observeNext.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.observeRow}>
              <Text style={styles.observeNumber}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.observeText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function stageKey(stage: EvolutionStage): TranslationKey {
  return `evolution_${stage}`;
}

function impactKey(impact: EvolutionImpact): TranslationKey {
  return `impact_${impact}`;
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.paper, flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  eyebrow: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 2, marginTop: spacing.xl },
  title: { color: colors.ink, fontSize: 34, fontWeight: '800', letterSpacing: -1, lineHeight: 40, marginTop: spacing.sm },
  summary: { color: colors.gray600, fontSize: 14, lineHeight: 22, marginTop: spacing.md },
  content: { paddingBottom: 72, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  currentCard: { borderColor: colors.gray300, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg },
  label: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6 },
  stageRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: spacing.md },
  liveDot: { backgroundColor: colors.ink, borderRadius: 5, height: 10, width: 10 },
  stage: { color: colors.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  stageTitle: { color: colors.ink, fontSize: 24, fontWeight: '800', lineHeight: 31, marginTop: spacing.sm },
  stageSummary: { color: colors.gray600, fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
  sectionLabel: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6, marginBottom: spacing.lg, marginTop: spacing.xl },
  timeline: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth },
  eventRow: { flexDirection: 'row', minHeight: 220 },
  rail: { alignItems: 'center', width: 28 },
  dot: { backgroundColor: colors.gray400, borderRadius: 5, height: 10, marginTop: 26, width: 10 },
  dotCurrent: { backgroundColor: colors.ink, height: 13, width: 13 },
  line: { backgroundColor: colors.gray300, flex: 1, marginVertical: 6, width: 1 },
  eventBody: { borderBottomColor: colors.gray300, borderBottomWidth: StyleSheet.hairlineWidth, flex: 1, marginLeft: spacing.sm, paddingBottom: spacing.xl, paddingTop: spacing.lg },
  eventMeta: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  date: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  impact: { color: colors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  eventStage: { color: colors.gray600, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: spacing.md },
  eventTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', lineHeight: 28, marginTop: 8 },
  description: { color: colors.gray600, fontSize: 13, lineHeight: 21, marginTop: 8 },
  implicationBox: { backgroundColor: colors.gray100, marginTop: spacing.md, padding: spacing.md },
  implicationLabel: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  implication: { color: colors.ink, fontSize: 13, fontWeight: '600', lineHeight: 20, marginTop: 7 },
  open: { color: colors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: spacing.md },
  observeSection: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.xl },
  observeRow: { borderBottomColor: colors.gray300, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  observeNumber: { color: colors.gray500, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  observeText: { color: colors.ink, flex: 1, fontSize: 15, fontWeight: '700', lineHeight: 22 },
});
