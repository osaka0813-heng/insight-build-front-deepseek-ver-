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
import { StatusLabel } from '../components/StatusLabel';
import { insightRepository } from '../engine/insightRepository';
import { researchDraftRepository } from '../engine/researchDraftRepository';
import { useI18n } from '../i18n/I18nProvider';
import { languageTypography } from '../i18n/typography';
import type { InsightArchiveEntry } from '../types/insight';
import { colors, spacing, type } from '../theme/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PAGE_TRANSITION_MS = 230;

type Props = {
  onBack: () => void;
  onOpenInsight: (id: string) => void;
  onOpenProcess?: (processId: string, focusInsightId: string) => void;
  onOpenResearch?: () => void;
};

export function ArchiveScreen({
  onBack,
  onOpenInsight,
  onOpenProcess,
  onOpenResearch,
}: Props) {
  const { language, t } = useI18n();
  const archive = useMemo(() => insightRepository.getArchive(language), [language]);
  const draftCount = researchDraftRepository.getDraftCount();
  const typography = languageTypography(language);
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
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
        toValue: SCREEN_WIDTH,
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
          gesture.dx > 18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.35,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx > 0) {
            translateX.setValue(Math.min(SCREEN_WIDTH, gesture.dx));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 72 && gesture.vx > 0.12) {
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
          <Text style={[styles.title, { fontSize: typography.titleSize }]}>{t('archiveTitle')}</Text>
          <Text style={styles.subtitle}>{t('archiveSubtitle')}</Text>
          {draftCount > 0 && onOpenResearch ? (
            <Pressable onPress={onOpenResearch} style={styles.researchButton}>
              <Text style={styles.researchButtonText}>{t('openResearchDrafts')} · {draftCount}</Text>
            </Pressable>
          ) : null}
        </View>
        <FlatList
          contentContainerStyle={styles.list}
          data={archive}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArchiveCard
              item={item}
              onPress={() => leave(() => onOpenInsight(item.id))}
              onOpenProcess={
                item.processId && onOpenProcess
                  ? () => leave(() => onOpenProcess(item.processId!, item.id))
                  : undefined
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

type CardProps = {
  item: InsightArchiveEntry;
  onPress: () => void;
  onOpenProcess?: () => void;
};
function ArchiveCard({ item, onPress, onOpenProcess }: CardProps) {
  const { t } = useI18n();
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardTop}><StatusLabel status={item.status} /><Text style={styles.date}>{item.dateDisplay}</Text></View>
      {item.processTitle ? (
        <Pressable
          disabled={!onOpenProcess}
          onPress={onOpenProcess}
          hitSlop={8}
          style={({ pressed }) => [
            styles.processContext,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.processContextLabel}>{t('worldProcess')}</Text>
          <Text style={styles.processContextTitle} numberOfLines={1}>
            {item.processTitle}
          </Text>
          {item.processChapter && item.processChapterCount ? (
            <Text style={styles.processContextChapter}>
              {t('chapter')} {String(item.processChapter).padStart(2, '0')}
              {' / '}
              {String(item.processChapterCount).padStart(2, '0')}
            </Text>
          ) : null}
        </Pressable>
      ) : null}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.summary}>{item.summary}</Text>
      <View style={styles.cardBottom}>
        <View style={styles.badgeRow}>
          <ConfidenceBadge level={item.confidence} />
          {item.usedFallback ? <Text style={styles.fallback}>{t('fallback')}</Text> : null}
        </View>
        <Text style={styles.open}>{t('open')} →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  animatedRoot: { flex: 1 },
  root: { backgroundColor: colors.paper, flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: colors.ink, fontWeight: '800', letterSpacing: -0.5, marginTop: spacing.xl },
  subtitle: { color: colors.gray600, fontSize: 15, lineHeight: 22, marginTop: spacing.sm, maxWidth: 330 },
  researchButton: { alignSelf: 'flex-start', borderColor: colors.gray300, borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, marginTop: spacing.md, paddingHorizontal: 12, paddingVertical: 8 },
  researchButtonText: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  list: { paddingBottom: 48, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  card: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.lg },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  date: { color: colors.gray500, fontSize: type.micro, letterSpacing: 0.8 },
  processContext: {
    alignItems: 'center',
    borderBottomColor: colors.gray300,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.md,
    paddingBottom: 9,
  },
  processContextLabel: {
    color: colors.gray500,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  processContextTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
  },
  processContextChapter: {
    color: colors.gray500,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  cardTitle: { color: colors.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.3, lineHeight: 31, marginTop: spacing.md },
  summary: { color: colors.gray600, fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
  cardBottom: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  badgeRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  fallback: { color: colors.gray500, fontSize: 9 },
  open: { color: colors.ink, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  pressed: { opacity: 0.55 },
});
