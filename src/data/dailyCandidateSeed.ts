import type { DailyCandidateSignal } from '../types/dailyDecision';

export const dailyCandidateSeed: DailyCandidateSignal[] = [
  {
    id: 'candidate-2026-08-01-follow-through', date: '2026-08-01', processId: 'process-ai-infrastructure-race',
    tags: ['ai','finance','power','follow-through'], domain: 'infrastructure', importance: 69, novelty: 31,
    evidenceStrength: 70, independentSourceCount: 2, thesisImpact: 41, relationshipChange: 34,
    stageChange: 30, contradiction: 4,
    content: { en: { title: 'Industrial AI signals continue without a new break', summary: 'The newest follow-through supports the current thesis but does not change its structure or stage.' }, zh: { title: 'AI工业化信号延续，但没有出现新的突破', summary: '最新后续信号支持当前判断，但没有改变其结构或阶段。' }, ja: { title: 'AI産業化のシグナルは続くが、新しい転換はない', summary: '最新の追随材料は現在の判断を支持するが、構造や段階は変えていない。' } }
  },
  {
    id: 'candidate-2026-07-31-project-finance', date: '2026-07-31', processId: 'process-ai-infrastructure-race',
    tags: ['ai','finance','datacenter','power'], domain: 'finance', importance: 95, novelty: 88,
    evidenceStrength: 92, independentSourceCount: 3, thesisImpact: 90, relationshipChange: 91,
    stageChange: 88, contradiction: 8,
    content: { en: { title: 'AI capacity enters project finance', summary: 'Banks, guarantees and dedicated power now assemble AI capacity.' }, zh: { title: 'AI容量进入项目融资', summary: '银行、担保与专用电力开始共同组织AI容量。' }, ja: { title: 'AI能力がプロジェクト金融へ入る', summary: '銀行・保証・専用電源がAI能力を組成し始めた。' } }
  },
  {
    id: 'candidate-2026-07-31-industrial-site', date: '2026-07-31', processId: 'process-ai-infrastructure-race',
    tags: ['ai','land','energy','policy'], domain: 'policy', importance: 92, novelty: 84,
    evidenceStrength: 89, independentSourceCount: 2, thesisImpact: 86, relationshipChange: 88,
    stageChange: 85, contradiction: 5,
    content: { en: { title: 'Industrial sites become AI-energy campuses', summary: 'Public land, generation and compute are assembled as one system.' }, zh: { title: '工业场地变成AI—能源园区', summary: '公共土地、发电与算力被作为一个系统组织。' }, ja: { title: '産業用地がAI・エネルギー拠点へ変わる', summary: '公共用地・発電・計算資源が一体で組成される。' } }
  },
  {
    id: 'candidate-2026-07-31-utility-demand', date: '2026-07-31', processId: 'process-ai-infrastructure-race',
    tags: ['ai','utility','electricity'], domain: 'energy', importance: 88, novelty: 76,
    evidenceStrength: 91, independentSourceCount: 3, thesisImpact: 82, relationshipChange: 84,
    stageChange: 78, contradiction: 4,
    content: { en: { title: 'AI demand enters utility planning', summary: 'Electricity demand now changes earnings and capital plans.' }, zh: { title: 'AI需求进入电力公司规划', summary: '用电需求开始改变业绩与资本计划。' }, ja: { title: 'AI需要が電力会社の計画へ入る', summary: '電力需要が業績と設備投資計画を変え始めた。' } }
  },
  {
    id: 'candidate-2026-07-30-support', date: '2026-07-30', processId: 'process-ai-infrastructure-race',
    tags: ['ai','capacity'], domain: 'infrastructure', importance: 61, novelty: 28,
    evidenceStrength: 67, independentSourceCount: 1, thesisImpact: 34, relationshipChange: 25,
    stageChange: 22, contradiction: 3,
    content: { en: { title: 'Capacity commitments continue', summary: 'The signal supports the existing thesis but does not alter it.' }, zh: { title: '容量承诺继续增加', summary: '信号支持既有判断，但没有改变判断。' }, ja: { title: '容量確保が続く', summary: '既存判断を支持するが、判断自体は変えない。' } }
  },
  {
    id: 'candidate-2026-07-29-capacity', date: '2026-07-29',
    tags: ['ai','capacity','power','land','compute'], domain: 'infrastructure', importance: 95, novelty: 91,
    evidenceStrength: 88, independentSourceCount: 3, thesisImpact: 92, relationshipChange: 94,
    stageChange: 90, contradiction: 0,
    content: { en: { title: 'Physical capacity becomes the scarce AI asset', summary: 'A new system relationship appears across power, compute and land.' }, zh: { title: '物理容量成为AI稀缺资产', summary: '电力、算力与土地之间出现新的系统关系。' }, ja: { title: '物理容量がAIの希少資産になる', summary: '電力・計算資源・土地に新しいシステム関係が現れた。' } }
  }
];
