import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { insightRepository } from '../engine/insightRepository';
import { worldProcessRepository } from '../engine/worldProcessRepository';
import { useI18n } from '../i18n/I18nProvider';
import { languageTypography } from '../i18n/typography';
import { useLivingMemory } from '../state/LivingMemoryProvider';
import type { InsightArchiveEntry } from '../types/insight';
import type { TranslationKey } from '../i18n/translations';
import type { WorldProcess } from '../types/worldProcess';
import { colors, spacing, type } from '../theme/tokens';


const SCREEN_WIDTH = Dimensions.get('window').width;
const PAGE_TRANSITION_MS = 230;
type Props = {
  process: WorldProcess;
  focusInsightId?: string;
  onBack: () => void;
  onOpenInsight: (insightId: string) => void;
  onOpenProcess: (processId: string) => void;
  onOpenConnections: () => void;
  onOpenEvolution: () => void;
};

export function WorldProcessScreen({
  process,
  focusInsightId,
  onBack,
  onOpenInsight,
  onOpenProcess,
  onOpenConnections,
  onOpenEvolution,
}: Props) {
  const { language, t } = useI18n();
  const typography = languageTypography(language);
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const leavingRef = useRef(false);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: PAGE_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  const leave = useCallback(
    (after: () => void) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      Animated.timing(translateX, {
        toValue: -SCREEN_WIDTH,
        duration: PAGE_TRANSITION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        leavingRef.current = false;
        if (finished) after();
      });
    },
    [translateX],
  );

  const swipeBack = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          gesture.dx < -18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.35,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx < 0) {
            translateX.setValue(Math.max(-SCREEN_WIDTH, gesture.dx));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -72 && gesture.vx < -0.12) {
            leave(onBack);
            return;
          }

          Animated.spring(translateX, {
            toValue: 0,
            speed: 24,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            speed: 24,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [leave, onBack, translateX],
  );
  const { isFollowing, rememberInsight, rememberProcess, toggleFollow } = useLivingMemory();
  const followed = isFollowing(process.id);

  React.useEffect(() => {
    rememberProcess(process.id);
  }, [process.id, rememberProcess]);
  const updates = useMemo(
    () =>
      insightRepository
        .getForProcess(process.id, language)
        .map<InsightArchiveEntry>((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.cover.title,
          summary: item.cover.summary,
          dateDisplay: item.dateDisplay,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
          confidence: item.confidence,
          status: item.status,
          language: item.language,
          usedFallback: item.usedFallback,
          processId: process.id,
          processTitle: process.title,
        })),
    [language, process.id, process.title],
  );
  const listRef = React.useRef<FlatList<InsightArchiveEntry>>(null);
  const focusIndex = useMemo(
    () =>
      focusInsightId
        ? updates.findIndex((item) => item.id === focusInsightId)
        : -1,
    [focusInsightId, updates],
  );

  React.useEffect(() => {
    if (focusIndex < 0) return;

    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: focusIndex,
        animated: true,
        viewPosition: 0.16,
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [focusIndex, process.id]);

  const connected = useMemo(
    () => worldProcessRepository.getConnected(process.id, language),
    [language, process.id],
  );

  const statusKey: TranslationKey = `process_${process.status}`;

  return (
    <Animated.View
      {...swipeBack.panHandlers}
      style={[styles.animatedRoot, { transform: [{ translateX }] }]}
    >
      <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable onPress={() => leave(onBack)} hitSlop={12}>
            <Text style={styles.back}>{t('backToday')}</Text>
          </Pressable>
          <LanguageSwitcher />
        </View>

        <Text style={[styles.screenTitle, { fontSize: typography.titleSize }]}>{t('worldProcess')}</Text>

        <View style={styles.growingRow}>
          <View style={styles.liveDot} />
          <Text style={styles.growing}>{t('growing')}</Text>
        </View>
        <Text style={styles.title}>{process.title}</Text>
        <Text style={styles.summary}>{process.summary}</Text>

        <View style={styles.metaRow}>
          <ConfidenceBadge level={process.confidence} />
          <Text style={styles.status}>{t(statusKey)}</Text>
          <Pressable
            onPress={() => toggleFollow(process.id)}
            style={({ pressed }) => [styles.followButton, pressed && styles.pressed]}
          >
            <Text style={styles.followButtonText}>{followed ? t('following') : t('followProcess')}</Text>
          </Pressable>
        </View>

        <View style={styles.dateGrid}>
          <View>
            <Text style={styles.dateLabel}>{t('started')}</Text>
            <Text style={styles.dateValue}>{process.startedDisplay}</Text>
          </View>
          <View>
            <Text style={styles.dateLabel}>{t('lastUpdated')}</Text>
            <Text style={styles.dateValue}>{process.updatedDisplay}</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={updates}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          listRef.current?.scrollToOffset({
            offset: Math.max(0, index * averageItemLength),
            animated: false,
          });
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.16,
            });
          }, 220);
        }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Section label={t('livingThesis')} body={process.thesis} />

            {process.latestEvolution ? (
              <View style={styles.latestChangeCard}>
                <View style={styles.latestChangeTop}>
                  <Text style={styles.sectionLabel}>
                    {language === 'zh'
                      ? '最新变化'
                      : language === 'ja'
                        ? '最新の変化'
                        : 'LATEST CHANGE'}
                  </Text>
                  <Text style={styles.latestChangeDate}>
                    {process.latestEvolution.dateDisplay}
                  </Text>
                </View>
                <Text style={styles.latestChangeTitle}>
                  {process.latestEvolution.title}
                </Text>
                <Text style={styles.latestChangeBody}>
                  {process.latestEvolution.description}
                </Text>
                <Text style={styles.latestChangeImplication}>
                  {process.latestEvolution.implication}
                </Text>
                <View style={styles.foundationMetaRow}>
                  <Text style={styles.foundationMeta}>
                    {language === 'zh'
                      ? `支持证据 ${process.supportingInsightIds.length}`
                      : language === 'ja'
                        ? `支持証拠 ${process.supportingInsightIds.length}`
                        : `SUPPORT ${process.supportingInsightIds.length}`}
                  </Text>
                  <Text style={styles.foundationMeta}>
                    {language === 'zh'
                      ? `反向证据 ${process.contradictingInsightIds.length}`
                      : language === 'ja'
                        ? `反証 ${process.contradictingInsightIds.length}`
                        : `CHALLENGE ${process.contradictingInsightIds.length}`}
                  </Text>
                  {typeof process.confidenceScore === 'number' ? (
                    <Text style={styles.foundationMeta}>
                      {language === 'zh'
                        ? `置信度 ${process.confidenceScore}`
                        : language === 'ja'
                          ? `確信度 ${process.confidenceScore}`
                          : `CONFIDENCE ${process.confidenceScore}`}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <View style={styles.domainRow}>
              {process.domains.map((domain) => (
                <View key={domain} style={styles.domainChip}>
                  <Text style={styles.domainText}>{domain}</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={onOpenEvolution}
              style={({ pressed }) => [styles.evolutionCard, pressed && styles.pressed]}
            >
              <View style={styles.evolutionTopRow}>
                <Text style={styles.sectionLabel}>{t('currentStage')}</Text>
                <Text style={styles.open}>{t('viewEvolution')} →</Text>
              </View>
              <Text style={styles.evolutionTitle}>{process.currentStageLabel}</Text>
              <Text style={styles.evolutionSummary}>{process.stageSummary}</Text>
            </Pressable>
            <Section label={t('nextQuestion')} body={process.nextQuestion} />
            {focusIndex >= 0 ? (
              <View style={styles.focusBanner}>
                <Text style={styles.focusBannerLabel}>
                  {language === 'zh'
                    ? '从历史洞察定位'
                    : language === 'ja'
                      ? '履歴インサイトから移動'
                      : 'LOCATED FROM HISTORY'}
                </Text>
                <Text style={styles.focusBannerText}>
                  {language === 'zh'
                    ? `第 ${updates.length - focusIndex} 章 / 共 ${updates.length} 章`
                    : language === 'ja'
                      ? `第${updates.length - focusIndex}章 / 全${updates.length}章`
                      : `CHAPTER ${updates.length - focusIndex} / ${updates.length}`}
                </Text>
              </View>
            ) : null}
            <View style={styles.storyHeader}>
              <Text style={styles.updatesLabel}>{t('storySoFar')}</Text>
              <Text style={styles.storyLabel}>{process.storyLabel}</Text>
            </View>
            {updates.length === 0 ? (
              <Text style={styles.empty}>{t('emptyProcess')}</Text>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => {
              rememberInsight(process.id, item.id);
              onOpenInsight(item.id);
            }}
            style={[
              styles.updateRow,
              item.id === focusInsightId && styles.focusedUpdateRow,
            ]}
          >
            <View style={styles.timelineColumn}>
              <View style={styles.timelineDot} />
              {index < updates.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.updateBody}>
              <View style={styles.chapterRow}>
                <Text style={styles.chapter}>
                  {t('chapter')} {String(updates.length - index).padStart(2, '0')}
                  {' / '}
                  {String(updates.length).padStart(2, '0')}
                </Text>
                {process.contradictingInsightIds.includes(item.id) ? (
                  <Text style={styles.challengeLabel}>
                    {language === 'zh'
                      ? '反向证据'
                      : language === 'ja'
                        ? '反証'
                        : 'CHALLENGE'}
                  </Text>
                ) : (
                  <Text style={styles.supportLabel}>
                    {language === 'zh'
                      ? '支持进程'
                      : language === 'ja'
                        ? '進行を支持'
                        : 'SUPPORTS'}
                  </Text>
                )}
              </View>
              {item.id === focusInsightId ? (
                <Text style={styles.currentChapterMarker}>
                  {language === 'zh'
                    ? '你从这里进入'
                    : language === 'ja'
                      ? 'ここから入りました'
                      : 'YOU ENTERED HERE'}
                </Text>
              ) : null}
              <Text style={styles.updateDate}>{item.dateDisplay}</Text>
              <Text style={styles.updateTitle}>{item.title}</Text>
              <Text style={styles.updateSummary}>{item.summary}</Text>
              <Text style={styles.open}>{t('open')} →</Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <View>
            {connected.length ? (
              <View style={styles.connectionsSection}>
                <View style={styles.connectionsHeading}>
                  <Text style={styles.updatesLabel}>{t('connectedProcesses')}</Text>
                  <Pressable onPress={onOpenConnections} hitSlop={12}>
                    <Text style={styles.open}>{t('viewConnections')} →</Text>
                  </Pressable>
                </View>
                {connected.map(({ process: item, relationship, score, why }) => (
                  <Pressable
                    key={item.id}
                    onPress={() => onOpenProcess(item.id)}
                    style={({ pressed }) => [styles.connectionCard, pressed && styles.pressed]}
                  >
                    <View style={styles.connectionMeta}>
                      <Text style={styles.relationship}>{relationship}</Text>
                      <Text style={styles.connectionScore}>{score}%</Text>
                    </View>
                    <Text style={styles.connectionTitle}>{item.title}</Text>
                    <Text style={styles.connectionSummary}>{item.summary}</Text>
                    <Text style={styles.connectionWhy}>{why}</Text>
                    <Text style={styles.open}>{t('openProcess')} →</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View style={styles.observeSection}>
              <Text style={styles.updatesLabel}>{t('observeNext')}</Text>
              {process.observeNext.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.observeRow}>
                  <Text style={styles.observeNumber}>{String(index + 1).padStart(2, '0')}</Text>
                  <Text style={styles.observeText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        }
      />
      </SafeAreaView>
    </Animated.View>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  animatedRoot: { flex: 1 },
  root: { backgroundColor: colors.paper, flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  screenTitle: { color: colors.ink, fontWeight: '800', letterSpacing: -0.5, marginTop: spacing.xl },
  back: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  growingRow: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: spacing.xl },
  liveDot: { backgroundColor: colors.ink, borderRadius: 4, height: 8, width: 8 },
  growing: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 38, fontWeight: '800', letterSpacing: -1.2, lineHeight: 44, marginTop: spacing.sm },
  summary: { color: colors.gray600, fontSize: 15, lineHeight: 23, marginTop: spacing.md },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: spacing.md },
  status: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  followButton: { borderColor: colors.gray300, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 7 },
  followButtonText: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  dateGrid: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 44, marginTop: spacing.lg, paddingTop: spacing.md },
  dateLabel: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  dateValue: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 5 },
  content: { paddingBottom: 56, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  section: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.lg },
  sectionLabel: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6 },
  sectionBody: { color: colors.ink, fontSize: 20, fontWeight: '700', lineHeight: 29, marginTop: spacing.sm },
  domainRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  domainChip: { borderColor: colors.gray300, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 11, paddingVertical: 7 },
  domainText: { color: colors.gray700, fontSize: 10, fontWeight: '700' },
  focusBanner: {
    borderColor: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  focusBannerLabel: {
    color: colors.gray500,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  focusBannerText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  storyHeader: { marginBottom: spacing.md, marginTop: spacing.md },
  updatesLabel: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6 },
  storyLabel: { color: colors.ink, fontSize: 18, fontWeight: '800', lineHeight: 25, marginTop: 8 },
  empty: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, color: colors.gray600, fontSize: 14, lineHeight: 22, paddingVertical: spacing.lg },
  updateRow: { flexDirection: 'row', minHeight: 162 },
  focusedUpdateRow: {
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
    paddingRight: spacing.sm,
  },
  timelineColumn: { alignItems: 'center', width: 24 },
  timelineDot: { backgroundColor: colors.ink, borderRadius: 5, height: 10, marginTop: 5, width: 10 },
  timelineLine: { backgroundColor: colors.gray300, flex: 1, marginVertical: 5, width: 1 },
  updateBody: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, flex: 1, marginLeft: spacing.sm, paddingBottom: spacing.lg, paddingTop: 2 },
  chapterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chapter: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  supportLabel: {
    color: colors.gray500,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  challengeLabel: {
    borderBottomColor: colors.ink,
    borderBottomWidth: 1,
    color: colors.ink,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    paddingBottom: 2,
  },
  currentChapterMarker: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 7,
  },
  updateDate: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginTop: 6 },
  updateTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', lineHeight: 27, marginTop: 8 },
  updateSummary: { color: colors.gray600, fontSize: 13, lineHeight: 20, marginTop: 7 },
  open: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 10 },
  connectionsSection: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.lg, paddingTop: spacing.lg },
  connectionsHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  connectionMeta: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  connectionScore: { color: colors.ink, fontSize: 11, fontWeight: '900' },
  connectionCard: { borderBottomColor: colors.gray300, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.lg },
  relationship: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  connectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', lineHeight: 28, marginTop: 8 },
  connectionSummary: { color: colors.gray600, fontSize: 13, lineHeight: 20, marginTop: 7 },
  connectionWhy: { color: colors.ink, fontSize: 12, lineHeight: 19, marginTop: 10 },
  latestChangeCard: {
    backgroundColor: colors.paper,
    borderColor: colors.gray300,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  latestChangeTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  latestChangeDate: {
    color: colors.gray500,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  latestChangeTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
    marginTop: spacing.md,
  },
  latestChangeBody: {
    color: colors.gray700,
    fontSize: 13,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  latestChangeImplication: {
    borderLeftColor: colors.ink,
    borderLeftWidth: 2,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: spacing.md,
    paddingLeft: spacing.md,
  },
  foundationMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.md,
  },
  foundationMeta: {
    color: colors.gray600,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  evolutionCard: { borderColor: colors.gray300, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.lg, padding: spacing.lg },
  evolutionTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  evolutionTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', lineHeight: 29, marginTop: spacing.md },
  evolutionSummary: { color: colors.gray600, fontSize: 13, lineHeight: 21, marginTop: spacing.sm },
  observeSection: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.xl, paddingTop: spacing.lg },
  observeRow: { borderBottomColor: colors.gray300, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  observeNumber: { color: colors.gray500, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  observeText: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 21 },
  pressed: { opacity: 0.55 },
});
