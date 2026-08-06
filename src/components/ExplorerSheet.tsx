import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import type {
  KnowledgeConnection,
  KnowledgeNetwork,
  KnowledgeNode,
  RelatedInsight,
  TimelineEvent,
} from '../data/knowledgeNetworkSeed';
import type { Evidence, Signal, Source } from '../types/insight';
import { colors, spacing, type } from '../theme/tokens';
import { ConfidenceBadge } from './ConfidenceBadge';

export type ExplorerTopic = {
  id: string;
  knowledgeHome?: 'none' | 'systemMap' | 'related' | 'timeline';
  label: string;
  title: string;
  summary?: string;
  sections?: Array<{ title: string; body: string }>;
  evidence?: Evidence[];
  sources?: Source[];
};

export type ExplorerRoot =
  | { kind: 'signal'; signal: Signal }
  | { kind: 'topic'; topic: ExplorerTopic };

type Detail =
  | { kind: 'root' }
  | { kind: 'evidence'; evidence: Evidence }
  | { kind: 'source'; source: Source }
  | { kind: 'node'; node: KnowledgeNode }
  | { kind: 'connection'; connection: KnowledgeConnection }
  | { kind: 'timeline'; event: TimelineEvent }
  | { kind: 'related'; insight: RelatedInsight };

type Props = {
  onClose: () => void;
  root: ExplorerRoot | null;
  network: KnowledgeNetwork;
};

export function ExplorerSheet({ onClose, root, network }: Props) {
  const { t } = useI18n();
  const [stack, setStack] = useState<Detail[]>([{ kind: 'root' }]);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!root) return;
    setStack([{ kind: 'root' }]);
  }, [root]);

  const detail = stack[stack.length - 1] ?? { kind: 'root' as const };
  const sources = root?.kind === 'signal' ? root.signal.sources ?? [] : root?.topic.sources ?? [];
  const sourceMap = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources]);
  const nodeMap = useMemo(() => new Map(network.nodes.map((node) => [node.id, node])), [network.nodes]);

  useEffect(() => {
    if (!root) return;
    titleOpacity.setValue(0);
    bodyOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(bodyOpacity, { toValue: 1, duration: 230, delay: 90, useNativeDriver: true }),
    ]).start();
  }, [bodyOpacity, detail, root, titleOpacity]);

  if (!root) return null;

  const close = () => {
    setStack([{ kind: 'root' }]);
    onClose();
  };
  const push = (next: Detail) => setStack((previous) => [...previous, next]);
  const back = () => setStack((previous) => (previous.length > 1 ? previous.slice(0, -1) : previous));
  const rootLabel = root.kind === 'signal' ? root.signal.label : root.topic.label;

  return (
    <Modal animationType="slide" onRequestClose={close} statusBarTranslucent transparent visible>
      <SafeAreaView style={styles.overlay}>
        <Pressable accessibilityLabel={t('close')} onPress={close} style={styles.dismissArea} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.topBar}>
            {stack.length === 1 ? (
              <Text style={styles.kicker}>{rootLabel}</Text>
            ) : (
              <Pressable hitSlop={10} onPress={back}>
                <Text style={styles.back}>← {t('explore')}</Text>
              </Pressable>
            )}
            <Pressable hitSlop={10} onPress={close}>
              <Text style={styles.close}>{t('close')}</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: titleOpacity }}>
              <DetailHeading detail={detail} root={root} />
            </Animated.View>

            <Animated.View style={{ opacity: bodyOpacity }}>
              {detail.kind === 'root' && root.kind === 'signal' ? (
                <SignalDetail
                  signal={root.signal}
                  onEvidence={(evidence) => push({ kind: 'evidence', evidence })}
                  onSource={(source) => push({ kind: 'source', source })}
                />
              ) : null}
              {detail.kind === 'root' && root.kind === 'topic' ? (
                <TopicDetail
                  topic={root.topic}
                  onEvidence={(evidence) => push({ kind: 'evidence', evidence })}
                  onSource={(source) => push({ kind: 'source', source })}
                />
              ) : null}
              {detail.kind === 'root' && root.kind === 'topic' && root.topic.knowledgeHome && root.topic.knowledgeHome !== 'none' ? (
                <KnowledgeNetworkSection
                  mode={root.topic.knowledgeHome}
                  network={network}
                  onNode={(node) => push({ kind: 'node', node })}
                  onConnection={(connection) => push({ kind: 'connection', connection })}
                  onTimeline={(event) => push({ kind: 'timeline', event })}
                  onRelated={(insight) => push({ kind: 'related', insight })}
                />
              ) : null}
              {detail.kind === 'evidence' ? (
                <EvidenceDetail
                  evidence={detail.evidence}
                  sourceMap={sourceMap}
                  onSource={(source) => push({ kind: 'source', source })}
                />
              ) : null}
              {detail.kind === 'source' ? <SourceDetail source={detail.source} /> : null}
              {detail.kind === 'node' ? (
                <NodeDetail
                  node={detail.node}
                  connections={network.connections.filter((item) => item.from === detail.node.id || item.to === detail.node.id)}
                  nodeMap={nodeMap}
                  onConnection={(connection) => push({ kind: 'connection', connection })}
                />
              ) : null}
              {detail.kind === 'connection' ? <ConnectionDetail connection={detail.connection} nodeMap={nodeMap} /> : null}
              {detail.kind === 'timeline' ? <TimelineDetail event={detail.event} /> : null}
              {detail.kind === 'related' ? <RelatedDetail insight={detail.insight} /> : null}
            </Animated.View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function DetailHeading({ detail, root }: { detail: Detail; root: ExplorerRoot }) {
  const { t } = useI18n();
  if (detail.kind === 'root') {
    return <Text style={styles.title}>{root.kind === 'signal' ? root.signal.title : root.topic.title}</Text>;
  }
  if (detail.kind === 'evidence') {
    return <View style={styles.heading}><Text style={styles.kicker}>{t('evidence')}</Text><ConfidenceBadge level={detail.evidence.confidence} /></View>;
  }
  if (detail.kind === 'source') return <Text style={styles.kicker}>{detail.source.type.toUpperCase()}</Text>;
  if (detail.kind === 'node') return <><Text style={styles.kicker}>{t('networkMap')}</Text><Text style={styles.title}>{detail.node.title}</Text></>;
  if (detail.kind === 'connection') return <><Text style={styles.kicker}>{t('connectionPath')}</Text><Text style={styles.title}>{detail.connection.title}</Text></>;
  if (detail.kind === 'timeline') return <><Text style={styles.kicker}>{detail.event.date}</Text><Text style={styles.title}>{detail.event.title}</Text></>;
  return <><Text style={styles.kicker}>{detail.insight.label}</Text><Text style={styles.title}>{detail.insight.title}</Text></>;
}

function SignalDetail({ signal, onEvidence, onSource }: { signal: Signal; onEvidence: (e: Evidence) => void; onSource: (s: Source) => void }) {
  const { t } = useI18n();
  return <>
    <Text style={styles.summary}>{signal.body}</Text>
    {signal.whyImportant ? <Section title={t('whyImportant')}><Text style={styles.body}>{signal.whyImportant}</Text></Section> : null}
    <EvidenceAndSources evidence={signal.evidence} sources={signal.sources} onEvidence={onEvidence} onSource={onSource} showSources={false} />
  </>;
}

function TopicDetail({ topic, onEvidence, onSource }: { topic: ExplorerTopic; onEvidence: (e: Evidence) => void; onSource: (s: Source) => void }) {
  return <>
    {topic.summary ? <Text style={styles.summary}>{topic.summary}</Text> : null}
    {topic.sections?.map((section) => <Section key={`${topic.id}-${section.title}`} title={section.title}><Text style={styles.body}>{section.body}</Text></Section>)}
    <EvidenceAndSources evidence={topic.evidence} sources={topic.sources} onEvidence={onEvidence} onSource={onSource} />
  </>;
}

function KnowledgeNetworkSection({ mode, network, onNode, onConnection, onTimeline, onRelated }: {
  mode: 'systemMap' | 'related' | 'timeline';
  network: KnowledgeNetwork;
  onNode: (node: KnowledgeNode) => void;
  onConnection: (connection: KnowledgeConnection) => void;
  onTimeline: (event: TimelineEvent) => void;
  onRelated: (insight: RelatedInsight) => void;
}) {
  const { t } = useI18n();

  if (mode === 'systemMap') {
    return <>
      <Section title={t('networkMap')}>
        <View style={styles.nodeWrap}>
          {network.nodes.map((node, index) => <React.Fragment key={node.id}>
            <Pressable onPress={() => onNode(node)} style={({ pressed }) => [styles.node, pressed && styles.pressed]}>
              <Text style={styles.nodeLabel}>{node.label}</Text>
              <Text style={styles.nodeTitle}>{node.title}</Text>
            </Pressable>
            {index < network.nodes.length - 1 ? <Text style={styles.nodeArrow}>→</Text> : null}
          </React.Fragment>)}
        </View>
      </Section>
      <Section title={t('connections')}>
        {network.connections.map((connection) => <Pressable key={connection.id} onPress={() => onConnection(connection)} style={({ pressed }) => [styles.connectionCard, pressed && styles.pressed]}>
          <Text style={styles.connectionPath}>{connection.from.toUpperCase()} → {connection.to.toUpperCase()}</Text>
          <Text style={styles.cardTitle}>{connection.title}</Text>
          <Text style={styles.openLabel}>{t('open')} →</Text>
        </Pressable>)}
      </Section>
    </>;
  }

  if (mode === 'timeline') {
    return <Section title={t('timeline')}>
      {network.timeline.map((event) => <Pressable key={event.id} onPress={() => onTimeline(event)} style={({ pressed }) => [styles.timelineRow, pressed && styles.pressed]}>
        <Text style={styles.timelineDate}>{event.date}</Text>
        <View style={styles.timelineText}><Text style={styles.cardTitle}>{event.title}</Text><Text style={styles.openLabel}>{t('open')} →</Text></View>
      </Pressable>)}
    </Section>;
  }

  return <Section title={t('relatedInsights')}>
    {network.relatedInsights.map((insight) => <Pressable key={insight.id} onPress={() => onRelated(insight)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardTop}><Text style={styles.cardTitle}>{insight.title}</Text><Text style={styles.status}>{insight.status.toUpperCase()}</Text></View>
      <Text style={styles.cardBody}>{insight.summary}</Text>
      <Text style={styles.openLabel}>{t('open')} →</Text>
    </Pressable>)}
  </Section>;
}

function NodeDetail({ node, connections, nodeMap, onConnection }: { node: KnowledgeNode; connections: KnowledgeConnection[]; nodeMap: Map<string, KnowledgeNode>; onConnection: (connection: KnowledgeConnection) => void }) {
  const { t } = useI18n();
  return <>
    <Text style={styles.summary}>{node.summary}</Text>
    <Section title={t('connections')}>
      {connections.map((connection) => {
        const otherId = connection.from === node.id ? connection.to : connection.from;
        return <Pressable key={connection.id} onPress={() => onConnection(connection)} style={({ pressed }) => [styles.sourceRow, pressed && styles.pressed]}>
          <View style={styles.sourceText}><Text style={styles.sourceTitle}>{nodeMap.get(otherId)?.title ?? otherId}</Text><Text style={styles.sourcePublisher}>{connection.title}</Text></View><Text style={styles.openLabel}>→</Text>
        </Pressable>;
      })}
    </Section>
  </>;
}

function ConnectionDetail({ connection, nodeMap }: { connection: KnowledgeConnection; nodeMap: Map<string, KnowledgeNode> }) {
  const from = nodeMap.get(connection.from);
  const to = nodeMap.get(connection.to);
  return <>
    <View style={styles.pathLarge}><Text style={styles.pathNode}>{from?.title ?? connection.from}</Text><Text style={styles.pathArrow}>↓</Text><Text style={styles.pathNode}>{to?.title ?? connection.to}</Text></View>
    <Text style={styles.summary}>{connection.explanation}</Text>
  </>;
}

function TimelineDetail({ event }: { event: TimelineEvent }) {
  return <Text style={styles.summary}>{event.body}</Text>;
}

function RelatedDetail({ insight }: { insight: RelatedInsight }) {
  const { t } = useI18n();
  return <>
    <Text style={styles.summary}>{insight.summary}</Text>
    <Section title={t('connectionPath')}>
      <Text style={styles.body}>{insight.status === 'living' ? '↻' : insight.status === 'watch' ? '◌' : '↗'} {insight.status.toUpperCase()}</Text>
    </Section>
  </>;
}

function EvidenceAndSources({ evidence, sources, onEvidence, onSource, showSources = true }: { evidence?: Evidence[]; sources?: Source[]; onEvidence: (e: Evidence) => void; onSource: (s: Source) => void; showSources?: boolean }) {
  const { t } = useI18n();
  return <>
    {evidence?.length ? <Section title={t('evidence')}>{evidence.map((item) =>
      <Pressable key={item.id} onPress={() => onEvidence(item)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.cardTop}><Text style={styles.cardTitle}>{item.title}</Text><ConfidenceBadge level={item.confidence} /></View>
        <Text numberOfLines={3} style={styles.cardBody}>{item.description}</Text><Text style={styles.openLabel}>{t('open')} →</Text>
      </Pressable>)}</Section> : null}
    {showSources && sources?.length ? <Section title={t('sources')}>{sources.map((source) => <SourceRow key={source.id} source={source} onPress={() => onSource(source)} />)}</Section> : null}
  </>;
}

function EvidenceDetail({ evidence, sourceMap, onSource }: { evidence: Evidence; sourceMap: Map<string, Source>; onSource: (s: Source) => void }) {
  const { t } = useI18n();
  const sources = evidence.sourceIds.map((id) => sourceMap.get(id)).filter((source): source is Source => Boolean(source));
  return <>
    <Text style={styles.title}>{evidence.title}</Text>
    <Text style={styles.body}>{evidence.description}</Text>
    {sources.length ? <Section title={t('sources')}>{sources.map((source) => <SourceRow key={source.id} source={source} onPress={() => onSource(source)} />)}</Section> : null}
  </>;
}

function SourceDetail({ source }: { source: Source }) {
  const { t } = useI18n();
  const open = async () => { if (await Linking.canOpenURL(source.url)) await Linking.openURL(source.url); };
  return <>
    <Text style={styles.title}>{source.title}</Text>
    <Text style={styles.publisher}>{source.publisher}</Text>
    <View style={styles.meta}><Reliability source={source} />{source.publishedAt ? <Text style={styles.date}>{source.publishedAt}</Text> : null}</View>
    {source.note ? <Text style={styles.body}>{source.note}</Text> : null}
    <Pressable onPress={open} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}><Text style={styles.buttonText}>{t('openSource')} ↗</Text></Pressable>
  </>;
}

function SourceRow({ source, onPress }: { source: Source; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.sourceRow, pressed && styles.pressed]}>
    <View style={styles.sourceText}><Text style={styles.sourceTitle}>{source.title}</Text><Text style={styles.sourcePublisher}>{source.publisher} · {source.type.toUpperCase()}</Text></View><Reliability source={source} />
  </Pressable>;
}
function Reliability({ source }: { source: Source }) { const { t } = useI18n(); const label = source.reliability === 'primary' ? t('reliabilityPrimary') : source.reliability === 'strong' ? t('reliabilityStrong') : t('reliabilityContext'); return <View style={styles.reliability}><Text style={styles.reliabilityText}>{label}</Text></View>; }
function Section({ title, children }: React.PropsWithChildren<{ title: string }>) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(17,17,15,0.28)', flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: { backgroundColor: colors.paperElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', minHeight: '66%', overflow: 'hidden' },
  handle: { alignSelf: 'center', backgroundColor: colors.gray300, borderRadius: 2, height: 4, marginTop: 10, width: 38 },
  topBar: { alignItems: 'center', borderBottomColor: colors.gray200, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: spacing.lg },
  kicker: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6 },
  back: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  close: { color: colors.gray600, fontSize: 12, fontWeight: '800' },
  content: { paddingBottom: 56, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.7, lineHeight: 35, marginTop: 4 },
  summary: { color: colors.gray700, fontSize: 16, lineHeight: 25, marginTop: spacing.md },
  body: { color: colors.gray700, fontSize: 15, lineHeight: 24 },
  publisher: { color: colors.gray600, fontSize: 15, marginTop: spacing.sm },
  date: { color: colors.gray500, fontSize: 11, fontWeight: '700' },
  section: { borderTopColor: colors.gray300, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.xl, paddingTop: spacing.md },
  sectionTitle: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.7, marginBottom: spacing.md },
  card: { backgroundColor: colors.white, borderColor: colors.gray200, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm, padding: spacing.md },
  cardTop: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  cardTitle: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: '800', lineHeight: 22 },
  cardBody: { color: colors.gray700, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  openLabel: { color: colors.ink, fontSize: 11, fontWeight: '800', marginTop: spacing.md },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  sourceRow: { alignItems: 'center', borderBottomColor: colors.gray200, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', paddingVertical: spacing.md },
  sourceText: { flex: 1 },
  sourceTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', lineHeight: 21 },
  sourcePublisher: { color: colors.gray500, fontSize: 11, marginTop: 4 },
  reliability: { borderColor: colors.gray300, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 8, paddingVertical: 5 },
  reliabilityText: { color: colors.gray600, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, marginTop: spacing.md },
  button: { alignItems: 'center', backgroundColor: colors.ink, borderRadius: 14, marginTop: spacing.xl, paddingHorizontal: spacing.lg, paddingVertical: 16 },
  buttonPressed: { opacity: 0.72 },
  buttonText: { color: colors.white, fontSize: 13, fontWeight: '800', letterSpacing: 0.8 },
  pressed: { opacity: 0.58 },
  nodeWrap: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  node: { backgroundColor: colors.white, borderColor: colors.gray300, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, minWidth: 92, paddingHorizontal: 12, paddingVertical: 11 },
  nodeLabel: { color: colors.gray500, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  nodeTitle: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 5 },
  nodeArrow: { color: colors.gray400, fontSize: 15, fontWeight: '700' },
  connectionCard: { borderBottomColor: colors.gray200, borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: spacing.md, paddingTop: spacing.sm },
  connectionPath: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginBottom: 7 },
  timelineRow: { flexDirection: 'row', minHeight: 82 },
  timelineRail: { alignItems: 'center', marginRight: 14, width: 16 },
  timelineDot: { backgroundColor: colors.ink, borderRadius: 5, height: 9, marginTop: 5, width: 9 },
  timelineLine: { backgroundColor: colors.gray300, flex: 1, marginVertical: 5, width: 1 },
  timelineCopy: { flex: 1, paddingBottom: spacing.md },
  timelineText: { flex: 1, paddingBottom: spacing.md },
  timelineDate: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  relatedCard: { backgroundColor: colors.white, borderColor: colors.gray200, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm, padding: spacing.md },
  relatedLabel: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  relatedStatus: { color: colors.gray500, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  status: { color: colors.gray500, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  pathLarge: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.md },
  pathNode: { color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  pathArrow: { color: colors.gray400, fontSize: 24, marginVertical: 12 },
});
