import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { insightRepository } from '../engine/insightRepository';
import { dailyStateRepository } from '../engine/dailyStateRepository';
import { dailyContinuityRepository } from '../engine/dailyContinuityRepository';
import { worldProcessRepository } from '../engine/worldProcessRepository';
import { useI18n } from '../i18n/I18nProvider';
import { useLivingMemory } from '../state/LivingMemoryProvider';
import { useRemoteContent } from '../state/RemoteContentProvider';
import { ReadingPager } from '../navigation/ReadingPager';
import { ArchiveScreen } from '../screens/ArchiveScreen';
import { ConnectionsScreen } from '../screens/ConnectionsScreen';
import { EvolutionScreen } from '../screens/EvolutionScreen';
import { NoNewGlobalInsightScreen } from '../screens/NoNewGlobalInsightScreen';
import { WorldProcessScreen } from '../screens/WorldProcessScreen';
import { ResearchDraftsScreen } from '../screens/ResearchDraftsScreen';
import { WriterDraftsScreen } from '../screens/WriterDraftsScreen';
import { EditorialConsoleScreen } from '../screens/EditorialConsoleScreen';
import { AdminGateScreen } from '../screens/AdminGateScreen';

type OverlayRoute =
  | { name: 'archive' }
  | { name: 'process'; processId: string; focusInsightId?: string }
  | { name: 'connections'; processId: string }
  | { name: 'evolution'; processId: string }
  | { name: 'research' }
  | { name: 'writer' }
  | { name: 'admin' }
  | { name: 'editorial' };

export function AppNavigator() {
  const { language } = useI18n();
  const { revision: contentRevision } = useRemoteContent();
  const { lastInsightByProcess } = useLivingMemory();
  const current = useMemo(() => insightRepository.getCurrent(language), [language, contentRevision]);
  const currentDailyState = useMemo(() => dailyStateRepository.getCurrent(language), [language, contentRevision]);
  const [readerInsightId, setReaderInsightId] = useState(current.id);
  const [showDailyLanding, setShowDailyLanding] = useState(
    currentDailyState.state === 'no_new_global_insight',
  );
  const [overlayStack, setOverlayStack] = useState<OverlayRoute[]>([]);
  const previousCurrentIdRef = useRef(current.id);

  useEffect(() => {
    const stillExists = insightRepository.getById(readerInsightId, 'en');
    const wasFollowingLatest = readerInsightId === previousCurrentIdRef.current;
    if (!stillExists || wasFollowingLatest) {
      setReaderInsightId(current.id);
      setShowDailyLanding(currentDailyState.state === 'no_new_global_insight');
    }
    setOverlayStack([]);
    previousCurrentIdRef.current = current.id;
  }, [contentRevision, current.id, currentDailyState.state]);

  const edition = useMemo(
    () => insightRepository.getById(readerInsightId, language) ?? current,
    [current, language, readerInsightId, contentRevision],
  );
  const activeOverlay = overlayStack[overlayStack.length - 1];

  const pushOverlay = useCallback((route: OverlayRoute) => {
    setOverlayStack((stack) => [...stack, route]);
  }, []);

  const popOverlay = useCallback(() => {
    setOverlayStack((stack) => stack.slice(0, -1));
  }, []);

  const closeOverlaysAndRead = useCallback((insightId: string) => {
    setReaderInsightId(insightId);
    setShowDailyLanding(false);
    setOverlayStack([]);
  }, []);

  const openDailyLanding = useCallback(() => {
    setShowDailyLanding(true);
    setOverlayStack([]);
  }, []);

  const process = edition.processId
    ? worldProcessRepository.getById(edition.processId, language)
    : worldProcessRepository.getForInsight(edition.id, language);
  const dailyProcess = currentDailyState.processId
    ? worldProcessRepository.getById(currentDailyState.processId, language)
    : process;
  const previousInsight = currentDailyState.previousInsightId
    ? insightRepository.getById(currentDailyState.previousInsightId, language)
    : current;

  const currentLastSeenInsightId = currentDailyState.processId
    ? lastInsightByProcess[currentDailyState.processId]
    : undefined;
  const currentContinuity = useMemo(
    () => dailyContinuityRepository.build(currentDailyState, language, currentLastSeenInsightId),
    [currentDailyState, language, currentLastSeenInsightId, contentRevision],
  );
  const editionDailyState = useMemo(
    () => dailyStateRepository.getByInsightId(edition.id, language),
    [edition.id, language, contentRevision],
  );
  const editionLastSeenInsightId = editionDailyState?.processId
    ? lastInsightByProcess[editionDailyState.processId]
    : undefined;
  const editionContinuity = useMemo(
    () => editionDailyState
      ? dailyContinuityRepository.build(editionDailyState, language, editionLastSeenInsightId)
      : undefined,
    [editionDailyState, editionLastSeenInsightId, language, contentRevision],
  );

  let overlay: React.ReactNode = null;

  if (activeOverlay?.name === 'archive') {
    overlay = (
      <ArchiveScreen
        onBack={popOverlay}
        onOpenInsight={closeOverlaysAndRead}
        onOpenProcess={(processId, focusInsightId) =>
          pushOverlay({ name: 'process', processId, focusInsightId })
        }
        onOpenResearch={() => pushOverlay({ name: 'research' })}
      />
    );
  }


  if (activeOverlay?.name === 'research') {
    overlay = <ResearchDraftsScreen onBack={popOverlay} onOpenWriter={() => pushOverlay({ name: 'writer' })} />;
  }

  if (activeOverlay?.name === 'writer') {
    overlay = <WriterDraftsScreen onBack={popOverlay} />;
  }

  if (activeOverlay?.name === 'admin') {
    overlay = (
      <AdminGateScreen
        onBack={popOverlay}
        onVerified={() =>
          setOverlayStack((stack) => [
            ...stack.slice(0, -1),
            { name: 'editorial' },
          ])
        }
      />
    );
  }

  if (activeOverlay?.name === 'editorial') {
    overlay = (
      <EditorialConsoleScreen
        onBack={popOverlay}
        onPublished={closeOverlaysAndRead}
      />
    );
  }

  if (activeOverlay?.name === 'process') {
    const selectedProcess = worldProcessRepository.getById(activeOverlay.processId, language);
    if (selectedProcess) {
      overlay = (
        <WorldProcessScreen
          process={selectedProcess}
          focusInsightId={activeOverlay.focusInsightId}
          onBack={popOverlay}
          onOpenInsight={closeOverlaysAndRead}
          onOpenProcess={(processId) => pushOverlay({ name: 'process', processId })}
          onOpenConnections={() => pushOverlay({ name: 'connections', processId: selectedProcess.id })}
          onOpenEvolution={() => pushOverlay({ name: 'evolution', processId: selectedProcess.id })}
        />
      );
    }
  }

  if (activeOverlay?.name === 'connections') {
    const selectedProcess = worldProcessRepository.getById(activeOverlay.processId, language);
    if (selectedProcess) {
      overlay = (
        <ConnectionsScreen
          process={selectedProcess}
          focusInsightId={activeOverlay.focusInsightId}
          onBack={popOverlay}
          onOpenProcess={(processId) => pushOverlay({ name: 'process', processId })}
        />
      );
    }
  }

  if (activeOverlay?.name === 'evolution') {
    const selectedProcess = worldProcessRepository.getById(activeOverlay.processId, language);
    if (selectedProcess) {
      overlay = (
        <EvolutionScreen
          process={selectedProcess}
          focusInsightId={activeOverlay.focusInsightId}
          onBack={popOverlay}
          onOpenInsight={closeOverlaysAndRead}
        />
      );
    }
  }

  const showNoNewExperience =
    showDailyLanding && currentDailyState.state === 'no_new_global_insight';

  return (
    <View style={styles.root}>
      {showNoNewExperience ? (
        <NoNewGlobalInsightScreen
          dailyState={currentDailyState}
          continuity={currentContinuity}
          process={dailyProcess}
          previousInsightTitle={previousInsight?.cover.title}
          onOpenPreviousInsight={() => closeOverlaysAndRead(previousInsight?.id ?? current.id)}
          onOpenProcess={
            dailyProcess
              ? () => pushOverlay({ name: 'process', processId: dailyProcess.id })
              : undefined
          }
          onOpenArchive={() => pushOverlay({ name: 'archive' })}
          onOpenEditorial={() => pushOverlay({ name: 'admin' })}
        />
      ) : (
        <ReadingPager
          key={edition.id}
          edition={edition}
          dailyState={editionDailyState}
          continuity={editionContinuity}
          onOpenDailyLanding={
            currentDailyState.state === 'no_new_global_insight' ? openDailyLanding : undefined
          }
          onOpenArchive={() => pushOverlay({ name: 'archive' })}
          onOpenEditorial={() => pushOverlay({ name: 'admin' })}
          onOpenProcess={
            process
              ? () => pushOverlay({ name: 'process', processId: process.id })
              : undefined
          }
        />
      )}
      {overlay ? <View style={styles.overlay}>{overlay}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
});
