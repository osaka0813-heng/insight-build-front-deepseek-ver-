import React, { useMemo } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { researchDraftRepository } from '../engine/researchDraftRepository';
import { useI18n } from '../i18n/I18nProvider';
import type { ResearchCandidateSignal, ResearchDraftBundle, ResearchSourceRole } from '../types/research';
import { colors, spacing, type } from '../theme/tokens';

type Props = { onBack: () => void; onOpenWriter?: () => void };

export function ResearchDraftsScreen({ onBack, onOpenWriter }: Props) {
  const { language, t } = useI18n();
  const drafts = useMemo(() => researchDraftRepository.getAll(), []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>{t('backToday')}</Text>
          </Pressable>
          <LanguageSwitcher />
        </View>
        <Text style={styles.eyebrow}>{t('aiResearcher')}</Text>
        <Text style={styles.title}>{t('researchDrafts')}</Text>
        <Text style={styles.subtitle}>{t('researchDraftsSubtitle')}</Text>
        {onOpenWriter ? (
          <Pressable onPress={onOpenWriter} style={styles.writerLink}>
            <Text style={styles.writerLinkText}>AI WRITER DRAFTS →</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={drafts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{t('noResearchDrafts')}</Text>}
        renderItem={({ item }) => (
          <DraftCard draft={item} language={language} />
        )}
      />
    </SafeAreaView>
  );
}

function DraftCard({ draft, language }: { draft: ResearchDraftBundle; language: 'en' | 'zh' | 'ja' }) {
  return (
    <View style={styles.draft}>
      <View style={styles.draftTop}>
        <Text style={styles.status}>{draft.status.toUpperCase()}</Text>
        <Text style={styles.date}>{draft.researchDate}</Text>
      </View>
      <Text style={styles.query}>{draft.querySummary}</Text>
      <Text style={styles.meta}>{draft.model} · {draft.candidates.length} signals</Text>
      {draft.candidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} language={language} />
      ))}
    </View>
  );
}

function CandidateCard({ candidate, language }: { candidate: ResearchCandidateSignal; language: 'en' | 'zh' | 'ja' }) {
  const copy = candidate.content[language] ?? candidate.content.en;
  return (
    <View style={styles.candidate}>
      <View style={styles.scoreRow}>
        <Text style={styles.domain}>{candidate.domain.toUpperCase()}</Text>
        <Text style={styles.score}>{candidate.evidenceStrength}% evidence</Text>
      </View>
      <Text style={styles.candidateTitle}>{copy.title}</Text>
      <Text style={styles.body}>{copy.coreFact}</Text>
      <Text style={styles.label}>WHY IT MATTERS</Text>
      <Text style={styles.body}>{copy.whyItMatters}</Text>
      {candidate.analysis ? (
        <View style={styles.analysisBox}>
          <View style={styles.decisionRow}>
            <Text style={styles.decision}>{candidate.analysis.dailyState.replaceAll('_', ' ').toUpperCase()}</Text>
            <Text style={styles.impact}>{candidate.analysis.impact.toUpperCase()}</Text>
          </View>
          <Text style={styles.process}>
            → {candidate.analysis.matchedProcessId ?? 'NEW PROCESS CANDIDATE'} · {candidate.analysis.processMatchConfidence}%
          </Text>
          <Text style={styles.analysisText}>{candidate.analysis.rationale}</Text>
          <Text style={styles.counts}>
            {candidate.analysis.triggerSourceCount} trigger · {candidate.analysis.corroboratingSourceCount} corroborating · {candidate.analysis.contextSourceCount} context
          </Text>
          {candidate.analysis.warnings.map((warning) => (
            <Text key={warning} style={styles.warning}>! {warning}</Text>
          ))}
        </View>
      ) : candidate.suggestedProcessId ? (
        <Text style={styles.process}>→ {candidate.suggestedProcessId} · {candidate.processMatchConfidence}%</Text>
      ) : null}
      <View style={styles.sources}>
        {candidate.sources.map((source) => (
          <Pressable key={source.url} onPress={() => Linking.openURL(source.url)} style={styles.sourceRow}>
            <View style={styles.sourceTop}>
              <Text style={styles.sourceRole}>{sourceRoleLabel(source.role)}</Text>
              <Text style={styles.sourceKind}>{source.kind}</Text>
            </View>
            <Text style={styles.sourceTitle}>{source.title}</Text>
            <Text style={styles.sourceMeta}>{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ''}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}


function sourceRoleLabel(role?: ResearchSourceRole) {
  if (role === 'trigger') return 'TRIGGER';
  if (role === 'corroborating') return 'CORROBORATING';
  return 'CONTEXT';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  eyebrow: { marginTop: spacing.xl, color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.6 },
  title: { marginTop: spacing.sm, color: colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '800' },
  subtitle: { marginTop: spacing.sm, color: colors.gray600, fontSize: 14, lineHeight: 22 },
  writerLink: { marginTop: spacing.md, alignSelf: 'flex-start', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.ink, paddingBottom: 4 },
  writerLinkText: { color: colors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 56 },
  empty: { color: colors.gray600, fontSize: 14, lineHeight: 22 },
  draft: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray300, paddingTop: spacing.lg, marginBottom: spacing.xl },
  draftTop: { flexDirection: 'row', justifyContent: 'space-between' },
  status: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  date: { color: colors.gray500, fontSize: 9, fontWeight: '700' },
  query: { marginTop: spacing.sm, color: colors.ink, fontSize: 18, lineHeight: 25, fontWeight: '800' },
  meta: { marginTop: 6, color: colors.gray500, fontSize: 10 },
  candidate: { marginTop: spacing.lg, padding: spacing.md, backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gray300 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  domain: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  score: { color: colors.gray500, fontSize: 9, fontWeight: '700' },
  candidateTitle: { marginTop: 10, color: colors.ink, fontSize: 20, lineHeight: 27, fontWeight: '800' },
  body: { marginTop: 8, color: colors.gray700, fontSize: 13, lineHeight: 20 },
  label: { marginTop: 14, color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  process: { marginTop: 10, color: colors.ink, fontSize: 11, fontWeight: '800' },
  analysisBox: { marginTop: 14, padding: 12, backgroundColor: colors.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.gray300 },
  decisionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  decision: { color: colors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 0.9 },
  impact: { color: colors.gray600, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  analysisText: { marginTop: 8, color: colors.gray700, fontSize: 11, lineHeight: 17 },
  counts: { marginTop: 8, color: colors.gray500, fontSize: 9, fontWeight: '700' },
  warning: { marginTop: 5, color: colors.gray700, fontSize: 9, lineHeight: 14 },
  sources: { marginTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray300 },
  sourceRow: { paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gray300 },
  sourceTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  sourceRole: { color: colors.ink, fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  sourceKind: { color: colors.gray500, fontSize: 8, fontWeight: '700' },
  sourceTitle: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  sourceMeta: { marginTop: 4, color: colors.gray500, fontSize: 9 },
});
