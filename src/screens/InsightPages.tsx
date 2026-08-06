import React, { useCallback, useRef } from 'react';
import { readingTempo, revealMotion } from '../animations/readingTempo';
import { useI18n } from '../i18n/I18nProvider';
import { languageTypography } from '../i18n/typography';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AttentionReveal } from '../components/AttentionReveal';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { DailyStateBadge } from '../components/DailyStateBadge';
import { DailyContinuityCard } from '../components/DailyContinuityCard';
import { BreathingTitle } from '../components/BreathingTitle';
import { SectionHeader } from '../components/SectionHeader';
import { SignalCard } from '../components/SignalCard';
import type { ExplorerRoot } from '../components/ExplorerSheet';
import { enrichSignal } from '../data/signalExplorerSeed';
import type { InsightEdition } from '../types/insight';
import type { DailyState } from '../types/dailyState';
import type { DailyContinuity } from '../types/dailyContinuity';
import { colors, leading, spacing, type } from '../theme/tokens';
import { PageShell } from './PageShell';

type Props = {
  onOpenEditorial?: () => void;
  active: boolean;
  edition: InsightEdition;
  forceVisible: boolean;
  height: number;
  onExplore: (root: ExplorerRoot) => void;
  dailyState?: DailyState;
  continuity?: DailyContinuity;
};

type ObserveProps = Props & {
  onOpenArchive: () => void;
  onOpenProcess?: () => void;
  onOpenDailyLanding?: () => void;
};

export function CoverPage({
  active,
  edition,
  forceVisible,
  height,
  onExplore,
  dailyState,
  onOpenEditorial,
}: Props) {
  const { language, t } = useI18n();
  const typography = languageTypography(language);
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
  return (
    <PageShell height={height}>
      <AttentionReveal
        active={active}
        delay={readingTempo.cover.date}
        forceVisible={forceVisible}
      >
        <View>
          <View style={styles.dateRow}>
            <Pressable
              onPress={triggerAdminTap}
              onLongPress={onOpenEditorial}
              delayLongPress={1800}
              disabled={!onOpenEditorial}
              hitSlop={16}
              accessibilityLabel="Edition date"
            >
              <Text style={styles.date}>{edition.dateDisplay}</Text>
            </Pressable>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.observationLabel}>{edition.cover.eyebrow}</Text>
            <View style={styles.coverMetaActions}>
              {dailyState ? <DailyStateBadge label={dailyState.label} state={dailyState.state} /> : null}
              <ConfidenceBadge level={edition.confidence} />
            </View>
          </View>
        </View>
      </AttentionReveal>

      <View style={styles.coverCenter}>
        <AttentionReveal
          active={active}
          delay={readingTempo.cover.title}
          duration={revealMotion.titleDuration}
          forceVisible={forceVisible}
          rise={18}
        >
          <BreathingTitle active={active} disabled={forceVisible} startDelay={3200}>
            <Text style={[styles.coverTitle, { fontSize: typography.displaySize, letterSpacing: typography.displayLetterSpacing, lineHeight: typography.displaySize * typography.lineHeightMultiplier }]}>{edition.cover.title}</Text>
          </BreathingTitle>
        </AttentionReveal>

        <AttentionReveal
          active={active}
          delay={readingTempo.cover.summary}
          forceVisible={forceVisible}
        >
          <View style={styles.shortRule} />
          <Text style={styles.coverSummary}>{edition.cover.summary}</Text>
        </AttentionReveal>
      </View>

      <AttentionReveal
        active={active}
        delay={readingTempo.cover.swipe}
        forceVisible={forceVisible}
      >
        <View>
          <Text style={styles.swipeZh}>{t('swipe')}</Text>
        </View>
      </AttentionReveal>
    </PageShell>
  );
}

export function QuestionPage({
  active,
  edition,
  forceVisible,
  height,
  onExplore,
}: Props) {
  const { language, t } = useI18n();
  const typography = languageTypography(language);
  return (
    <PageShell height={height}>
      <AttentionReveal active={active} delay={readingTempo.question.header} forceVisible={forceVisible}>
        <SectionHeader index="01" label={t('question')} secondary={t('questionSub')} />
      </AttentionReveal>

      <View style={styles.questionContent}>
        <AttentionReveal
          active={active}
          delay={readingTempo.question.title}
          duration={revealMotion.titleDuration}
          forceVisible={forceVisible}
          rise={18}
        >
          <Pressable onPress={() => onExplore({ kind: 'topic', topic: { id: 'question', knowledgeHome: 'none', label: t('question'), title: edition.question.title, sections: [{ title: t('whyImportant'), body: edition.question.footnote }] } })} style={({ pressed }) => pressed && styles.explorablePressed}>
            <BreathingTitle active={active} disabled={forceVisible}>
              <Text style={[styles.questionTitle, { fontSize: typography.heroSize, letterSpacing: typography.heroLetterSpacing, lineHeight: typography.heroSize * typography.lineHeightMultiplier }]}>{edition.question.title}</Text>
              <Text style={styles.exploreHint}>{t('explore')} →</Text>
            </BreathingTitle>
          </Pressable>
        </AttentionReveal>
        <AttentionReveal
          active={active}
          delay={readingTempo.question.lead}
          forceVisible={forceVisible}
        >
          <Text style={[styles.questionLead, styles.questionLeadAfter]}>{edition.question.lead}</Text>
        </AttentionReveal>
      </View>

      <View pointerEvents="none" style={styles.questionLayoutSpacer} />
    </PageShell>
  );
}

export function SignalsPage({
  active,
  edition,
  forceVisible,
  height,
  onExplore,
}: Props) {
  const { language, t } = useI18n();
  const typography = languageTypography(language);
  return (
    <PageShell height={height}>
      <View>
        <AttentionReveal active={active} delay={readingTempo.signals.header} forceVisible={forceVisible}>
          <SectionHeader index="02" label={t('signals')} secondary={t('signalsSub')} />
        </AttentionReveal>
        <AttentionReveal
          active={active}
          delay={readingTempo.signals.title}
          forceVisible={forceVisible}
        >
          <Text style={[styles.sectionTitle, { fontSize: typography.titleSize, lineHeight: typography.titleSize * typography.lineHeightMultiplier }]}>{edition.signals.title}</Text>
        </AttentionReveal>
      </View>

      <View style={styles.signalList}>
        {edition.signals.items.map((signal, index) => (
          <AttentionReveal
            active={active}
            delay={readingTempo.signals.cards[index]}
            forceVisible={forceVisible}
            key={signal.id}
          >
            <SignalCard index={index} onPress={() => onExplore({ kind: 'signal', signal: enrichSignal(signal, language) })} signal={signal} />
          </AttentionReveal>
        ))}
      </View>

      <AttentionReveal
        active={active}
        delay={readingTempo.signals.source}
        forceVisible={forceVisible}
      >
        <Text style={styles.sourceNote}>{edition.signals.sourceNote}</Text>
      </AttentionReveal>
    </PageShell>
  );
}

export function PatternPage({
  active,
  edition,
  forceVisible,
  height,
  onExplore,
}: Props) {
  const { language, t } = useI18n();
  const typography = languageTypography(language);
  return (
    <PageShell height={height}>
      <View>
        <AttentionReveal active={active} delay={readingTempo.pattern.header} forceVisible={forceVisible}>
          <SectionHeader index="03" label={t('pattern')} secondary={t('patternSub')} />
        </AttentionReveal>
        <AttentionReveal
          active={active}
          delay={readingTempo.pattern.title}
          forceVisible={forceVisible}
        >
          <Text style={[styles.sectionTitle, { fontSize: typography.titleSize, lineHeight: typography.titleSize * typography.lineHeightMultiplier }]}>{edition.pattern.title}</Text>
        </AttentionReveal>
      </View>

      <View style={styles.patternFlow}>
        <AttentionReveal
          active={active}
          delay={readingTempo.pattern.before}
          forceVisible={forceVisible}
        >
          <PatternStep label={t('before')} text={edition.pattern.before} />
        </AttentionReveal>
        <AttentionReveal
          active={active}
          delay={readingTempo.pattern.shift}
          forceVisible={forceVisible}
        >
          <View style={styles.patternConnector} />
          <PatternStep
            emphasized
            label={t('shift')}
            text={edition.pattern.shift}
            hint={t('explore')}
            onPress={() => onExplore({ kind: 'topic', topic: { id: 'pattern-shift', knowledgeHome: 'systemMap', label: t('shift'), title: edition.pattern.shift, summary: edition.pattern.conclusion, sections: [{ title: t('signals'), body: edition.signals.items.map((signal) => signal.title).join(' · ') }] } })}
          />
        </AttentionReveal>
        <AttentionReveal
          active={active}
          delay={readingTempo.pattern.now}
          forceVisible={forceVisible}
        >
          <View style={styles.patternConnector} />
          <PatternStep label={t('now')} text={edition.pattern.now} />
        </AttentionReveal>
      </View>

      <View pointerEvents="none" style={styles.patternLayoutSpacer} />
    </PageShell>
  );
}

export function HeroInsightPage({
  active,
  edition,
  forceVisible,
  height,
  onExplore,
}: Props) {
  const { language, t } = useI18n();
  const typography = languageTypography(language);
  return (
    <PageShell height={height} tone="ink">
      <AttentionReveal
        active={active}
        delay={readingTempo.insight.brand}
        forceVisible={forceVisible}
      >
        <View style={styles.heroBrandRow}>
          <Text style={styles.heroBrand}>{t('insight')}</Text>
        </View>
      </AttentionReveal>

      <View style={styles.heroContent}>
        <View pointerEvents="none" style={styles.heroPromptSpacer} />

        <AttentionReveal
          active={active}
          delay={readingTempo.insight.title}
          duration={revealMotion.heroDuration}
          forceVisible={forceVisible}
          rise={22}
        >
          <Pressable onPress={() => onExplore({ kind: 'topic', topic: { id: 'hero-insight', knowledgeHome: 'related', label: t('insight'), title: edition.insight.title, summary: edition.insight.explanation, sections: [{ title: t('evidence'), body: edition.insight.formula }, { title: t('signals'), body: edition.signals.items.map((signal) => signal.title).join(' · ') }] } })} style={({ pressed }) => pressed && styles.explorablePressed}>
            <BreathingTitle active={active} disabled={forceVisible} startDelay={3600}>
              <Text style={[styles.heroTitle, { fontSize: typography.heroSize, letterSpacing: typography.heroLetterSpacing, lineHeight: typography.heroSize * typography.lineHeightMultiplier }]}>{edition.insight.title}</Text>
              <Text style={styles.exploreHintInverse}>{t('explore')} →</Text>
            </BreathingTitle>
          </Pressable>
        </AttentionReveal>

        <View pointerEvents="none" style={styles.heroFormulaSpacer} />
      </View>

      <View pointerEvents="none" style={styles.heroBottomSpacer} />
    </PageShell>
  );
}

export function ObservePage({
  active,
  edition,
  forceVisible,
  height,
  onOpenArchive,
  onOpenProcess,
  onOpenDailyLanding,
  onExplore,
  dailyState,
  continuity,
}: ObserveProps) {
  const { language, t } = useI18n();
  const typography = languageTypography(language);
  return (
    <PageShell height={height}>
      <ScrollView
        contentContainerStyle={styles.observeScrollContent}
        directionalLockEnabled
        nestedScrollEnabled
        showsVerticalScrollIndicator
        style={styles.observeScroll}
      >
        <View>
          <AttentionReveal active={active} delay={readingTempo.observe.header} forceVisible={forceVisible}>
            <SectionHeader index="05" label={t('observeNext')} secondary={t('observeNextSub')} />
          </AttentionReveal>
          <AttentionReveal
            active={active}
            delay={readingTempo.observe.title}
            forceVisible={forceVisible}
          >
            <Text style={[styles.sectionTitle, { fontSize: typography.titleSize, lineHeight: typography.titleSize * typography.lineHeightMultiplier }]}>{edition.observe.title}</Text>
          </AttentionReveal>
        </View>

        <View style={styles.observeItems}>
          {edition.observe.items.map((item, index) => (
            <AttentionReveal
              active={active}
              delay={readingTempo.observe.items[index]}
              forceVisible={forceVisible}
              key={item.meta}
            >
              <Pressable onPress={() => onExplore({ kind: 'topic', topic: { id: `observe-${index}`, knowledgeHome: 'timeline', label: t('observeNext'), title: item.label, summary: item.prompt, sections: [{ title: item.meta, body: edition.observe.ending }] } })} style={({ pressed }) => [styles.observeRow, pressed && styles.explorablePressed]}>
                <View style={styles.observeTop}>
                  <Text style={styles.observeLabel}>{item.label}</Text>
                  <Text style={styles.observeMeta}>{item.meta}</Text>
                </View>
                <Text style={styles.observePrompt}>{item.prompt}</Text>
                <Text style={styles.exploreHint}>{t('explore')} →</Text>
              </Pressable>
            </AttentionReveal>
          ))}
        </View>

        {continuity ? (
          <AttentionReveal
            active={active}
            delay={readingTempo.observe.ending - 80}
            forceVisible={forceVisible}
          >
            <DailyContinuityCard continuity={continuity} compact />
          </AttentionReveal>
        ) : null}

        {dailyState ? (
          <AttentionReveal
            active={active}
            delay={readingTempo.observe.ending - 40}
            forceVisible={forceVisible}
          >
            <View style={styles.dailyDecision}>
              <View style={styles.dailyDecisionTop}>
                <Text style={styles.dailyDecisionLabel}>{t('dailyDecision')}</Text>
                <DailyStateBadge label={dailyState.label} state={dailyState.state} />
              </View>
              <Text style={styles.dailyDecisionTitle}>{dailyState.decisionTitle}</Text>
              <Text style={styles.dailyDecisionSummary}>{dailyState.decisionSummary}</Text>
            </View>
          </AttentionReveal>
        ) : null}

        <AttentionReveal
          active={active}
          delay={readingTempo.observe.ending}
          forceVisible={forceVisible}
        >
          <View>
            <Text style={styles.observeEnding}>{edition.observe.ending}</Text>
            <View style={styles.navRow}>
              {onOpenDailyLanding ? (
                <Pressable onPress={onOpenDailyLanding} hitSlop={12}>
                  <Text style={styles.navActive}>{t('today')}</Text>
                </Pressable>
              ) : (
                <Text style={styles.navActive}>{t('today')}</Text>
              )}
              {onOpenProcess ? (
                <Pressable onPress={onOpenProcess} hitSlop={12}>
                  <Text style={styles.navMuted}>{t('worldProcess')}</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={onOpenArchive} hitSlop={12}>
                <Text style={styles.navMuted}>{t('archive')}</Text>
              </Pressable>
            </View>
          </View>
        </AttentionReveal>
      </ScrollView>
    </PageShell>
  );
}

type PatternStepProps = {
  label: string;
  text: string;
  emphasized?: boolean;
  onPress?: () => void;
  hint?: string;
};

function PatternStep({ label, text, emphasized, onPress, hint }: PatternStepProps) {
  const content = (
    <>
      <Text style={[styles.patternLabel, emphasized && styles.patternLabelEmphasis]}>{label}</Text>
      <Text style={[styles.patternText, emphasized && styles.patternTextEmphasis]}>{text}</Text>
      {onPress && hint ? (
        <Text style={emphasized ? styles.exploreHintInverse : styles.exploreHint}>{hint} →</Text>
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.patternStep, emphasized && styles.patternStepEmphasis]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.patternStep,
        emphasized && styles.patternStepEmphasis,
        pressed && styles.explorablePressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  date: {
    color: colors.ink,
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 2,
  },
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
  editorialEntryPressed: {
    opacity: 0.45,
  },
  editorialEntryText: {
    color: colors.gray600,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  coverMetaActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  coverMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 6,
    // Keep the daily-state and confidence badges clear of the floating
    // language switcher in the upper-right corner.
    paddingRight: 76,
  },
  observationLabel: {
    color: colors.gray500,
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  edition: {
    color: colors.gray500,
    fontSize: type.micro,
    letterSpacing: 1.4,
    marginTop: 4,
  },
  coverCenter: {
    maxWidth: 330,
    transform: [{ translateY: -22 }],
  },
  eyebrow: {
    color: colors.ink,
    fontSize: type.caption,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  eyebrowZh: {
    color: colors.gray500,
    fontSize: type.caption,
    marginTop: 4,
  },
  coverTitle: {
    color: colors.ink,
    fontSize: type.display,
    fontWeight: '800',
    letterSpacing: -1.8,
    lineHeight: type.display * leading.tight,
    marginTop: spacing.lg,
  },
  shortRule: {
    backgroundColor: colors.ink,
    height: 2,
    marginVertical: spacing.lg,
    width: 32,
  },
  coverSummary: {
    color: colors.gray700,
    fontSize: 15,
    lineHeight: 24,
  },
  swipeZh: {
    color: colors.gray600,
    fontSize: type.caption,
  },
  swipeEn: {
    color: colors.gray400,
    fontSize: type.micro,
    letterSpacing: 1.8,
    marginTop: 4,
  },
  questionContent: {
    transform: [{ translateY: -58 }],
  },
  questionLayoutSpacer: {
    height: 70,
  },
  questionLead: {
    color: colors.gray600,
    fontSize: type.body,
    lineHeight: 27,
  },
  questionLeadAfter: {
    marginTop: spacing.lg,
  },
  questionTitle: {
    color: colors.ink,
    fontSize: type.hero,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: type.hero * 1.16,
  },
  bottomNote: {
    borderTopColor: colors.gray300,
    borderTopWidth: StyleSheet.hairlineWidth,
    color: colors.gray600,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: type.title,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: type.title * 1.2,
    marginTop: spacing.xl,
  },
  signalList: {
    marginVertical: spacing.sm,
  },
  sourceNote: {
    color: colors.gray500,
    fontSize: 10,
    lineHeight: 15,
  },
  patternLayoutSpacer: {
    height: 48,
  },
  patternFlow: {
    paddingVertical: spacing.sm,
  },
  patternStep: {
    backgroundColor: colors.paperElevated,
    borderColor: colors.gray200,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  patternStepEmphasis: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  patternConnector: {
    backgroundColor: colors.gray300,
    height: 14,
    marginLeft: 23,
    width: 1,
  },
  patternLabel: {
    color: colors.gray500,
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  patternLabelEmphasis: {
    color: colors.gray300,
  },
  patternText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  patternTextEmphasis: {
    color: colors.white,
  },
  patternConclusion: {
    color: colors.gray700,
    fontSize: 15,
    lineHeight: 23,
  },
  heroBrandRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroContent: {
    transform: [{ translateY: -20 }],
  },
  heroPromptSpacer: {
    height: 12,
  },
  heroFormulaSpacer: {
    height: 64,
  },
  heroBottomSpacer: {
    height: 58,
  },
  heroBrand: {
    color: colors.white,
    fontSize: type.caption,
    fontWeight: '800',
    letterSpacing: 4.2,
  },
  heroBrandZh: {
    color: colors.gray400,
    fontSize: type.micro,
    letterSpacing: 2,
  },
  heroPrompt: {
    color: colors.gray300,
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  heroPromptZh: {
    color: colors.gray500,
    fontSize: type.micro,
    marginTop: 5,
  },
  heroTitle: {
    color: colors.white,
    fontSize: type.hero,
    fontWeight: '800',
    letterSpacing: -1.6,
    lineHeight: type.hero * 1.14,
    marginTop: spacing.lg,
  },
  heroRule: {
    backgroundColor: colors.white,
    height: 2,
    marginVertical: spacing.lg,
    width: 34,
  },
  heroFormula: {
    color: colors.gray300,
    fontSize: 13,
    letterSpacing: 0.4,
    lineHeight: 20,
  },
  heroExplanation: {
    color: colors.gray200,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  heroUpdated: {
    color: colors.gray500,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  observeScroll: { flex: 1 },
  observeScrollContent: { paddingBottom: spacing.xl },
  observeItems: { marginTop: spacing.lg },
  observeRow: {
    borderTopColor: colors.gray300,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
  },
  observeTop: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  observeLabel: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  observeMeta: {
    color: colors.gray500,
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  observePrompt: {
    color: colors.gray600,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  observeEnding: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  dailyDecision: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingTop: spacing.md },
  dailyDecisionTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  dailyDecisionLabel: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.2 },
  dailyDecisionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', lineHeight: 22, marginTop: 10 },
  dailyDecisionSummary: { color: colors.gray600, fontSize: 12, lineHeight: 18, marginTop: 6 },
  navRow: {
    borderTopColor: colors.gray300,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 18,
    paddingTop: spacing.md,
  },
  navActive: {
    color: colors.ink,
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  navMuted: {
    color: colors.gray400,
    fontSize: type.micro,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  exploreHint: { color: colors.gray500, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 8 },
  exploreHintInverse: { color: colors.gray400, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 8 },
  explorablePressed: { opacity: 0.66, transform: [{ scale: 0.99 }] },
});
