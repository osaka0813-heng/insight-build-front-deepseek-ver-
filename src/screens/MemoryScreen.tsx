import React, { useEffect, useMemo, useRef } from 'react';
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
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { worldProcessRepository } from '../engine/worldProcessRepository';
import { useI18n } from '../i18n/I18nProvider';
import type { TranslationKey } from '../i18n/translations';
import { useLivingMemory } from '../state/LivingMemoryProvider';
import type { WorldProcess } from '../types/worldProcess';
import { colors, spacing, type } from '../theme/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PAGE_TRANSITION_MS = 230;

type Props = {
  onBack: () => void;
  onOpenProcess: (processId: string) => void;
};

export function MemoryScreen({ onBack, onOpenProcess }: Props) {
  const { language, t } = useI18n();
  const { followedProcessIds } = useLivingMemory();
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

  const leave = React.useCallback(
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

  const allProcesses = useMemo(() => worldProcessRepository.getAll(language), [language]);
  const processes = useMemo(() => {
    const rank = new Map(followedProcessIds.map((id, index) => [id, index]));
    return [...allProcesses].sort((a, b) => {
      const aRank = rank.get(a.id);
      const bRank = rank.get(b.id);
      if (aRank !== undefined || bRank !== undefined) {
        if (aRank === undefined) return 1;
        if (bRank === undefined) return -1;
        return aRank - bRank;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [allProcesses, followedProcessIds]);



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
          <Text style={styles.kicker}>{t('knowledgeAccumulated')}</Text>
          <Text style={styles.title}>{t('myWorld')}</Text>
        </View>

        <FlatList
          data={processes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>{t('livingProcesses')}</Text>
          }
          renderItem={({ item }) => (
            <ProcessCard
              followed={followedProcessIds.includes(item.id)}
              process={item}
              onPress={() => onOpenProcess(item.id)}
            />
          )}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

function ProcessCard({
  followed,
  process,
  onPress,
}: {
  followed: boolean;
  process: WorldProcess;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const statusKey: TranslationKey = `process_${process.status}`;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardMeta}>
        <Text style={styles.status}>{t(statusKey)}</Text>
        <Text style={styles.updated}>{followed ? t('following') : process.updatedDisplay}</Text>
      </View>
      <Text style={styles.cardTitle}>{process.title}</Text>
      <Text style={styles.cardSummary}>{process.summary}</Text>
      <View style={styles.domainRow}>
        {process.domains.slice(0, 4).map((domain) => (
          <Text key={domain} style={styles.domain}>{domain}</Text>
        ))}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.memory}>{process.insightIds.length} {t('insightCount')}</Text>
        <Text style={styles.open}>{t('openProcess')} →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  animatedRoot: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  back: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  kicker: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 2, marginTop: spacing.xl },
  title: { color: colors.ink, fontSize: 44, fontWeight: '800', letterSpacing: -1.5, marginTop: spacing.sm },
  content: { paddingBottom: 56, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionLabel: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6, marginBottom: spacing.md },
  card: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.lg },
  pressed: { opacity: 0.55 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  status: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  updated: { color: colors.gray500, fontSize: 9, fontWeight: '700' },
  cardTitle: { color: colors.ink, fontSize: 25, fontWeight: '800', lineHeight: 31, marginTop: 10 },
  cardSummary: { color: colors.gray600, fontSize: 14, lineHeight: 22, marginTop: 9 },
  domainRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  domain: { color: colors.gray600, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  memory: { color: colors.gray500, fontSize: 10, fontWeight: '700' },
  open: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
});
