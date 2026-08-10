import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { worldProcessRepository } from '../engine/worldProcessRepository';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing, type } from '../theme/tokens';
import type { WorldProcess } from '../types/worldProcess';

type Props = { process: WorldProcess; onBack: () => void; onOpenProcess: (processId: string) => void };

export function ConnectionsScreen({ process, onBack, onOpenProcess }: Props) {
  const { language, t } = useI18n();
  const connected = useMemo(() => worldProcessRepository.getRelated(process.id, language, 6), [language, process.id]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} hitSlop={12}><Text style={styles.back}>← {t('worldProcess')}</Text></Pressable>
        <LanguageSwitcher />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{t('relatedProcessEngine')}</Text>
        <Text style={styles.title}>{process.title}</Text>
        <Text style={styles.intro}>{t('connectionMapIntro')}</Text>
        <View style={styles.map}>
          <View style={styles.centralNode}>
            <Text style={styles.nodeLabel}>{t('centralProcess')}</Text>
            <Text style={styles.centralTitle}>{process.title}</Text>
          </View>
          {connected.map((item) => (
            <View key={item.process.id} style={styles.branch}>
              <View style={styles.line} />
              <View style={styles.recommendationMeta}>
                <Text style={styles.relationship}>{item.relationship}</Text>
                <Text style={styles.score}>{item.score}%</Text>
              </View>
              <Pressable onPress={() => onOpenProcess(item.process.id)} style={({ pressed }) => [styles.connectedNode, pressed && styles.pressed]}>
                <Text style={styles.autoLabel}>{t('autoRecommended')}{item.isEditoriallyConfirmed ? ` · ${t('editoriallyConfirmed')}` : ''}</Text>
                <Text style={styles.connectedTitle}>{item.process.title}</Text>
                <Text style={styles.connectedSummary}>{item.process.summary}</Text>
                <Text style={styles.whyLabel}>{t('whyRelated')}</Text>
                <Text style={styles.why}>{item.why}</Text>
                {item.sharedTags.length ? (
                  <View style={styles.tags}>
                    {item.sharedTags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
                  </View>
                ) : null}
                <Text style={styles.open}>{t('openProcess')} →</Text>
              </Pressable>
            </View>
          ))}
          {connected.length === 0 ? <Text style={styles.empty}>{t('emptyProcess')}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.paper, flex: 1 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  back: { color: colors.gray600, fontSize: type.micro, fontWeight: '800', letterSpacing: 0.8 },
  content: { padding: spacing.lg, paddingBottom: 56 },
  eyebrow: { color: colors.gray500, fontSize: type.micro, fontWeight: '800', letterSpacing: 1.8, marginTop: spacing.lg },
  title: { color: colors.ink, fontSize: 38, fontWeight: '800', letterSpacing: -1.2, lineHeight: 44, marginTop: spacing.sm },
  intro: { color: colors.gray600, fontSize: 15, lineHeight: 23, marginTop: spacing.md },
  map: { marginTop: spacing.xl }, centralNode: { backgroundColor: colors.ink, padding: spacing.lg },
  nodeLabel: { color: colors.gray300, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  centralTitle: { color: colors.paper, fontSize: 22, fontWeight: '800', lineHeight: 29, marginTop: 8 },
  branch: { paddingLeft: spacing.lg }, line: { backgroundColor: colors.gray400, height: 28, width: 1 },
  recommendationMeta: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  relationship: { color: colors.gray500, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  score: { color: colors.ink, fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  connectedNode: { borderColor: colors.gray300, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg },
  autoLabel: { color: colors.gray500, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  connectedTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', lineHeight: 27, marginTop: 8 },
  connectedSummary: { color: colors.gray600, fontSize: 13, lineHeight: 20, marginTop: 7 },
  whyLabel: { color: colors.gray500, fontSize: 8, fontWeight: '800', letterSpacing: 1.2, marginTop: 16 },
  why: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { borderColor: colors.gray300, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, paddingVertical: 5 },
  tagText: { color: colors.gray700, fontSize: 9, fontWeight: '700' },
  open: { color: colors.ink, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 14 },
  empty: { color: colors.gray600, fontSize: 14, lineHeight: 22 }, pressed: { opacity: 0.55 },
});
