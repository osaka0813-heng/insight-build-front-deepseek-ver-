import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressRail } from '../components/ProgressRail';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ExplorerSheet, type ExplorerRoot } from '../components/ExplorerSheet';
import { getKnowledgeNetwork } from '../data/knowledgeNetworkSeed';
import type { InsightEdition } from '../types/insight';
import type { DailyState } from '../types/dailyState';
import type { DailyContinuity } from '../types/dailyContinuity';
import {
  CoverPage,
  HeroInsightPage,
  ObservePage,
  PatternPage,
  QuestionPage,
  SignalsPage,
} from '../screens/InsightPages';
import { colors } from '../theme/tokens';

const PAGE_IDS = [
  'cover',
  'question',
  'signals',
  'pattern',
  'insight',
  'observe',
] as const;

type PageId = (typeof PAGE_IDS)[number];

type Props = {
  edition: InsightEdition;
  onOpenArchive: () => void;
  onOpenProcess?: () => void;
  dailyState?: DailyState;
  continuity?: DailyContinuity;
  onOpenDailyLanding?: () => void;
  onOpenEditorial?: () => void;
};

export function ReadingPager({ edition, onOpenArchive, onOpenProcess, dailyState, continuity, onOpenDailyLanding, onOpenEditorial }: Props) {
  const insets = useSafeAreaInsets();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [explorerRoot, setExplorerRoot] = useState<ExplorerRoot | null>(null);
  const [completedPages, setCompletedPages] = useState<Set<number>>(
    () => new Set(),
  );
  const currentPageRef = useRef(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const knowledgeNetwork = useMemo(() => getKnowledgeNetwork(edition.language), [edition.language]);

  const horizontalNavigationSwipe = useMemo(
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

  const pages = useMemo(
    () =>
      PAGE_IDS.map((id) => ({
        id,
      })),
    [],
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredHeight = Math.round(event.nativeEvent.layout.height);
    setViewportHeight((oldHeight) =>
      oldHeight === measuredHeight ? oldHeight : measuredHeight,
    );
  }, []);

  const handleScrollBegin = useCallback(() => {
    // The page that the user is leaving must remain fully visible while the
    // gesture is in progress. Marking it completed here also prevents a
    // cancelled drag from replaying its reveal animation.
    setCompletedPages((previous) => {
      if (previous.has(currentPageRef.current)) return previous;

      const next = new Set(previous);
      next.add(currentPageRef.current);
      return next;
    });
    setIsInteracting(true);
  }, []);

  const settleOnPage = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!viewportHeight) return;

      const nextPage = Math.round(
        event.nativeEvent.contentOffset.y / viewportHeight,
      );
      const clampedPage = Math.max(
        0,
        Math.min(PAGE_IDS.length - 1, nextPage),
      );

      const previousPage = currentPageRef.current;

      if (clampedPage !== previousPage) {
        setCompletedPages((previous) => {
          const next = new Set(previous);
          next.add(previousPage);
          return next;
        });
      }

      currentPageRef.current = clampedPage;
      setCurrentPage(clampedPage);
      setIsInteracting(false);
    },
    [viewportHeight],
  );

  const renderPage = useCallback(
    ({ item, index }: { item: { id: PageId }; index: number }) => {
      const inputRange = [
        (index - 1) * viewportHeight,
        index * viewportHeight,
        (index + 1) * viewportHeight,
      ];
      const opacity = scrollY.interpolate({
        inputRange,
        outputRange: [0.45, 1, 0.45],
        extrapolate: 'clamp',
      });
      const translateY = scrollY.interpolate({
        inputRange,
        outputRange: [14, 0, -14],
        extrapolate: 'clamp',
      });

      const active = currentPage === index && !isInteracting;
      // Build006 displayed every mounted page during a swipe. The incoming
      // page was therefore visible first, then reset to opacity 0 when the
      // swipe settled, producing a full → blank → reveal flash.
      //
      // Only completed pages (including the page being left) are forced
      // visible now. A new incoming page stays hidden until it becomes active,
      // then reveals exactly once from opacity 0.
      const forceVisible = completedPages.has(index);
      const props = {
        active,
        edition,
        forceVisible,
        height: viewportHeight,
        onExplore: setExplorerRoot,
        onOpenEditorial,
        dailyState,
        continuity,
      };

      let page: React.ReactNode = null;

      switch (item.id) {
        case 'cover':
          page = <CoverPage {...props} />;
          break;
        case 'question':
          page = <QuestionPage {...props} />;
          break;
        case 'signals':
          page = <SignalsPage {...props} />;
          break;
        case 'pattern':
          page = <PatternPage {...props} />;
          break;
        case 'insight':
          page = <HeroInsightPage {...props} />;
          break;
        case 'observe':
          page = <ObservePage {...props} onOpenArchive={onOpenArchive} onOpenProcess={onOpenProcess} onOpenDailyLanding={onOpenDailyLanding} />;
          break;
      }

      return (
        <Animated.View
          style={{
            height: viewportHeight,
            opacity,
            transform: [{ translateY }],
          }}
        >
          {page}
        </Animated.View>
      );
    },
    [
      currentPage,
      isInteracting,
      scrollY,
      viewportHeight,
      completedPages,
      edition,
      onOpenArchive,
      onOpenProcess,
      dailyState,
      continuity,
      onOpenDailyLanding,
      onOpenEditorial,
    ],
  );

  return (
    <View style={styles.root}>
      <View
        onLayout={handleLayout}
        {...horizontalNavigationSwipe.panHandlers}
        style={[
          styles.safeViewport,
          {
            marginBottom: insets.bottom,
            marginTop: insets.top,
          },
        ]}
      >
        {viewportHeight > 0 ? (
          <>
            <Animated.FlatList
              data={pages}
              extraData={edition}
              decelerationRate="fast"
              disableIntervalMomentum
              getItemLayout={(_, index) => ({
                index,
                length: viewportHeight,
                offset: viewportHeight * index,
              })}
              keyExtractor={(item) => item.id}
              nestedScrollEnabled
              onMomentumScrollBegin={handleScrollBegin}
              onMomentumScrollEnd={settleOnPage}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true },
              )}
              onScrollBeginDrag={handleScrollBegin}
              onScrollEndDrag={(event) => {
                if (
                  Math.abs(event.nativeEvent.velocity?.y ?? 0) < 0.05
                ) {
                  settleOnPage(event);
                }
              }}
              pagingEnabled
              renderItem={renderPage}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={viewportHeight}
            />
            <ProgressRail current={currentPage} total={pages.length} />
            <View style={styles.languageSwitcher}>
              <LanguageSwitcher inverse={currentPage === 4} />
            </View>
            <ExplorerSheet root={explorerRoot} network={knowledgeNetwork} onClose={() => setExplorerRoot(null)} />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  safeViewport: {
    flex: 1,
  },
  languageSwitcher: {
    position: 'absolute',
    right: 20,
    top: 12,
    zIndex: 20,
  },
});
