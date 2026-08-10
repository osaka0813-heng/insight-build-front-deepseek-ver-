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
import { useRemoteContent } from '../state/RemoteContentProvider';
import {
  runAnalyze,
  runResearch,
  runWrite,
  type EditorialRequestError,
  type WriteProgressStage,
} from '../engine/editorialClient';
import {
  reviewWriterDraft,
  type PublishRequestError,
} from '../engine/publishClient';
import {
  checkBackendHealth,
  runProductionPreflight,
  rollbackLatestBackup,
  type PreflightResult,
} from '../engine/productionSafetyClient';
import type { InsightScope, ResearchDraftBundle } from '../types/research';
import type { WriterDraftBundle } from '../types/writer';
import {
  appendEditorialLog,
  clearAdminSession,
  clearEditorialLogs,
  clearEditorialTokens,
  clearPipelineSnapshot,
  loadEditorialLogs,
  loadEditorialTokens,
  loadPipelineSnapshot,
  saveEditorialTokens,
  savePipelineSnapshot,
  type EditorialLogEntry,
} from '../engine/editorialStorage';
import { colors, spacing } from '../theme/tokens';

const DEFAULT_FOCUS_GLOBAL = '过去24小时内，寻找最可能改变现有世界进程判断的重要跨领域信号，重点关注AI、能源、地缘政治、宏观经济与资本。';
const DEFAULT_FOCUS_CHINA = '过去24小时内，寻找最可能改变中国进程判断的重要信号，重点关注房地产与地方财政、先进制造、科技自主、内需、贸易与资本。';
const DEFAULT_FOCUS_US = '过去24小时内，寻找最可能改变美国进程判断的重要信号，重点关注财政与利率、AI资本开支、再工业化、劳动力与移民、能源与资本市场。';
const DEFAULT_FOCUS_JAPAN = '过去24小时内，寻找最可能改变日本进程判断的重要信号，重点关注货币与日元、工资与通胀、人口与劳动力、产业重建、能源、安全与资本流动。';

const AUTO_SCOPES: InsightScope[] = ['global', 'china', 'us', 'japan'];
const SCOPE_LABELS: Record<InsightScope, string> = {
  global: 'GLOBAL · 世界',
  china: 'CHINA · 中国',
  us: 'US · 美国',
  japan: 'JAPAN · 日本',
};

const defaultFocusForScope = (scope: InsightScope) =>
  scope === 'japan'
    ? DEFAULT_FOCUS_JAPAN
    : scope === 'china'
      ? DEFAULT_FOCUS_CHINA
      : scope === 'us'
        ? DEFAULT_FOCUS_US
        : DEFAULT_FOCUS_GLOBAL;

type StepState = 'idle' | 'running' | 'done' | 'blocked' | 'error';
type AutoStage = 'idle' | 'research' | 'analyze' | 'write' | 'publish' | 'done' | 'error';
type AutoScopeStatus = { stage: AutoStage; message?: string; insightId?: string };

type Props = {
  onBack: () => void;
  onPublished: (insightId: string) => void;
};

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function writerDraftMissingFields(
  writerDraft?: WriterDraftBundle,
): string[] {
  if (!writerDraft?.insight?.content) return [];

  const missing: string[] = [];

  for (const language of ['en', 'zh', 'ja'] as const) {
    const copy = writerDraft.insight.content[language];

    if (!copy) {
      missing.push(`${language}: entire language content`);
      continue;
    }

    const required: Array<[string, unknown]> = [
      ['cover.title', copy.cover?.title],
      ['cover.summary', copy.cover?.summary],
      ['question.title', copy.question?.title],
      ['question.lead', copy.question?.lead],
      ['signals.title', copy.signals?.title],
      ['pattern.title', copy.pattern?.title],
      ['pattern.before', copy.pattern?.before],
      ['pattern.shift', copy.pattern?.shift],
      ['pattern.now', copy.pattern?.now],
      ['pattern.conclusion', copy.pattern?.conclusion],
      ['insight.title', copy.insight?.title],
      ['insight.explanation', copy.insight?.explanation],
      ['observe.title', copy.observe?.title],
      ['observe.ending', copy.observe?.ending],
    ];

    for (const [field, value] of required) {
      if (typeof value !== 'string' || !value.trim()) {
        missing.push(`${language}.${field}`);
      }
    }

    if (
      !Array.isArray(copy.signals?.items) ||
      copy.signals.items.length === 0
    ) {
      missing.push(`${language}.signals.items`);
    }

    if (
      !Array.isArray(copy.observe?.items) ||
      copy.observe.items.length === 0
    ) {
      missing.push(`${language}.observe.items`);
    }
  }

  return missing;
}

export function EditorialConsoleScreen({ onBack, onPublished }: Props) {
  const { refresh, installPublishedContent, status } = useRemoteContent();
  const [researchToken, setResearchToken] = useState('');
  const [publishToken, setPublishToken] = useState('');
  const [scope, setScope] = useState<InsightScope>('global');
  const [focus, setFocus] = useState(DEFAULT_FOCUS_GLOBAL);
  const [date, setDate] = useState(todayLocal());
  const [researchState, setResearchState] = useState<StepState>('idle');
  const [analyzeState, setAnalyzeState] = useState<StepState>('idle');
  const [writeState, setWriteState] = useState<StepState>('idle');
  const [writeProgress, setWriteProgress] = useState<WriteProgressStage>();
  const [publishState, setPublishState] = useState<StepState>('idle');
  const [researchDraft, setResearchDraft] = useState<ResearchDraftBundle>();
  const [analyzedDraft, setAnalyzedDraft] = useState<ResearchDraftBundle>();
  const [writerDraft, setWriterDraft] = useState<WriterDraftBundle>();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [logs, setLogs] = useState<EditorialLogEntry[]>([]);
  const [restoredAt, setRestoredAt] = useState<string>();
  const [preflight, setPreflight] = useState<PreflightResult>();
  const [preflightRunning, setPreflightRunning] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean>();
  const [lastBackupPath, setLastBackupPath] = useState<string>();
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoStatuses, setAutoStatuses] = useState<Record<InsightScope, AutoScopeStatus>>({
    global: { stage: 'idle' },
    china: { stage: 'idle' },
    us: { stage: 'idle' },
    japan: { stage: 'idle' },
  });
  const isBusy = autoRunning ||
    researchState === 'running' ||
    analyzeState === 'running' ||
    writeState === 'running' ||
    publishState === 'running';

  useEffect(() => {
    checkBackendHealth()
      .then((result) => setBackendHealthy(result.ok))
      .catch(() => setBackendHealthy(false));

    Promise.all([
      loadEditorialTokens(),
      loadPipelineSnapshot(),
      loadEditorialLogs(),
    ])
      .then(([tokens, snapshot, storedLogs]) => {
        setResearchToken(tokens.researchToken);
        setPublishToken(tokens.publishToken);
        setLogs(storedLogs);
        if (snapshot) {
          const restoredScope: InsightScope =
            snapshot.scope === 'china' || snapshot.scope === 'us' || snapshot.scope === 'japan'
              ? snapshot.scope
              : 'global';
          setScope(restoredScope);
          setDate(snapshot.date || todayLocal());
          setFocus(snapshot.focus || defaultFocusForScope(restoredScope));
          setResearchDraft(snapshot.researchDraft);
          setAnalyzedDraft(snapshot.analyzedDraft);
          setWriterDraft(snapshot.writerDraft);
          setResearchState(snapshot.researchDraft ? 'done' : 'idle');
          setAnalyzeState(snapshot.analyzedDraft ? 'done' : 'idle');
          setWriteState(snapshot.writerDraft ? 'done' : 'idle');
          setRestoredAt(snapshot.savedAt);
        }
      })
      .catch(() => undefined);
  }, []);

  const reloadLogs = async () => {
    setLogs(await loadEditorialLogs());
  };

  const saveTokens = async () => {
    await saveEditorialTokens({ researchToken, publishToken });
    setMessage('Token 已保存到设备安全存储。');
  };

  const recordError = async (
    stage: EditorialLogEntry['stage'],
    failure: unknown,
  ) => {
    const requestError = failure as EditorialRequestError;
    const message =
      failure instanceof Error ? failure.message : '未知错误。';
    await appendEditorialLog({
      stage,
      level: 'error',
      message,
      status: requestError.status,
    });
    await reloadLogs();
    return message;
  };

  const persistSnapshot = async (values: {
    researchDraft?: ResearchDraftBundle;
    analyzedDraft?: ResearchDraftBundle;
    writerDraft?: WriterDraftBundle;
  }) => {
    await savePipelineSnapshot({
      savedAt: new Date().toISOString(),
      scope,
      date,
      focus,
      researchDraft: values.researchDraft,
      analyzedDraft: values.analyzedDraft,
      writerDraft: values.writerDraft,
    });
  };

  const runPreflight = async () => {
    if (preflightRunning) return;
    setPreflightRunning(true);
    setError(undefined);

    try {
      const result = await runProductionPreflight(publishToken);
      setPreflight(result);
      setMessage(
        result.ok
          ? '发布环境检查通过。'
          : '发布环境存在问题，请先处理红色项目。',
      );
      await appendEditorialLog({
        stage: 'sync',
        level: result.ok ? 'info' : 'error',
        message: result.ok
          ? 'Production preflight passed.'
          : 'Production preflight found blocking issues.',
        contentVersion: result.contentVersion,
      });
      await reloadLogs();
    } catch (preflightError) {
      setPreflight(undefined);
      setError(await recordError('sync', preflightError));
    } finally {
      setPreflightRunning(false);
    }
  };

  const updateAutoStatus = (
    targetScope: InsightScope,
    stage: AutoStage,
    message?: string,
    insightId?: string,
  ) => {
    setAutoStatuses((current) => ({
      ...current,
      [targetScope]: { stage, message, insightId },
    }));
  };

  const runWriteWithRetry = async (
    draft: ResearchDraftBundle,
    targetScope: InsightScope,
  ) => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        return await runWrite(
          draft,
          researchToken,
          false,
          (stage) => {
            const label =
              stage === 'english'
                ? '英文主稿'
                : stage === 'chinese'
                  ? '中文'
                  : stage === 'japanese'
                    ? '日文'
                    : '合并校验';
            updateAutoStatus(targetScope, 'write', `Write · ${label}`);
          },
        );
      } catch (failure) {
        lastError = failure;
        if (attempt < 2) {
          updateAutoStatus(
            targetScope,
            'write',
            'Write 返回异常，正在自动重试当前区域…',
          );
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
    }
    throw lastError;
  };

  const runAllScopes = async () => {
    if (autoRunning || isBusy) return;
    if (!researchToken.trim() || !publishToken.trim()) {
      setError('请先保存 Research API Token 和 Publish API Token。');
      return;
    }

    setAutoRunning(true);
    setError(undefined);
    setMessage('正在执行四区域自动更新。整个过程可能持续数分钟，请保持 Expo 在前台。');
    setAutoStatuses({
      global: { stage: 'idle' },
      china: { stage: 'idle' },
      us: { stage: 'idle' },
      japan: { stage: 'idle' },
    });

    try {
      setPreflightRunning(true);
      const safety = await runProductionPreflight(publishToken);
      setPreflight(safety);
      if (!safety.ok) {
        throw new Error('发布环境检查未通过，自动更新已停止。');
      }
      setPreflightRunning(false);

      let finalInsightId: string | undefined;

      for (const targetScope of AUTO_SCOPES) {
        try {
          updateAutoStatus(targetScope, 'research', 'Research');
          const research = await runResearch(
            {
              scope: targetScope,
              date,
              focus: defaultFocusForScope(targetScope),
              maxSignals: 1,
            },
            researchToken,
          );

          updateAutoStatus(targetScope, 'analyze', 'Analyze');
          const analyzed = await runAnalyze(research, researchToken);

          updateAutoStatus(targetScope, 'write', 'Write · 英文主稿');
          const written = await runWriteWithRetry(
            analyzed.draft,
            targetScope,
          );

          const missing = writerDraftMissingFields(written.writerDraft);
          if (missing.length > 0) {
            throw new Error(
              `Writer 草稿字段不完整：${missing.slice(0, 5).join(', ')}`,
            );
          }

          updateAutoStatus(targetScope, 'publish', 'Publish');
          const published = await reviewWriterDraft(
            written.writerDraft,
            'approve',
            publishToken,
          );

          if (published.content) {
            await installPublishedContent(published.content);
          } else {
            await refresh(published.contentVersion);
          }

          const insightId =
            published.insightId || written.writerDraft.insight?.id;
          finalInsightId = insightId || finalInsightId;

          updateAutoStatus(
            targetScope,
            'done',
            '已发布',
            insightId,
          );

          await appendEditorialLog({
            stage: 'publish',
            level: 'info',
            message: `AUTO ${SCOPE_LABELS[targetScope]} published.`,
            contentVersion: published.contentVersion,
            insightId,
          });
        } catch (scopeError) {
          const rawMessage =
            scopeError instanceof Error
              ? scopeError.message
              : '未知错误';
          const shortMessage =
            rawMessage.length > 220
              ? `${rawMessage.slice(0, 220)}…`
              : rawMessage;
          updateAutoStatus(
            targetScope,
            'error',
            shortMessage,
          );
          await appendEditorialLog({
            stage: 'publish',
            level: 'error',
            message: `AUTO ${SCOPE_LABELS[targetScope]} failed: ${shortMessage}`,
          });
          // One regional failure should not prevent the other scopes from updating.
        }
      }

      await reloadLogs();
      const resultSnapshot = Object.values(autoStatuses);
      setMessage(
        '四区域自动流程已结束。成功区域已经立即发布；失败区域可以再次运行自动更新重试。',
      );
      if (finalInsightId) {
        // Keep the editor open so the user can inspect all four scope statuses.
      }
    } catch (autoError) {
      setError(
        autoError instanceof Error
          ? autoError.message
          : '四区域自动更新失败。',
      );
    } finally {
      setPreflightRunning(false);
      setAutoRunning(false);
    }
  };

  const runPipeline = async () => {
    if (isBusy) return;
    if (!researchToken.trim()) {
      setError('请先填写 Research API Token。');
      return;
    }

    setError(undefined);
    setMessage(undefined);
    setResearchDraft(undefined);
    setAnalyzedDraft(undefined);
    setWriterDraft(undefined);
    setPublishState('idle');
    await clearPipelineSnapshot();

    let stage: 'research' | 'analyze' | 'write' = 'research';

    try {
      setResearchState('running');
      setAnalyzeState('idle');
      setWriteState('idle');

      const research = await runResearch(
        { scope, date, focus, maxSignals: 1 },
        researchToken,
      );
      setResearchDraft(research);
      setResearchState('done');
      await persistSnapshot({ researchDraft: research });

      stage = 'analyze';
      setAnalyzeState('running');
      const analyzed = await runAnalyze(research, researchToken);
      setAnalyzedDraft(analyzed.draft);
      setAnalyzeState('done');
      await persistSnapshot({
        researchDraft: research,
        analyzedDraft: analyzed.draft,
      });

      stage = 'write';
      setWriteState('running');
      try {
        const written = await runWrite(
          analyzed.draft,
          researchToken,
          false,
          setWriteProgress,
        );
        setWriterDraft(written.writerDraft);
        setWriteState('done');
        setWriteProgress(undefined);
        await persistSnapshot({
          researchDraft: research,
          analyzedDraft: analyzed.draft,
          writerDraft: written.writerDraft,
        });
      } catch (writeError) {
        const payload = (writeError as EditorialRequestError)?.payload;
        if ((writeError as EditorialRequestError)?.status === 422) {
          setWriteState('blocked');
          const blockedMessage =
            payload?.error ||
            '候选未达到自动发布门槛。可选择“生成覆盖草稿”。';
          setError(blockedMessage);
          await appendEditorialLog({
            stage: 'write',
            level: 'info',
            message: blockedMessage,
            status: 422,
          });
          await reloadLogs();
          return;
        }
        throw writeError;
      }
    } catch (pipelineError) {
      if (stage === 'research') setResearchState('error');
      if (stage === 'analyze') setAnalyzeState('error');
      if (stage === 'write') setWriteState('error');
      setError(await recordError(stage, pipelineError));
    }
  };

  const retryAnalyze = async () => {
    if (!researchDraft || isBusy) return;
    setError(undefined);
    setAnalyzeState('running');
    try {
      const analyzed = await runAnalyze(researchDraft, researchToken);
      setAnalyzedDraft(analyzed.draft);
      setAnalyzeState('done');
      setWriteState('idle');
      await persistSnapshot({
        researchDraft,
        analyzedDraft: analyzed.draft,
      });
    } catch (retryError) {
      setAnalyzeState('error');
      setError(await recordError('analyze', retryError));
    }
  };

  const retryWrite = async () => {
    if (!analyzedDraft || isBusy) return;
    setError(undefined);
    setWriteState('running');
    try {
      const written = await runWrite(
        analyzedDraft,
        researchToken,
        false,
        setWriteProgress,
      );
      setWriterDraft(written.writerDraft);
      setWriteState('done');
      setWriteProgress(undefined);
      await persistSnapshot({
        researchDraft,
        analyzedDraft,
        writerDraft: written.writerDraft,
      });
    } catch (retryError) {
      const requestError = retryError as EditorialRequestError;
      setWriteState(requestError.status === 422 ? 'blocked' : 'error');
      setError(await recordError('write', retryError));
    }
  };

  const publish = async () => {
    if (!writerDraft) return;

    if (writerMissingFields.length > 0) {
      setError(
        `Writer 草稿内容不完整，尚不能发布：\n${writerMissingFields.join('\n')}`,
      );
      return;
    }

    if (preflight?.ok !== true) {
      setError('批准发布前，请先执行并通过“发布前安全检查”。');
      return;
    }

    if (!publishToken.trim()) {
      setError('请先填写 Publish API Token。');
      return;
    }
    setPublishState('running');
    setError(undefined);
    setMessage(undefined);
    try {
      const result = await reviewWriterDraft(
        writerDraft,
        'approve',
        publishToken,
      );

      if (result.content) {
        const publishedInsightId =
          result.insightId ||
          writerDraft.insight?.id;

        if (!publishedInsightId) {
          throw new Error('发布成功，但返回结果缺少 insightId。');
        }

        await installPublishedContent(result.content);
        setLastBackupPath(result.safety?.backupPath);
        await appendEditorialLog({
          stage: 'publish',
          level: 'info',
          message: result.alreadyProcessed
            ? 'Publish request was already processed; current content restored.'
            : 'Insight published, backed up, and installed.',
          contentVersion: result.contentVersion,
          insightId: publishedInsightId,
        });
        await clearPipelineSnapshot();
        await reloadLogs();

        setPublishState('done');
        setMessage('发布并同步成功，正在打开最新内容。');

        setTimeout(() => {
          onPublished(publishedInsightId);
        }, 350);
        return;
      }

      // Compatibility fallback for an older backend that does not yet return
      // the published content bundle.
      setMessage('发布成功，正在等待公共内容完成同步。');
      const synced = await refresh(result.contentVersion);

      if (!synced) {
        setPublishState('error');
        setError(
          '发布已成功，但后端尚未返回新内容，公共地址也仍是旧版本。请先更新后端 publish.mjs。',
        );
        return;
      }

      const publishedInsightId =
        result.insightId ||
        writerDraft.insight?.id;

      if (!publishedInsightId) {
        throw new Error('发布成功，但返回结果缺少 insightId。');
      }

      setPublishState('done');
      setMessage('发布并同步成功，正在打开最新内容。');
      setTimeout(() => {
        onPublished(publishedInsightId);
      }, 350);
    } catch (publishError) {
      setPublishState('error');
      const requestError = publishError as PublishRequestError;
      const validationErrors =
        requestError.payload?.validation?.errors;

      if (
        Array.isArray(validationErrors) &&
        validationErrors.length > 0
      ) {
        const detailedMessage =
          `合并后的内容仍有缺失字段：\n${validationErrors.join('\n')}`;
        setError(detailedMessage);
        await appendEditorialLog({
          stage: 'publish',
          level: 'error',
          message: validationErrors.join(' | '),
          status: requestError.status,
        });
        await reloadLogs();
      } else {
        setError(await recordError('publish', publishError));
      }
    }
  };

  const candidate = analyzedDraft?.candidates?.[0];
  const analysis = candidate?.analysis;
  const copy = candidate?.content?.zh ?? candidate?.content?.en;
  const writerCopy =
    writerDraft?.insight?.content?.zh ??
    writerDraft?.insight?.content?.en;
  const writerMissingFields = useMemo(
    () => writerDraftMissingFields(writerDraft),
    [writerDraft],
  );
  const writerDraftComplete = writerMissingFields.length === 0;
  const canApprove =
    writerDraftComplete &&
    preflight?.ok === true;

  const steps = useMemo(() => [
    ['01 Research', researchState],
    ['02 Analyze', analyzeState],
    ['03 Write', writeState],
    ['04 Publish', publishState],
  ] as const, [researchState, analyzeState, writeState, publishState]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack}><Text style={styles.back}>← 返回</Text></Pressable>
        <Text style={styles.eyebrow}>BUILD013 · MULTI-SCOPE BETA</Text>
        <Text style={styles.title}>AI 编辑台</Text>
        <Text style={styles.subtitle}>WORLD / CHINA / US / JAPAN · AUTO RESEARCH → PUBLISH</Text>
        {writeState === 'running' && writeProgress ? (
          <Text style={styles.note}>
            分段写作：{writeProgress === 'english'
              ? '正在生成英文主稿…'
              : writeProgress === 'chinese'
                ? '英文完成，正在生成中文…'
                : writeProgress === 'japanese'
                  ? '中文完成，正在生成日文…'
                  : '三语完成，正在合并校验…'}
          </Text>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.statusRow}>
          {steps.map(([label, state]) => <Step key={label} label={label} state={state} />)}
        </View>

        <Section title="自动更新">
          <Text style={styles.autoTitle}>一键生成并发布四个区域</Text>
          <Text style={styles.body}>
            按 WORLD → CHINA → US → JAPAN 顺序自动完成 Research、Analyze、分段 Write 与 Publish。
            中途不需要再逐个点击。
          </Text>
          <Pressable
            disabled={isBusy}
            onPress={() => void runAllScopes()}
            style={[styles.primaryButton, isBusy && styles.disabledButton]}
          >
            {autoRunning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>开始四区域自动更新</Text>
            )}
          </Pressable>
          <Text style={styles.note}>
            为避免 DeepSeek / Vercel 长请求超时，界面是一键执行，但内部仍按区域和语言拆成短请求自动串行运行。
          </Text>
          <View style={styles.autoGrid}>
            {AUTO_SCOPES.map((item) => {
              const statusItem = autoStatuses[item];
              const stageLabel =
                statusItem.stage === 'idle'
                  ? '等待'
                  : statusItem.stage === 'research'
                    ? 'Research'
                    : statusItem.stage === 'analyze'
                      ? 'Analyze'
                      : statusItem.stage === 'write'
                        ? 'Write'
                        : statusItem.stage === 'publish'
                          ? 'Publish'
                          : statusItem.stage === 'done'
                            ? '✓ 已发布'
                            : '× 失败';
              return (
                <View key={item} style={styles.autoRow}>
                  <Text style={styles.autoScope}>{SCOPE_LABELS[item]}</Text>
                  <View style={styles.autoStatusBody}>
                    <Text
                      style={[
                        styles.autoStage,
                        statusItem.stage === 'error' && styles.autoStageError,
                      ]}
                    >
                      {stageLabel}
                    </Text>
                    {statusItem.message ? (
                      <Text style={styles.autoMessage}>{statusItem.message}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </Section>

        <Section title="连接设置">
          <TextInput value={researchToken} onChangeText={setResearchToken} secureTextEntry placeholder="Research API Token" placeholderTextColor={colors.gray500} style={styles.input} autoCapitalize="none" />
          <TextInput value={publishToken} onChangeText={setPublishToken} secureTextEntry placeholder="Publish API Token" placeholderTextColor={colors.gray500} style={styles.input} autoCapitalize="none" />
          <Pressable onPress={() => void saveTokens()} style={styles.secondaryButton}><Text style={styles.secondaryText}>保存到当前设备</Text></Pressable>
          <Text style={styles.note}>Token 使用设备安全存储；旧版明文 Token 会自动迁移并删除。</Text>
        </Section>

        <Section title="研究范围">
          <View style={styles.scopeRow}>
            {AUTO_SCOPES.map((item) => {
              const selected = scope === item;
              return (
                <Pressable key={item} disabled={isBusy} onPress={() => { setScope(item); setFocus(defaultFocusForScope(item)); setResearchDraft(undefined); setAnalyzedDraft(undefined); setWriterDraft(undefined); setResearchState('idle'); setAnalyzeState('idle'); setWriteState('idle'); setPreflight(undefined); void clearPipelineSnapshot(); }} style={[styles.scopeButton, selected && styles.scopeButtonActive]}>
                  <Text style={[styles.scopeButtonText, selected && styles.scopeButtonTextActive]}>{SCOPE_LABELS[item]}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.note}>
            当前手动研究范围：{SCOPE_LABELS[scope]}。Research、Analyze、Write 会使用对应区域自己的 Process Catalog。
          </Text>
        </Section>

        <Section title="今日研究">
          <TextInput value={date} onChangeText={setDate} style={styles.input} placeholder="YYYY-MM-DD" />
          <TextInput value={focus} onChangeText={setFocus} style={[styles.input, styles.multiline]} multiline textAlignVertical="top" />
          <Pressable
            disabled={isBusy}
            onPress={() => void runPipeline()}
            style={[styles.primaryButton, isBusy && styles.disabledButton]}
          >
            {researchState === 'running' || analyzeState === 'running' || writeState === 'running' ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>开始今日研究</Text>}
          </Pressable>
          {analyzeState === 'error' && researchDraft ? (
            <Pressable
              disabled={isBusy}
              onPress={() => void retryAnalyze()}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>从 Analyze 继续</Text>
            </Pressable>
          ) : null}
          {writeState === 'error' && analyzedDraft ? (
            <Pressable
              disabled={isBusy}
              onPress={() => void retryWrite()}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>从 Write 继续</Text>
            </Pressable>
          ) : null}
          {restoredAt ? (
            <Text style={styles.note}>
              已恢复上次流程：{new Date(restoredAt).toLocaleString()}
            </Text>
          ) : null}
        </Section>

        {analysis && copy ? (
          <Section title={`Analyst 判断 · ${SCOPE_LABELS[scope]}`}>
            <Text style={styles.kicker}>{analysis.dailyState.replaceAll('_', ' ').toUpperCase()}</Text>
            <Text style={styles.cardTitle}>{copy.title}</Text>
            <Text style={styles.body}>{analysis.rationale}</Text>
            <Text style={styles.meta}>Process：{analysis.matchedProcessId || '未匹配'} · {analysis.processMatchConfidence}%</Text>
            <Text style={styles.meta}>Material change：{analysis.materialChangeScore} · Evidence：{candidate?.evidenceStrength}</Text>
            <Text style={styles.meta}>{analysis.triggerSourceCount} trigger · {analysis.corroboratingSourceCount} corroborating · {analysis.contextSourceCount} context</Text>
          </Section>
        ) : null}

        {writerDraft && writerCopy ? (
          <Section title="Writer 草稿">
            <Text style={styles.kicker}>{writerDraft.dailyState.replaceAll('_', ' ').toUpperCase()}</Text>
            <Text style={styles.cardTitle}>{writerCopy.cover.title}</Text>
            <Text style={styles.body}>{writerCopy.cover.summary}</Text>
            <Text style={styles.meta}>对应进程：{writerDraft.matchedProcessId || '未匹配'}</Text>
            <Text style={styles.meta}>三语完整：{writerDraft.qualityChecks.languagesComplete ? '✓' : '×'} · 来源保留：{writerDraft.qualityChecks.sourceUrlsPreserved ? '✓' : '×'}</Text>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>六页预览</Text>
              <Text style={styles.previewTitle}>01 {writerCopy.cover.title}</Text>
              <Text style={styles.previewTitle}>02 {writerCopy.question.title}</Text>
              <Text style={styles.previewTitle}>03 {writerCopy.signals.title}</Text>
              <Text style={styles.previewTitle}>04 {writerCopy.pattern.title}</Text>
              <Text style={styles.previewTitle}>05 {writerCopy.insight.title}</Text>
              <Text style={styles.previewTitle}>06 {writerCopy.observe.title}</Text>

              {writerMissingFields.length > 0 ? (
                <View style={styles.draftWarning}>
                  <Text style={styles.draftWarningTitle}>
                    Writer 草稿缺少字段
                  </Text>
                  {writerMissingFields.map((field) => (
                    <Text key={field} style={styles.draftWarningItem}>
                      {field}
                    </Text>
                  ))}
                  <Text style={styles.draftWarningNote}>
                    第04页标题可以自动补齐，但“过去 / 转变 / 现在 / 结论”的正文不能凭空生成。
                  </Text>
                </View>
              ) : null}
            </View>
            <Pressable
              disabled={!canApprove || publishState === 'running'}
              onPress={() => void publish()}
              style={[
                styles.primaryButton,
                !canApprove && styles.disabled,
              ]}
            >
              <Text style={styles.primaryText}>批准发布</Text>
            </Pressable>
          </Section>
        ) : null}

        <Section title="发布前安全检查">
          <View style={styles.safetyStatusRow}>
            <Text style={styles.safetyStatusLabel}>后端</Text>
            <Text style={styles.safetyStatusValue}>
              {backendHealthy === undefined
                ? '检查中'
                : backendHealthy
                  ? 'ONLINE'
                  : 'OFFLINE'}
            </Text>
          </View>

          <Pressable
            disabled={preflightRunning || isBusy}
            onPress={() => void runPreflight()}
            style={[
              styles.secondaryButton,
              (preflightRunning || isBusy) && styles.disabledButton,
            ]}
          >
            <Text style={styles.secondaryText}>
              {preflightRunning ? '正在检查…' : '执行发布前安全检查'}
            </Text>
          </Pressable>

          {preflight ? (
            <View style={styles.preflightList}>
              {preflight.checks.map((check) => (
                <View key={check.id} style={styles.preflightRow}>
                  <Text
                    style={[
                      styles.preflightMark,
                      !check.ok && styles.preflightMarkFailed,
                    ]}
                  >
                    {check.ok ? 'PASS' : 'BLOCK'}
                  </Text>
                  <View style={styles.preflightBody}>
                    <Text style={styles.preflightLabel}>{check.label}</Text>
                    <Text style={styles.preflightDetail}>{check.detail}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.note}>
                当前内容版本：{preflight.contentVersion || '—'}
              </Text>
            </View>
          ) : null}

          {lastBackupPath ? (
            <Text style={styles.note}>
              最近发布备份：{lastBackupPath}
            </Text>
          ) : null}

          <Pressable
            disabled={isBusy}
            onPress={async () => {
              setError(undefined);
              setMessage('正在恢复最近一次正式发布前备份…');
              try {
                const result = await rollbackLatestBackup(publishToken);
                await installPublishedContent(result.content);
                setMessage(
                  `已恢复备份：${result.backupPath}。正在返回恢复后的首页。`,
                );
                setTimeout(onBack, 450);
              } catch (rollbackError) {
                setError(await recordError('sync', rollbackError));
              }
            }}
            style={[
              styles.secondaryButton,
              isBusy && styles.disabledButton,
            ]}
          >
            <Text style={styles.secondaryText}>恢复最近发布前备份</Text>
          </Pressable>
        </Section>

        <Section title="维护与错误记录">
          <View style={styles.maintenanceRow}>
            <Pressable
              onPress={async () => {
                await clearPipelineSnapshot();
                setResearchDraft(undefined);
                setAnalyzedDraft(undefined);
                setWriterDraft(undefined);
                setResearchState('idle');
                setAnalyzeState('idle');
                setWriteState('idle');
                setRestoredAt(undefined);
                setMessage('已清除本地流程草稿。');
              }}
              style={styles.maintenanceButton}
            >
              <Text style={styles.maintenanceText}>清除流程草稿</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await clearEditorialTokens();
                setResearchToken('');
                setPublishToken('');
                setMessage('已清除设备中的 API Token。');
              }}
              style={styles.maintenanceButton}
            >
              <Text style={styles.maintenanceText}>清除 Token</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await clearAdminSession();
                setMessage('管理员会话已锁定；退出后需重新验证。');
              }}
              style={styles.maintenanceButton}
            >
              <Text style={styles.maintenanceText}>锁定编辑台</Text>
            </Pressable>
          </View>

          {logs.slice(0, 5).map((entry) => (
            <View key={entry.id} style={styles.logRow}>
              <Text style={styles.logMeta}>
                {entry.stage.toUpperCase()} · {new Date(entry.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.logMessage}>{entry.message}</Text>
            </View>
          ))}

          {logs.length ? (
            <Pressable
              onPress={async () => {
                await clearEditorialLogs();
                setLogs([]);
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>清除错误记录</Text>
            </Pressable>
          ) : (
            <Text style={styles.note}>当前设备没有错误记录。</Text>
          )}
        </Section>

        <Section title="同步状态">
          <Text style={styles.meta}>来源：{status.source.toUpperCase()}</Text>
          <Text style={styles.meta}>内容版本：{status.contentVersion}</Text>
          <Text style={styles.meta}>最后同步：{status.lastSuccessfulSyncAt || '—'}</Text>
          <Pressable onPress={() => void refresh()} style={styles.secondaryButton}><Text style={styles.secondaryText}>立即刷新内容</Text></Pressable>
        </Section>

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function Step({ label, state }: { label: string; state: StepState }) {
  const symbol = state === 'done' ? '✓' : state === 'running' ? '…' : state === 'blocked' ? '!' : state === 'error' ? '×' : '○';
  return <View style={[styles.step, state === 'done' && styles.stepDone]}><Text style={styles.stepSymbol}>{symbol}</Text><Text style={styles.stepText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  back: { color: colors.gray600, fontSize: 11, fontWeight: '800' },
  eyebrow: { marginTop: spacing.lg, color: colors.gray500, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  title: { marginTop: 6, color: colors.ink, fontSize: 36, lineHeight: 42, fontWeight: '900' },
  subtitle: { marginTop: 8, color: colors.gray600, fontSize: 13, lineHeight: 20 },
  content: { padding: spacing.lg, paddingBottom: 80 },
  autoTitle: { color: colors.ink, fontSize: 19, lineHeight: 25, fontWeight: '900' },
  autoGrid: { marginTop: spacing.md },
  autoRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray300, flexDirection: 'row', paddingVertical: 10, gap: 12 },
  autoScope: { width: 92, color: colors.ink, fontSize: 9, lineHeight: 15, fontWeight: '900', letterSpacing: 0.7 },
  autoStatusBody: { flex: 1 },
  autoStage: { color: colors.ink, fontSize: 10, fontWeight: '900' },
  autoStageError: { color: '#8b2e2e' },
  autoMessage: { marginTop: 3, color: colors.gray600, fontSize: 9, lineHeight: 14 },
  statusRow: { gap: 6, marginBottom: spacing.lg },
  step: { minHeight: 34, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gray300, flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepDone: { borderBottomColor: colors.ink },
  stepSymbol: { width: 20, color: colors.ink, fontSize: 13, fontWeight: '900' },
  stepText: { color: colors.gray700, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  section: { marginTop: spacing.xl, padding: spacing.md, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gray300 },
  sectionTitle: { color: colors.gray500, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 12 },
  input: { marginTop: 8, minHeight: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gray300, paddingHorizontal: 12, paddingVertical: 10, color: colors.ink, fontSize: 12, backgroundColor: colors.paper },
  multiline: { minHeight: 110, lineHeight: 19 },
  reason: { minHeight: 76 },
  primaryButton: { marginTop: 12, minHeight: 48, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  primaryText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  secondaryButton: { marginTop: 10, minHeight: 44, borderWidth: 1, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  secondaryText: { color: colors.ink, fontSize: 11, fontWeight: '900' },
  overrideButton: { marginTop: 10, minHeight: 48, backgroundColor: '#5d4a32', alignItems: 'center', justifyContent: 'center' },
  overrideText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  rejectButton: { marginTop: 10, minHeight: 44, borderWidth: 1, borderColor: '#8b2e2e', alignItems: 'center', justifyContent: 'center' },
  rejectText: { color: '#8b2e2e', fontSize: 11, fontWeight: '900' },
  disabled: { opacity: 0.35 },
  note: { marginTop: 8, color: colors.gray500, fontSize: 9, lineHeight: 14 },
  scopeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scopeButton: { width: '48%', borderWidth: 1, borderColor: colors.gray300, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center' },
  scopeButtonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  scopeButtonText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: colors.ink },
  scopeButtonTextActive: { color: colors.white },
  disabledButton: { opacity: 0.45 },
  maintenanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  maintenanceButton: {
    borderColor: colors.gray300,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  maintenanceText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '800',
  },
  logRow: {
    borderTopColor: colors.gray300,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  logMeta: {
    color: colors.gray500,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  logMessage: {
    color: colors.ink,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  safetyStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  safetyStatusLabel: {
    color: colors.gray500,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  safetyStatusValue: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  preflightList: {
    marginTop: spacing.md,
  },
  preflightRow: {
    borderTopColor: colors.gray300,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: spacing.sm,
  },
  preflightMark: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    width: 42,
  },
  preflightMarkFailed: {
    textDecorationLine: 'underline',
  },
  preflightBody: {
    flex: 1,
  },
  preflightLabel: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  preflightDetail: {
    color: colors.gray600,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },
  draftWarning: {
    borderColor: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  draftWarningTitle: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  draftWarningItem: {
    color: colors.ink,
    fontSize: 10,
    lineHeight: 17,
  },
  draftWarningNote: {
    color: colors.gray600,
    fontSize: 9,
    lineHeight: 15,
    marginTop: spacing.sm,
  },
  kicker: { color: colors.gray500, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { marginTop: 8, color: colors.ink, fontSize: 22, lineHeight: 29, fontWeight: '900' },
  body: { marginTop: 10, color: colors.gray700, fontSize: 12, lineHeight: 19 },
  meta: { marginTop: 8, color: colors.gray600, fontSize: 10, lineHeight: 16 },
  previewBox: { marginTop: 14, padding: 12, backgroundColor: colors.paper },
  previewLabel: { color: colors.gray500, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  previewTitle: { marginTop: 8, color: colors.ink, fontSize: 11, lineHeight: 17, fontWeight: '700' },
  success: { marginTop: spacing.lg, color: '#245b36', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  error: { marginTop: spacing.lg, color: '#8b2e2e', fontSize: 12, lineHeight: 18, fontWeight: '800' },
});
