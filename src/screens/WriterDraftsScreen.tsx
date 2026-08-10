import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { reviewWriterDraft, type PublishAction } from '../engine/publishClient';
import { writerDraftRepository } from '../engine/writerDraftRepository';
import { useI18n } from '../i18n/I18nProvider';
import { useRemoteContent } from '../state/RemoteContentProvider';
import { colors, spacing, type } from '../theme/tokens';
import type { InsightContent, LanguageCode } from '../types/insight';
import type { WriterDraftBundle } from '../types/writer';

type Props = { onBack: () => void };

const labels = {
  en: {
    back: 'BACK', eyebrow: 'REVIEW & PUBLISH', title: 'Insight drafts',
    subtitle: 'Review the six-page draft, then publish or reject it. The token is used once and is not saved.',
    empty: 'No writer drafts yet.', open: 'OPEN DRAFT', close: 'CLOSE PREVIEW',
    checks: 'QUALITY CHECKS', page: 'PAGE', token: 'Publish token',
    approve: 'APPROVE & PUBLISH', reject: 'REJECT', publishing: 'PUBLISHING…',
    rejecting: 'REJECTING…', published: 'Published. The app is refreshing remote content.',
    rejected: 'Draft rejected.', enterToken: 'Enter the one-time publish token first.',
  },
  zh: {
    back: '返回', eyebrow: '审核与发布', title: '洞察草稿',
    subtitle: '确认六页内容后批准发布或拒绝。Token 仅用于本次请求，不会保存在 App 中。',
    empty: '暂时没有 Writer 草稿。', open: '打开草稿', close: '关闭预览',
    checks: '质量检查', page: '第', token: '发布 Token',
    approve: '批准并发布', reject: '拒绝草稿', publishing: '发布中…',
    rejecting: '拒绝中…', published: '发布成功，正在刷新远程内容。',
    rejected: '草稿已拒绝。', enterToken: '请先输入发布 Token。',
  },
  ja: {
    back: '戻る', eyebrow: 'レビューと公開', title: 'インサイト草稿',
    subtitle: '6ページを確認して公開または却下します。Tokenは保存されません。',
    empty: 'Writer草稿はまだありません。', open: '草稿を開く', close: 'プレビューを閉じる',
    checks: '品質チェック', page: 'ページ', token: '公開 Token',
    approve: '承認して公開', reject: '却下', publishing: '公開中…',
    rejecting: '却下中…', published: '公開しました。リモート内容を更新しています。',
    rejected: '草稿を却下しました。', enterToken: '先に公開 Token を入力してください。',
  },
} as const;

export function WriterDraftsScreen({ onBack }: Props) {
  const { language } = useI18n();
  const { refresh, revision } = useRemoteContent();
  const copy = labels[language];
  const drafts = useMemo(() => writerDraftRepository.getAll(), [revision]);
  const [selected, setSelected] = useState<string | undefined>();
  const [token, setToken] = useState('');
  const [workingId, setWorkingId] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const review = async (draft: WriterDraftBundle, action: PublishAction) => {
    if (!token.trim()) {
      setError(copy.enterToken);
      return;
    }

    setWorkingId(draft.id);
    setError(undefined);
    setMessage(undefined);
    try {
      await reviewWriterDraft(draft, action, token);
      setMessage(action === 'approve' ? copy.published : copy.rejected);
      await new Promise((resolve) => setTimeout(resolve, 900));
      await refresh();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Review failed.');
    } finally {
      setWorkingId(undefined);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable onPress={onBack} hitSlop={12}><Text style={styles.back}>{copy.back}</Text></Pressable>
          <LanguageSwitcher />
        </View>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder={copy.token}
          placeholderTextColor={colors.gray500}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.tokenInput}
        />
        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <FlatList
        data={drafts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>{copy.empty}</Text>}
        renderItem={({ item }) => (
          <WriterCard
            draft={item}
            language={language}
            expanded={selected === item.id}
            busy={workingId === item.id}
            onToggle={() => setSelected((value) => value === item.id ? undefined : item.id)}
            onApprove={() => void review(item, 'approve')}
            onReject={() => void review(item, 'reject')}
          />
        )}
      />
    </SafeAreaView>
  );
}

function WriterCard({
  draft,
  language,
  expanded,
  busy,
  onToggle,
  onApprove,
  onReject,
}: {
  draft: WriterDraftBundle;
  language: LanguageCode;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const copy = labels[language];
  const content = draft.insight.content[language] ?? draft.insight.content.en;
  const checks = draft.qualityChecks;
  const canPublish = draft.status === 'draft' && checks.publishThresholdMet && checks.languagesComplete && checks.sourceUrlsPreserved;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={[styles.status, draft.status === 'approved' && styles.approved, draft.status === 'rejected' && styles.rejected]}>
          {draft.status.toUpperCase()}
        </Text>
        <Text style={styles.date}>{draft.writtenAt.slice(0, 10)}</Text>
      </View>
      <Text style={styles.state}>{draft.dailyState.replace(/_/g, ' ').toUpperCase()}</Text>
      <Text style={styles.cardTitle}>{content.cover.title}</Text>
      <Text style={styles.summary}>{content.cover.summary}</Text>
      <Text style={styles.process}>→ {draft.matchedProcessId ?? 'NEW PROCESS CANDIDATE'}</Text>
      <View style={styles.checkBox}>
        <Text style={styles.checkTitle}>{copy.checks}</Text>
        <Check ok={checks.publishThresholdMet} text="Publication threshold" />
        <Check ok={checks.languagesComplete} text="EN / ZH / JA complete" />
        <Check ok={checks.noMarkdownLinksInCopy} text="No links inside narrative copy" />
        <Check ok={checks.sourceUrlsPreserved} text="Research URLs preserved" />
        {checks.warnings.map((warning) => <Text key={warning} style={styles.warning}>! {warning}</Text>)}
      </View>
      <Pressable onPress={onToggle} style={styles.openButton}>
        <Text style={styles.openText}>{expanded ? copy.close : copy.open} →</Text>
      </Pressable>
      {expanded ? <DraftPreview content={content} language={language} /> : null}
      {draft.status === 'draft' ? (
        <View style={styles.actions}>
          <Pressable
            disabled={!canPublish || busy}
            onPress={onApprove}
            style={[styles.approveButton, (!canPublish || busy) && styles.disabled]}
          >
            {busy ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.approveText}>{copy.approve}</Text>}
          </Pressable>
          <Pressable disabled={busy} onPress={onReject} style={[styles.rejectButton, busy && styles.disabled]}>
            <Text style={styles.rejectText}>{copy.reject}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Check({ ok, text }: { ok: boolean; text: string }) {
  return <Text style={styles.check}>{ok ? '✓' : '×'} {text}</Text>;
}

function DraftPreview({ content, language }: { content: InsightContent; language: LanguageCode }) {
  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.preview}>
      <Page number={1} language={language} title={content.cover.title} body={content.cover.summary} />
      <Page number={2} language={language} title={content.question.title} body={`${content.question.lead}\n\n${content.question.footnote}`} />
      <Page number={3} language={language} title={content.signals.title} body={content.signals.items.map((item) => `${item.label} · ${item.title}\n${item.body}`).join('\n\n')} />
      <Page number={4} language={language} title={content.pattern.title} body={`${content.pattern.before}\n\n→ ${content.pattern.shift}\n\n${content.pattern.now}`} />
      <Page number={5} language={language} title={content.insight.title} body={content.insight.explanation} dark />
      <Page number={6} language={language} title={content.observe.title} body={content.observe.items.map((item) => `${item.label} · ${item.prompt}`).join('\n\n')} />
    </ScrollView>
  );
}

function Page({ number, language, title, body, dark = false }: { number: number; language: LanguageCode; title: string; body: string; dark?: boolean }) {
  return (
    <View style={[styles.page, dark && styles.pageDark]}>
      <Text style={[styles.pageNumber, dark && styles.textLight]}>{labels[language].page} {number}</Text>
      <Text style={[styles.pageTitle, dark && styles.textLight]}>{title}</Text>
      <Text style={[styles.pageBody, dark && styles.textMutedLight]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  eyebrow: { marginTop: spacing.xl, color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6 },
  title: { marginTop: spacing.sm, color: colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '800' },
  subtitle: { marginTop: spacing.sm, color: colors.gray600, fontSize: 14, lineHeight: 22 },
  tokenInput: { marginTop: spacing.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gray300, backgroundColor: '#fff', color: colors.ink, fontSize: 13, paddingHorizontal: 14, paddingVertical: 12 },
  success: { marginTop: 8, color: colors.ink, fontSize: 11, lineHeight: 17, fontWeight: '700' },
  error: { marginTop: 8, color: '#8b2e2e', fontSize: 11, lineHeight: 17, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 56 },
  empty: { color: colors.gray600, fontSize: 14 },
  card: { marginBottom: spacing.xl, padding: spacing.md, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gray300 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  status: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1, color: colors.ink },
  approved: { color: '#245b36' },
  rejected: { color: '#8b2e2e' },
  date: { fontSize: 9, fontWeight: '700', color: colors.gray500 },
  state: { marginTop: 12, fontSize: 9, fontWeight: '900', letterSpacing: 1, color: colors.gray500 },
  cardTitle: { marginTop: 8, fontSize: 23, lineHeight: 30, fontWeight: '800', color: colors.ink },
  summary: { marginTop: 8, fontSize: 13, lineHeight: 20, color: colors.gray700 },
  process: { marginTop: 12, fontSize: 10, fontWeight: '800', color: colors.ink },
  checkBox: { marginTop: 16, padding: 12, backgroundColor: colors.paper },
  checkTitle: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1, color: colors.gray500, marginBottom: 7 },
  check: { marginTop: 4, fontSize: 10, lineHeight: 15, color: colors.gray700 },
  warning: { marginTop: 5, fontSize: 9, lineHeight: 14, color: colors.gray700 },
  openButton: { marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray300, paddingTop: 12 },
  openText: { fontSize: 10, fontWeight: '900', color: colors.ink, letterSpacing: 0.7 },
  preview: { marginTop: 18 },
  page: { width: 292, minHeight: 420, marginRight: 12, padding: 20, backgroundColor: colors.paper, justifyContent: 'center' },
  pageDark: { backgroundColor: colors.ink },
  pageNumber: { position: 'absolute', top: 18, left: 20, fontSize: 9, fontWeight: '800', color: colors.gray500 },
  pageTitle: { fontSize: 24, lineHeight: 31, fontWeight: '800', color: colors.ink },
  pageBody: { marginTop: 18, fontSize: 13, lineHeight: 21, color: colors.gray700 },
  textLight: { color: '#fff' },
  textMutedLight: { color: '#d8d8d3' },
  actions: { marginTop: 18, gap: 10 },
  approveButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink, paddingHorizontal: 16 },
  approveText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  rejectButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gray300, paddingHorizontal: 16 },
  rejectText: { color: colors.ink, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  disabled: { opacity: 0.35 },
});
