
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  runAnalyze,
  runResearch,
  runWriteResumable,
  type EditorialRequestError,
  type WriteCheckpoint,
  type WriteProgressStage,
} from '../engine/editorialClient';
import {
  reviewWriterDraft,
  type PublishRequestError,
} from '../engine/publishClient';
import {
  checkBackendHealth,
  runProductionPreflight,
  type PreflightResult,
} from '../engine/productionSafetyClient';
import {
  appendEditorialLog,
  clearEditorialLogs,
  clearPipelineSnapshot,
  loadEditorialLogs,
  loadEditorialTokens,
  loadPipelineSnapshot,
  saveEditorialTokens,
  savePipelineSnapshot,
  type EditorialLogEntry,
} from '../engine/editorialStorage';
import type { ResearchDraftBundle } from '../types/research';
import type { WriterDraftBundle } from '../types/writer';
import { useRemoteContent } from '../state/RemoteContentProvider';
import { colors, spacing } from '../theme/tokens';

const DEFAULT_FOCUS =
  '过去24小时内广泛扫描全球，寻找最可能改变我们对世界理解的重要变化。不要先受既有进程限制，优先发现新的关系、拐点、矛盾、瓶颈与结构变化。';

type StepState = 'idle' | 'running' | 'done' | 'error';

type Props = {
  onBack: () => void;
  onPublished: (insightId: string) => void;
};

function todayLocal() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function stateMark(state: StepState) {
  if (state === 'done') return '✓';
  if (state === 'running') return '…';
  if (state === 'error') return '!';
  return '·';
}

function selectedCandidate(draft?: ResearchDraftBundle) {
  return draft?.candidates?.[0];
}

export function EditorialConsoleScreen({
  onBack,
  onPublished,
}: Props) {
  const { installPublishedContent } = useRemoteContent();

  const [researchToken, setResearchToken] = useState('');
  const [publishToken, setPublishToken] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [focus, setFocus] = useState(DEFAULT_FOCUS);

  const [researchDraft, setResearchDraft] =
    useState<ResearchDraftBundle>();
  const [analyzedDraft, setAnalyzedDraft] =
    useState<ResearchDraftBundle>();
  const [writerDraft, setWriterDraft] =
    useState<WriterDraftBundle>();
  const [writeCheckpoint, setWriteCheckpoint] =
    useState<WriteCheckpoint>({});

  const [researchState, setResearchState] =
    useState<StepState>('idle');
  const [analyzeState, setAnalyzeState] =
    useState<StepState>('idle');
  const [writeState, setWriteState] =
    useState<StepState>('idle');
  const [publishState, setPublishState] =
    useState<StepState>('idle');
  const [writeProgress, setWriteProgress] =
    useState<WriteProgressStage>();

  const [preflight, setPreflight] =
    useState<PreflightResult>();
  const [preflightRunning, setPreflightRunning] =
    useState(false);
  const [backendHealthy, setBackendHealthy] =
    useState<boolean>();

  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [logs, setLogs] = useState<EditorialLogEntry[]>([]);
  const [restoredAt, setRestoredAt] = useState<string>();

  const busy =
    researchState === 'running' ||
    analyzeState === 'running' ||
    writeState === 'running' ||
    publishState === 'running';

  useEffect(() => {
    checkBackendHealth()
      .then((result) => setBackendHealthy(result.ok))
      .catch((failure) => {
        setBackendHealthy(false);
        setError(
          failure instanceof Error
            ? failure.message
            : '后端健康检查失败。',
        );
      });

    Promise.all([
      loadEditorialTokens(),
      loadPipelineSnapshot(),
      loadEditorialLogs(),
    ])
      .then(([tokens, snapshot, storedLogs]) => {
        setResearchToken(tokens.researchToken);
        setPublishToken(tokens.publishToken);
        setLogs(storedLogs);

        if (!snapshot) return;

        setDate(snapshot.date || todayLocal());
        setFocus(snapshot.focus || DEFAULT_FOCUS);
        setResearchDraft(snapshot.researchDraft);
        setAnalyzedDraft(snapshot.analyzedDraft);
        setWriterDraft(snapshot.writerDraft);
        setWriteCheckpoint(snapshot.writeCheckpoint || {});
        setRestoredAt(snapshot.savedAt);

        setResearchState(
          snapshot.researchDraft ? 'done' : 'idle',
        );
        setAnalyzeState(
          snapshot.analyzedDraft
            ? 'done'
            : snapshot.researchDraft
              ? 'error'
              : 'idle',
        );
        setWriteState(
          snapshot.writerDraft
            ? 'done'
            : snapshot.analyzedDraft
              ? 'error'
              : 'idle',
        );
      })
      .catch(() => undefined);
  }, []);

  const saveSnapshot = async (values: {
    researchDraft?: ResearchDraftBundle;
    analyzedDraft?: ResearchDraftBundle;
    writerDraft?: WriterDraftBundle;
    writeCheckpoint?: WriteCheckpoint;
  }) => {
    await savePipelineSnapshot({
      savedAt: new Date().toISOString(),
      scope: 'global',
      date,
      focus,
      researchDraft: values.researchDraft,
      analyzedDraft: values.analyzedDraft,
      writerDraft: values.writerDraft,
      writeCheckpoint: values.writeCheckpoint,
    });
  };

  const recordError = async (
    stage: EditorialLogEntry['stage'],
    failure: unknown,
  ) => {
    const requestError = failure as EditorialRequestError;
    const text =
      failure instanceof Error
        ? failure.message
        : '未知错误。';

    await appendEditorialLog({
      stage,
      level: 'error',
      message: text,
      status: requestError.status,
    });

    setLogs(await loadEditorialLogs());
    return text;
  };

  const saveTokens = async () => {
    await saveEditorialTokens({
      researchToken,
      publishToken,
    });
    setMessage('Token 已保存。');
  };

  const generate = async () => {
    if (busy) return;
    if (!researchToken.trim()) {
      setError('请先填写 Research API Token。');
      return;
    }

    setError(undefined);
    setMessage(undefined);

    try {
      let research = researchDraft;
      let analyzed = analyzedDraft;
      let written = writerDraft;
      let checkpoint = writeCheckpoint;

      if (!research) {
        setResearchState('running');
        research = await runResearch(
          {
            date,
            focus,
            maxSignals: 6,
          },
          researchToken,
        );
        setResearchDraft(research);
        setResearchState('done');
        await saveSnapshot({
          researchDraft: research,
        });
      }

      if (!analyzed) {
        setAnalyzeState('running');
        const result = await runAnalyze(
          research,
          researchToken,
        );
        analyzed = result.draft;
        setAnalyzedDraft(analyzed);
        setAnalyzeState('done');
        await saveSnapshot({
          researchDraft: research,
          analyzedDraft: analyzed,
        });
      }

      if (!written) {
        setWriteState('running');
        const result = await runWriteResumable(
          analyzed,
          researchToken,
          checkpoint,
          false,
          setWriteProgress,
          async (nextCheckpoint) => {
            checkpoint = nextCheckpoint;
            setWriteCheckpoint(nextCheckpoint);
            await saveSnapshot({
              researchDraft: research,
              analyzedDraft: analyzed,
              writeCheckpoint: nextCheckpoint,
            });
          },
        );

        written = result.writerDraft;
        setWriterDraft(written);
        setWriteCheckpoint(result.checkpoint);
        setWriteState('done');
        setWriteProgress(undefined);

        await saveSnapshot({
          researchDraft: research,
          analyzedDraft: analyzed,
          writerDraft: written,
          writeCheckpoint: result.checkpoint,
        });
      }

      setMessage(
        '今日全球洞察草稿已完成。确认内容后执行发布前安全检查，再批准发布。',
      );
    } catch (failure) {
      const stage =
        researchState === 'running'
          ? 'research'
          : analyzeState === 'running'
            ? 'analyze'
            : 'write';

      if (stage === 'research') setResearchState('error');
      if (stage === 'analyze') setAnalyzeState('error');
      if (stage === 'write') setWriteState('error');

      setWriteProgress(undefined);
      setError(await recordError(stage, failure));
    }
  };

  const newCycle = async () => {
    if (busy) return;
    await clearPipelineSnapshot('global');
    setResearchDraft(undefined);
    setAnalyzedDraft(undefined);
    setWriterDraft(undefined);
    setWriteCheckpoint({});
    setResearchState('idle');
    setAnalyzeState('idle');
    setWriteState('idle');
    setPublishState('idle');
    setPreflight(undefined);
    setRestoredAt(undefined);
    setError(undefined);
    setMessage('已开启新的全球洞察周期。');
  };

  const runPreflight = async () => {
    if (preflightRunning) return;
    setPreflightRunning(true);
    setError(undefined);

    try {
      const result =
        await runProductionPreflight(publishToken);
      setPreflight(result);
      setMessage(
        result.ok
          ? '发布环境检查通过。'
          : '发布环境存在阻断项。',
      );
    } catch (failure) {
      setPreflight(undefined);
      setError(await recordError('sync', failure));
    } finally {
      setPreflightRunning(false);
    }
  };

  const publish = async () => {
    if (!writerDraft || publishState === 'running') return;

    setPublishState('running');
    setError(undefined);

    try {
      const result = await reviewWriterDraft(
        {
          action: 'approve',
          writerDraft,
        },
        publishToken,
      );

      if (result.content) {
        await installPublishedContent(result.content);
      }

      setPublishState('done');
      await clearPipelineSnapshot('global');
      setMessage('发布成功。');
      onPublished(writerDraft.insight.id);
    } catch (failure) {
      setPublishState('error');
      const publishError = failure as PublishRequestError;
      setError(
        await recordError(
          'publish',
          publishError,
        ),
      );
    }
  };

  const candidate = useMemo(
    () => selectedCandidate(analyzedDraft || researchDraft),
    [analyzedDraft, researchDraft],
  );

  const analysis = candidate?.analysis;
  const copy = candidate?.content?.zh || candidate?.content?.en;
  const writerCopy =
    writerDraft?.insight?.content?.zh ||
    writerDraft?.insight?.content?.en;

  const canPublish =
    Boolean(writerDraft) &&
    Boolean(preflight?.ok) &&
    publishState !== 'running';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack}>
            <Text style={styles.back}>‹ 返回</Text>
          </Pressable>
          <Text style={styles.version}>
            BUILD014.1 · ONE WORLD
          </Text>
          <Text style={styles.title}>AI 编辑台</Text>
          <Text style={styles.subtitle}>
            一次全球扫描 · 一个最终洞察 · English + 中文
          </Text>
        </View>

        <Section title="今日全球洞察">
          <View style={styles.pipeline}>
            <Pipeline
              label="Research"
              state={researchState}
              detail={
                researchDraft
                  ? `${researchDraft.candidates?.length || 0} 个候选`
                  : undefined
              }
            />
            <Pipeline
              label="Analyze"
              state={analyzeState}
              detail={
                analysis?.decisionType
                  ? analysis.decisionType
                      .replaceAll('_', ' ')
                  : undefined
              }
            />
            <Pipeline
              label="English"
              state={
                writeCheckpoint.base
                  ? 'done'
                  : writeState
              }
            />
            <Pipeline
              label="中文"
              state={
                writeCheckpoint.zh
                  ? 'done'
                  : writeState
              }
            />
            <Pipeline
              label="Finalize"
              state={writerDraft ? 'done' : 'idle'}
            />
            <Pipeline
              label="Publish"
              state={publishState}
            />
          </View>

          {writeProgress ? (
            <Text style={styles.note}>
              当前：
              {writeProgress === 'english'
                ? '生成英文主稿'
                : writeProgress === 'chinese'
                  ? '生成中文'
                  : '合并与校验'}
            </Text>
          ) : null}

          <Pressable
            disabled={busy}
            onPress={() => void generate()}
            style={[
              styles.primaryButton,
              busy && styles.disabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                {researchDraft ||
                analyzedDraft ||
                Object.keys(writeCheckpoint).length
                  ? '从断点继续生成'
                  : '生成今日全球洞察'}
              </Text>
            )}
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={() => void newCycle()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              清除断点并开启新周期
            </Text>
          </Pressable>

          {restoredAt ? (
            <Text style={styles.note}>
              已恢复上次断点：
              {new Date(restoredAt).toLocaleString()}
            </Text>
          ) : null}
        </Section>

        <Section title="研究设置">
          <TextInput
            value={date}
            onChangeText={setDate}
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />
          <TextInput
            value={focus}
            onChangeText={setFocus}
            style={[styles.input, styles.multiline]}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.note}>
            Research 固定扫描全球，目标候选数 6。World Process 只作为参考，不限制搜索范围。
          </Text>
        </Section>

        {candidate && copy ? (
          <Section title="Analyst 选择">
            <Text style={styles.kicker}>
              {analysis?.decisionType
                ?.replaceAll('_', ' ')
                .toUpperCase() || 'WAITING'}
            </Text>
            <Text style={styles.cardTitle}>
              {copy.title}
            </Text>
            <Text style={styles.body}>
              {analysis?.rationale ||
                copy.whyItMatters}
            </Text>
            <Text style={styles.meta}>
              Priority {analysis?.priorityScore ?? '—'} ·
              Importance {candidate.importance} ·
              Novelty {candidate.novelty} ·
              Evidence {candidate.evidenceStrength}
            </Text>
            <Text style={styles.meta}>
              Process：
              {analysis?.matchedProcessId ||
                '不强制匹配'}
            </Text>
          </Section>
        ) : null}

        {writerDraft && writerCopy ? (
          <Section title="最终草稿">
            <Text style={styles.cardTitle}>
              {writerCopy.cover.title}
            </Text>
            <Text style={styles.body}>
              {writerCopy.cover.summary}
            </Text>

            <View style={styles.preview}>
              <Text style={styles.previewItem}>
                01 {writerCopy.cover.title}
              </Text>
              <Text style={styles.previewItem}>
                02 {writerCopy.question.title}
              </Text>
              <Text style={styles.previewItem}>
                03 {writerCopy.signals.title}
              </Text>
              <Text style={styles.previewItem}>
                04 {writerCopy.pattern.title}
              </Text>
              <Text style={styles.previewItem}>
                05 {writerCopy.insight.title}
              </Text>
              <Text style={styles.previewItem}>
                06 {writerCopy.observe.title}
              </Text>
            </View>
          </Section>
        ) : null}

        <Section title="发布">
          <Text style={styles.meta}>
            后端：
            {backendHealthy === undefined
              ? '检查中'
              : backendHealthy
                ? 'ONLINE'
                : 'OFFLINE'}
          </Text>

          <Pressable
            disabled={preflightRunning || busy}
            onPress={() => void runPreflight()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              {preflightRunning
                ? '检查中…'
                : '执行发布前安全检查'}
            </Text>
          </Pressable>

          {preflight ? (
            <Text style={styles.note}>
              {preflight.ok
                ? '安全检查：PASS'
                : '安全检查：BLOCK'}
            </Text>
          ) : null}

          <Pressable
            disabled={!canPublish}
            onPress={() => void publish()}
            style={[
              styles.primaryButton,
              !canPublish && styles.disabled,
            ]}
          >
            {publishState === 'running' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                批准发布
              </Text>
            )}
          </Pressable>
        </Section>

        <Section title="Token">
          <TextInput
            value={researchToken}
            onChangeText={setResearchToken}
            placeholder="Research API Token"
            placeholderTextColor={colors.gray500}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={publishToken}
            onChangeText={setPublishToken}
            placeholder="Publish API Token"
            placeholderTextColor={colors.gray500}
            autoCapitalize="none"
            style={styles.input}
          />
          <Pressable
            onPress={() => void saveTokens()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              保存 Token
            </Text>
          </Pressable>
        </Section>

        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {logs.filter((item) => item.level === 'error').length ? (
          <Section title="最近错误">
            {logs
              .filter((item) => item.level === 'error')
              .slice(0, 3)
              .map((item) => (
                <Text key={item.id} style={styles.log}>
                  {item.stage} · {item.message}
                </Text>
              ))}
            <Pressable
              onPress={async () => {
                await clearEditorialLogs();
                setLogs([]);
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>
                清除错误记录
              </Text>
            </Pressable>
          </Section>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Pipeline({
  label,
  state,
  detail,
}: {
  label: string;
  state: StepState;
  detail?: string;
}) {
  return (
    <View style={styles.pipelineRow}>
      <Text style={styles.pipelineMark}>
        {stateMark(state)}
      </Text>
      <Text style={styles.pipelineLabel}>
        {label}
      </Text>
      <Text style={styles.pipelineDetail}>
        {detail || ''}
      </Text>
    </View>
  );
}

function Section({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
    gap: 16,
  },
  header: {
    paddingBottom: 8,
  },
  back: {
    color: colors.gray600,
    fontSize: 14,
    marginBottom: 18,
  },
  version: {
    color: colors.gray500,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    color: colors.gray600,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  section: {
    backgroundColor: colors.paperElevated,
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  pipeline: {
    gap: 8,
  },
  pipelineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 26,
  },
  pipelineMark: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    width: 24,
  },
  pipelineLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    width: 82,
  },
  pipelineDetail: {
    color: colors.gray500,
    flex: 1,
    fontSize: 11,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  primaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.gray300,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  secondaryText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.35,
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.gray300,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 112,
  },
  note: {
    color: colors.gray500,
    fontSize: 11,
    lineHeight: 17,
  },
  kicker: {
    color: colors.gray500,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
  body: {
    color: colors.gray700,
    fontSize: 13,
    lineHeight: 20,
  },
  meta: {
    color: colors.gray500,
    fontSize: 11,
    lineHeight: 17,
  },
  preview: {
    borderTopColor: colors.gray300,
    borderTopWidth: 1,
    gap: 8,
    paddingTop: 12,
  },
  previewItem: {
    color: colors.gray700,
    fontSize: 12,
    lineHeight: 18,
  },
  message: {
    color: colors.gray700,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  error: {
    color: '#9B1C1C',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  log: {
    color: '#9B1C1C',
    fontSize: 11,
    lineHeight: 17,
  },
});
