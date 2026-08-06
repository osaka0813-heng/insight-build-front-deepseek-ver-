import React, { useCallback, useMemo, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AttentionReveal } from '../components/AttentionReveal';
import { DailyStateBadge } from '../components/DailyStateBadge';
import { DailyContinuityCard } from '../components/DailyContinuityCard';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/I18nProvider';
import type { DailyState } from '../types/dailyState';
import type { DailyContinuity } from '../types/dailyContinuity';
import type { WorldProcess } from '../types/worldProcess';
import { colors, spacing, type } from '../theme/tokens';

type Props = {
  dailyState: DailyState;
  continuity: DailyContinuity;
  process?: WorldProcess;
  previousInsightTitle?: string;
  onOpenPreviousInsight: () => void;
  onOpenProcess?: () => void;
  onOpenArchive: () => void;
  onOpenEditorial?: () => void;
};

export function NoNewGlobalInsightScreen({
  dailyState,
  continuity,
  process,
  previousInsightTitle,
  onOpenPreviousInsight,
  onOpenProcess,
  onOpenArchive,
  onOpenEditorial,
}: Props) {
  const { language, t } = useI18n();
  const adminTapCount = useRef(0);
  const adminTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerAdminTap = useCallback(() => {
    if (!onOpenEditorial) return;
    adminTapCount.current += 1;
    if (adminTapTimer.current) clearTimeout(adminTapTimer.current);
    if (adminTapCount.current >= 5) {
      adminTapCount.current = 0;
      onOpenEditorial();
      return;
    }
    adminTapTimer.current = setTimeout(() => {
      adminTapCount.current = 0;
    }, 2200);
  }, [onOpenEditorial]);
  const insets = useSafeAreaInsets();
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.35,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 72 && gesture.vx > 0.12) {
            onOpenProcess?.();
            return;
          }
          if (gesture.dx < -72 && gesture.vx < -0.12) {
            onOpenArchive();
          }
        },
      }),
    [onOpenArchive, onOpenProcess],
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.language, { top: insets.top + 12 }]}>
        <LanguageSwitcher />
      </View>
      <ScrollView
        {...swipe.panHandlers}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AttentionReveal active delay={0}>
          <View style={styles.dateRow}>
            <Pressable
              onPress={triggerAdminTap}
              onLongPress={onOpenEditorial}
              delayLongPress={1800}
              disabled={!onOpenEditorial}
              hitSlop={16}
              accessibilityLabel="Edition date"
            >
              <Text style={styles.date}>{dailyState.date}</Text>
            </Pressable>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.eyebrow}>{t('todayObservation')}</Text>
            <DailyStateBadge label={dailyState.label} state={dailyState.state} />
          </View>
        </AttentionReveal>

        <AttentionReveal active delay={90} rise={16}>
          <Text style={styles.title}>{dailyState.decisionTitle}</Text>
          <View style={styles.rule} />
          <Text style={styles.summary}>{dailyState.decisionSummary}</Text>
        </AttentionReveal>

        <AttentionReveal active delay={145}>
          <DailyContinuityCard continuity={continuity} />
        </AttentionReveal>

        <AttentionReveal active delay={200}>
          <SectionLabel text={t('whatChangedToday')} />
          {dailyState.candidates.map((candidate) => (
            <View key={candidate.id} style={styles.signalRow}>
              <View style={styles.signalDot} />
              <View style={styles.signalBody}>
                <Text style={styles.signalTitle}>{candidate.title}</Text>
                <Text style={styles.signalSummary}>{candidate.summary}</Text>
              </View>
            </View>
          ))}
        </AttentionReveal>

        <AttentionReveal active delay={260}>
          <SectionLabel text={t('whyNoNewInsight')} />
          <Text style={styles.reason}>{dailyState.thresholdReason}</Text>
        </AttentionReveal>

        {process ? (
          <AttentionReveal active delay={320}>
            <SectionLabel text={t('stillDeveloping')} />
            <Pressable
              disabled={!onOpenProcess}
              onPress={onOpenProcess}
              style={({ pressed }) => [styles.processCard, pressed && styles.pressed]}
            >
              <Text style={styles.processKicker}>{t('worldProcess')}</Text>
              <Text style={styles.processTitle}>{process.title}</Text>
              <Text style={styles.processSummary}>{process.summary}</Text>
              {onOpenProcess ? <Text style={styles.open}>{t('openProcess')} →</Text> : null}
            </Pressable>
          </AttentionReveal>
        ) : null}

        {dailyState.observeNext?.length ? (
          <AttentionReveal active delay={380}>
            <SectionLabel text={t('observeNext')} />
            {dailyState.observeNext.map((item, index) => (
              <View key={`${index}-${item}`} style={styles.observeRow}>
                <Text style={styles.observeIndex}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={styles.observeText}>{item}</Text>
              </View>
            ))}
          </AttentionReveal>
        ) : null}

        <AttentionReveal active delay={440}>
          <View style={styles.previousSection}>
            <Text style={styles.previousLabel}>{t('lastMeaningfulUpdate')}</Text>
            {previousInsightTitle ? (
              <Text style={styles.previousTitle}>{previousInsightTitle}</Text>
            ) : null}
            <Pressable
              onPress={onOpenPreviousInsight}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>{t('continuePreviousInsight')}</Text>
            </Pressable>
          </View>

          <View style={styles.navRow}>
            <Text style={styles.navActive}>{t('today')}</Text>
            {onOpenProcess ? (
              <Pressable onPress={onOpenProcess} hitSlop={12}>
                <Text style={styles.navMuted}>{t('worldProcess')}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onOpenArchive} hitSlop={12}>
              <Text style={styles.navMuted}>{t('archive')}</Text>
            </Pressable>
          </View>
        </AttentionReveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.paper, flex: 1 },
  language: { position: 'absolute', right: 20, zIndex: 20 },
  content: { paddingBottom: 56, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  date: { color: colors.ink, fontSize: type.micro, fontWeight: '800', letterSpacing: 2 },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 76,
  },
  editorialEntry: {
    borderBottomColor: colors.gray500,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 3,
    paddingHorizontal: 2,
    paddingTop: 3,
  },
  editorialEntryText: {
    color: colors.gray600,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  metaRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingRight: 82 },
  eyebrow: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 38, fontWeight: '800', letterSpacing: -1.3, lineHeight: 45, marginTop: 54 },
  rule: { backgroundColor: colors.ink, height: 2, marginVertical: spacing.lg, width: 32 },
  summary: { color: colors.gray700, fontSize: 16, lineHeight: 25 },
  sectionLabel: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.5, marginTop: 36, paddingTop: spacing.md },
  signalRow: { flexDirection: 'row', marginTop: spacing.md },
  signalDot: { backgroundColor: colors.ink, borderRadius: 4, height: 8, marginTop: 7, width: 8 },
  signalBody: { flex: 1, marginLeft: 12 },
  signalTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', lineHeight: 23 },
  signalSummary: { color: colors.gray600, fontSize: 13, lineHeight: 20, marginTop: 5 },
  reason: { color: colors.ink, fontSize: 18, fontWeight: '700', lineHeight: 27, marginTop: spacing.md },
  processCard: { backgroundColor: colors.ink, marginTop: spacing.md, padding: spacing.lg },
  processKicker: { color: colors.gray400, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.4 },
  processTitle: { color: colors.white, fontSize: 25, fontWeight: '800', lineHeight: 31, marginTop: 10 },
  processSummary: { color: colors.gray300, fontSize: 13, lineHeight: 20, marginTop: 9 },
  open: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: spacing.md },
  observeRow: { borderBottomColor: colors.gray300, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: spacing.md },
  observeIndex: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.2, width: 34 },
  observeText: { color: colors.ink, flex: 1, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  previousSection: { marginTop: 40 },
  previousLabel: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.4 },
  previousTitle: { color: colors.ink, fontSize: 19, fontWeight: '800', lineHeight: 26, marginTop: 9 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.ink, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 14 },
  primaryButtonText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  navRow: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 18, marginTop: 34, paddingTop: spacing.md },
  navActive: { color: colors.ink, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.5 },
  navMuted: { color: colors.gray400, fontSize: type.micro, fontWeight: '700', letterSpacing: 1.5 },
  pressed: { opacity: 0.58 },
});
