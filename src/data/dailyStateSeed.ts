import type { LocalizedDailyState } from '../types/dailyState';

export const dailyStateSeed: LocalizedDailyState[] = [
  {
    id: 'daily-2026-08-01',
    date: '2026-08-01',
    decidedAt: '2026-08-01T16:30:00+09:00',
    state: 'no_new_global_insight',
    candidateSignalIds: ['candidate-2026-08-01-follow-through'],
    previousInsightId: 'global-2026-07-31-industrial-ai',
    processId: 'process-ai-infrastructure-race',
    materialChangeScore: 38,
    evidenceStrength: 74,
    noveltyScore: 31,
    importanceScore: 69,
    content: {
      en: {
        label: 'NO MATERIAL UPDATE',
        decisionTitle: 'Today added confirmation, not a new world-level change.',
        decisionSummary: 'Follow-through signals remain consistent with the industrialization of AI infrastructure, but they do not alter the current thesis or process stage.',
        thresholdReason: 'The evidence is credible enough to keep watching, yet it does not reveal a new system relationship, challenge the thesis, or trigger a stage transition.',
        observeNext: [
          'Whether project guarantees begin to appear across multiple AI operators.',
          'Whether dedicated generation moves from proposals into binding construction schedules.',
          'Whether utilities disclose a measurable transfer of grid and credit risk to other customers.'
        ]
      },
      zh: {
        label: '暂无重大更新',
        decisionTitle: '今天增加的是确认，而不是新的世界级变化。',
        decisionSummary: '后续信号仍然符合“AI基础设施正在工业化”的判断，但没有改变当前命题，也没有推动进程进入新阶段。',
        thresholdReason: '现有证据值得继续观察，但尚未揭示新的系统关系、挑战原判断，或触发阶段跃迁。',
        observeNext: [
          '项目担保是否开始在更多AI运营商之间扩散。',
          '专用发电是否从提案进入具有约束力的建设时间表。',
          '电力公司是否披露电网与信用风险被明确转移给其他客户。'
        ]
      },
      ja: {
        label: '重要な更新なし',
        decisionTitle: '今日は確認材料が増えたが、世界レベルの新しい変化ではない。',
        decisionSummary: '追随シグナルはAIインフラの産業化という判断と整合するが、現在の命題や段階を変えていない。',
        thresholdReason: '継続観察に値する証拠はあるが、新しいシステム関係、命題への反証、段階移行のいずれにも達していない。',
        observeNext: [
          'プロジェクト保証が複数のAI事業者へ広がるか。',
          '専用電源が提案から拘束力ある建設日程へ移るか。',
          '電力会社が系統・信用リスクの他顧客への移転を明示するか。'
        ]
      }
    }
  },
  {
    id: 'daily-2026-07-31',
    date: '2026-07-31',
    decidedAt: '2026-07-31T13:30:00+09:00',
    state: 'update_living',
    candidateSignalIds: ['candidate-2026-07-31-project-finance', 'candidate-2026-07-31-industrial-site', 'candidate-2026-07-31-utility-demand'],
    insightId: 'global-2026-07-31-industrial-ai',
    previousInsightId: 'global-2026-07-29-capacity',
    processId: 'process-ai-infrastructure-race',
    materialChangeScore: 88,
    evidenceStrength: 91,
    noveltyScore: 82,
    importanceScore: 94,
    content: {
      en: {
        label: 'PROCESS UPDATE',
        decisionTitle: 'An existing world process crossed into a new operating phase.',
        decisionSummary: 'New financing, land and utility evidence changed the thesis from capacity scarcity to industrial assembly.',
        thresholdReason: 'The evidence is independent, cross-domain and strong enough to update the current World Process rather than publish a separate one.'
      },
      zh: {
        label: '进程更新',
        decisionTitle: '一个既有世界进程进入了新的运行阶段。',
        decisionSummary: '融资、土地与公用事业的新证据，把判断从“容量稀缺”推进到“工业化组织能力”。',
        thresholdReason: '证据来自彼此独立的多个领域，足以更新现有世界进程，但还不足以建立一条全新的世界进程。'
      },
      ja: {
        label: 'プロセス更新',
        decisionTitle: '既存の世界プロセスが新しい運用段階へ移った。',
        decisionSummary: '金融・土地・電力の新証拠により、判断は「容量不足」から「産業的な組成能力」へ進んだ。',
        thresholdReason: '複数領域の独立した証拠が既存プロセスの更新には十分だが、新しい世界プロセスを立てる段階ではない。'
      }
    }
  },
  {
    id: 'daily-2026-07-30',
    date: '2026-07-30',
    decidedAt: '2026-07-30T18:00:00+09:00',
    state: 'no_new_global_insight',
    candidateSignalIds: ['candidate-2026-07-30-support'],
    processId: 'process-ai-infrastructure-race',
    materialChangeScore: 34,
    evidenceStrength: 67,
    noveltyScore: 28,
    importanceScore: 61,
    content: {
      en: {
        label: 'NO MATERIAL UPDATE',
        decisionTitle: 'The world moved, but the thesis did not need to change.',
        decisionSummary: 'Several supporting signals appeared, yet none crossed the threshold for a new Global Insight.',
        thresholdReason: 'The signals reinforced existing expectations without changing the system relationship or the process stage.'
      },
      zh: {
        label: '暂无重大更新',
        decisionTitle: '世界仍在变化，但现有判断无需改变。',
        decisionSummary: '出现了若干支持性信号，但没有任何一项跨过全球级洞察的发布门槛。',
        thresholdReason: '这些信号只是在强化既有预期，没有改变系统关系，也没有推动世界进程发生阶段跃迁。'
      },
      ja: {
        label: '重要な更新なし',
        decisionTitle: '世界は動いたが、判断を変える必要はなかった。',
        decisionSummary: '支持材料は増えたが、新しいグローバルインサイトの閾値には届かなかった。',
        thresholdReason: '既存予想を補強しただけで、システム関係やプロセス段階は変化していない。'
      }
    }
  },
  {
    id: 'daily-2026-07-29',
    date: '2026-07-29',
    decidedAt: '2026-07-29T12:00:00+09:00',
    state: 'publish_new',
    candidateSignalIds: ['candidate-2026-07-29-capacity'],
    insightId: 'global-2026-07-29-capacity',
    processId: 'process-ai-infrastructure-race',
    materialChangeScore: 92,
    evidenceStrength: 88,
    noveltyScore: 91,
    importanceScore: 95,
    content: {
      en: {
        label: 'NEW INSIGHT',
        decisionTitle: 'A new system relationship became visible.',
        decisionSummary: 'AI competition shifted from model capability toward scarce physical capacity.',
        thresholdReason: 'The change was novel, independently evidenced and large enough to establish a new World Process thesis.'
      },
      zh: {
        label: '新洞察',
        decisionTitle: '一个新的系统关系开始清晰可见。',
        decisionSummary: 'AI竞争从模型能力，转向对稀缺物理容量的争夺。',
        thresholdReason: '这项变化具有新颖性、独立证据与足够影响力，因此达到了建立新世界进程命题的门槛。'
      },
      ja: {
        label: '新しい洞察',
        decisionTitle: '新しいシステム関係が見えるようになった。',
        decisionSummary: 'AI競争はモデル性能から希少な物理容量の争奪へ移った。',
        thresholdReason: '新規性、独立した証拠、影響度がそろい、新しい世界プロセス命題を作る閾値に達した。'
      }
    }
  }
];
