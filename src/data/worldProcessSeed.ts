import type {
  EvolutionImpact,
  EvolutionStage,
  LocalizedEvolutionEvent,
  LocalizedWorldProcess,
} from '../types/worldProcess';

type EventText = { en: [string, string, string]; zh: [string, string, string]; ja: [string, string, string] };

function event(
  id: string,
  date: string,
  stage: EvolutionStage,
  impact: EvolutionImpact,
  text: EventText,
  insightId?: string,
): LocalizedEvolutionEvent {
  const content = Object.fromEntries(
    Object.entries(text).map(([language, value]) => [
      language,
      { title: value[0], description: value[1], implication: value[2] },
    ]),
  ) as LocalizedEvolutionEvent['content'];
  return { id, date, stage, impact, insightId, content };
}

export const seedWorldProcesses: LocalizedWorldProcess[] = [
  {
    id: 'process-ai-infrastructure-race',
    slug: 'ai-infrastructure-race',
    status: 'accelerating',
    confidence: 'verified',
    startedAt: '2026-07-01T00:00:00+09:00',
    updatedAt: '2026-07-31T13:30:00+09:00',
    insightIds: ['global-2026-07-26-capacity-update', 'global-2026-07-29-capacity', 'global-2026-07-31-industrial-ai'],
    tags: ['ai', 'compute', 'datacenter', 'electricity', 'grid', 'semiconductor', 'capital', 'land'],
    connections: [
      { processId: 'process-energy-security', relationship: 'depends_on', weight: 18 },
      { processId: 'process-semiconductor-capacity', relationship: 'depends_on', weight: 16 },
    ],
    evolution: [
      event('ai-e1', '2026-07-01T00:00:00+09:00', 'signal', 'supports', {
        en: ['Model advantage begins to require physical capacity', 'Competition starts moving beyond model quality toward access to compute and datacenter capacity.', 'AI leadership can no longer be evaluated only through benchmark performance.'],
        zh: ['模型优势开始依赖实体容量', '竞争开始从模型质量，转向算力与数据中心容量的获取能力。', '判断AI领先地位，不能再只看模型基准成绩。'],
        ja: ['モデル優位が物理的能力を必要とし始める', '競争がモデル品質だけでなく、計算資源とデータセンター能力へのアクセスへ移り始めた。', 'AIの優位はベンチマークだけでは評価できなくなる。'],
      }),
      event('ai-e2', '2026-07-26T09:00:00+09:00', 'emerging', 'updates', {
        en: ['Capacity becomes part of the product', 'Reliable inference, distribution and deployment speed become visible competitive dimensions.', 'The process shifts from software competition toward an infrastructure system.'],
        zh: ['容量成为产品的一部分', '稳定推理、分发能力与部署速度成为可见的竞争维度。', '这一进程从软件竞争转向基础设施系统。'],
        ja: ['供給能力が製品の一部になる', '安定した推論、配信、展開速度が競争軸として見え始めた。', 'プロセスはソフトウェア競争からインフラシステムへ移る。'],
      }, 'global-2026-07-26-capacity-update'),
      event('ai-e3', '2026-07-29T15:30:00+09:00', 'accelerating', 'supports', {
        en: ['Power, land and chips become binding constraints', 'Infrastructure ownership and long-term supply agreements increasingly determine expansion speed.', 'AI capacity is entering the balance sheet and physical planning cycle.'],
        zh: ['电力、土地与芯片成为硬约束', '基础设施所有权与长期供给协议越来越决定扩张速度。', 'AI容量开始进入资产负债表与实体规划周期。'],
        ja: ['電力・土地・半導体が強い制約になる', 'インフラ所有と長期供給契約が拡張速度を左右し始めた。', 'AI能力が財務と物理計画の周期に入る。'],
      }, 'global-2026-07-29-capacity'),
      event('ai-e4', '2026-07-31T11:00:00+09:00', 'structural', 'updates', {
        en: ['AI becomes an industrial infrastructure process', 'Compute expansion now transmits demand into energy, semiconductors, construction and policy.', 'The next phase depends on cross-domain coordination rather than a single technical breakthrough.'],
        zh: ['AI成为工业基础设施进程', '算力扩张正在把需求传导至能源、半导体、建设与政策。', '下一阶段依赖跨领域协同，而不只是单一技术突破。'],
        ja: ['AIが産業インフラのプロセスになる', '計算資源の拡張がエネルギー、半導体、建設、政策へ需要を伝えている。', '次の段階は単一技術ではなく領域横断の協調に依存する。'],
      }),
      event('ai-e5', '2026-07-31T13:30:00+09:00', 'structural', 'updates', {
        en: ['AI infrastructure enters industrial finance', 'Banks, guarantees, dedicated power plants and public industrial sites are being assembled into single AI capacity projects.', 'The competitive unit is becoming a bankable industrial system, not a data center lease alone.'],
        zh: ['AI基础设施进入工业融资阶段', '银行、信用担保、专用电厂与公共工业场地开始被组织进同一个AI容量项目。', '竞争单位正在从单一数据中心租赁，转变为可融资的工业系统。'],
        ja: ['AIインフラが産業金融へ入る', '銀行、信用保証、専用発電所、公共産業用地が一つのAI能力プロジェクトに組み込まれ始めた。', '競争単位はデータセンター賃貸ではなく、融資可能な産業システムへ変わる。'],
      }, 'global-2026-07-31-industrial-ai'),
    ],
    content: {
      en: {
        title: 'The AI infrastructure race', summary: 'AI competition is expanding from model quality into control of power, compute, land and distribution.', thesis: 'The durable advantage may belong to companies that can repeatedly convert intelligence into dependable, large-scale capacity.', nextQuestion: 'Will infrastructure ownership become a stronger moat than model leadership alone?', domains: ['AI', 'Energy', 'Semiconductors', 'Physical Infrastructure'], storyLabel: 'From model competition to capacity competition', currentStageLabel: 'Industrial finance', stageSummary: 'AI expansion is becoming a bankable industrial system combining guarantees, dedicated power, land, construction and policy.', observeNext: ['Technology-company guarantees for AI projects', 'Dedicated generation paired with data centers', 'Public industrial sites converted into AI campuses', 'Who ultimately carries electricity and credit risk'],
      },
      zh: {
        title: 'AI基础设施竞赛', summary: 'AI竞争正在从模型质量，扩展到对电力、算力、土地和分发能力的控制。', thesis: '更持久的优势，可能属于那些能够持续把智能转化为稳定、大规模供给能力的企业。', nextQuestion: '基础设施所有权是否会成为比单纯模型领先更强的护城河？', domains: ['人工智能', '能源', '半导体', '实体基础设施'], storyLabel: '从模型竞争走向容量竞争', currentStageLabel: '工业融资期', stageSummary: 'AI扩张正成为由担保、专用能源、土地、工程建设与政策共同组成的可融资工业系统。', observeNext: ['科技公司为AI项目提供的担保', '数据中心与专用发电配套', '公共工业场地转为AI园区', '电价与信用风险最终由谁承担'],
      },
      ja: {
        title: 'AIインフラ競争', summary: 'AI競争はモデル品質から、電力・計算資源・土地・流通能力の支配へ広がっている。', thesis: '持続的な優位は、知能を安定した大規模供給能力へ繰り返し変換できる企業に生まれる可能性がある。', nextQuestion: 'インフラ所有は、モデル優位だけより強い参入障壁になるのか。', domains: ['AI', 'エネルギー', '半導体', '物理インフラ'], storyLabel: 'モデル競争から供給能力の競争へ', currentStageLabel: '産業金融期', stageSummary: 'AI拡張は、保証・専用電源・土地・建設・政策を組み合わせた融資可能な産業システムになりつつある。', observeNext: ['AI案件への技術企業の保証', 'データセンターと専用発電の一体化', '公共産業用地のAI転換', '電力・信用リスクの最終負担者'],
      },
    },
  },
  {
    id: 'process-energy-security', slug: 'energy-security', status: 'emerging', confidence: 'developing',
    startedAt: '2026-07-18T00:00:00+09:00', updatedAt: '2026-07-31T10:00:00+09:00', insightIds: [],
    tags: ['electricity', 'grid', 'energy', 'datacenter', 'industry', 'nuclear', 'geopolitics', 'capital'],
    connections: [
      { processId: 'process-ai-infrastructure-race', relationship: 'enables', weight: 18 },
      { processId: 'process-geopolitical-technology-control', relationship: 'shaped_by', weight: 12 },
    ],
    evolution: [
      event('energy-e1', '2026-07-18T00:00:00+09:00', 'signal', 'supports', {
        en: ['Electricity demand re-enters strategic planning', 'Digital and industrial projects begin competing for reliable power access.', 'Energy is moving beyond a utility input into a location constraint.'],
        zh: ['电力需求重新进入战略规划', '数字与工业项目开始争夺稳定电力接入。', '能源正从普通投入转变为区位约束。'],
        ja: ['電力需要が戦略計画へ戻る', 'デジタル・産業プロジェクトが安定電力へのアクセスを競い始めた。', 'エネルギーは単なる投入から立地制約へ変わる。'],
      }),
      event('energy-e2', '2026-07-29T12:00:00+09:00', 'emerging', 'updates', {
        en: ['Grid reliability becomes an economic differentiator', 'Connection queues and generation timelines begin shaping investment decisions.', 'Regions with dependable capacity may attract strategic industries.'],
        zh: ['电网可靠性成为经济差异化因素', '接入排队与发电建设周期开始影响投资决策。', '拥有稳定容量的地区可能吸引战略产业。'],
        ja: ['送電網の信頼性が経済差別化になる', '接続待ちと発電建設期間が投資判断を左右し始めた。', '安定能力を持つ地域が戦略産業を引き寄せる可能性がある。'],
      }),
      event('energy-e3', '2026-07-31T10:00:00+09:00', 'accelerating', 'supports', {
        en: ['Energy policy converges with technology policy', 'Power generation, grids and datacenters are increasingly planned as one capacity system.', 'Energy security is becoming a precondition for digital sovereignty.'],
        zh: ['能源政策与技术政策开始汇合', '发电、电网与数据中心越来越被作为同一容量系统规划。', '能源安全正在成为数字主权的前提。'],
        ja: ['エネルギー政策と技術政策が合流する', '発電・送電網・データセンターが一つの能力システムとして計画され始めた。', 'エネルギー安全保障がデジタル主権の前提になる。'],
      }),
    ],
    content: {
      en: { title: 'Energy becomes strategic capacity', summary: 'Reliable electricity is becoming a direct constraint on digital and industrial expansion.', thesis: 'Energy access may increasingly determine where strategic industries can grow.', nextQuestion: 'Which regions can turn grid reliability into economic advantage?', domains: ['Energy', 'Grid', 'Industry', 'Geopolitics'], storyLabel: 'Electricity moves from operating cost to strategic capacity', currentStageLabel: 'Strategic convergence', stageSummary: 'Energy is shifting from an operating input into a strategic location and sovereignty constraint.', observeNext: ['New generation and grid approvals', 'Large-load connection queues', 'AI and industrial power contracts'] },
      zh: { title: '能源成为战略容量', summary: '稳定电力正在成为数字产业和实体工业扩张的直接约束。', thesis: '能源获取能力可能越来越决定战略产业能够在哪里成长。', nextQuestion: '哪些地区能把电网可靠性转化为经济优势？', domains: ['能源', '电网', '工业', '地缘政治'], storyLabel: '电力从运营成本变成战略容量', currentStageLabel: '战略汇合期', stageSummary: '能源正在从运营投入转变为区位和主权层面的战略约束。', observeNext: ['新增发电与电网审批', '大型负荷接入排队', 'AI及工业长期电力合同'] },
      ja: { title: 'エネルギーが戦略的供給力になる', summary: '安定した電力が、デジタル産業と製造業の拡大を直接制約し始めている。', thesis: 'エネルギーへのアクセスが、戦略産業の成長地域を決める可能性が高まっている。', nextQuestion: 'どの地域が送電網の信頼性を経済的優位へ変えられるのか。', domains: ['エネルギー', '電力網', '産業', '地政学'], storyLabel: '電力が運営コストから戦略的供給力へ変わる', currentStageLabel: '戦略的収束期', stageSummary: 'エネルギーは運営投入から、立地と主権の戦略制約へ移行している。', observeNext: ['新規発電・送電網の承認', '大型需要の接続待ち', 'AI・産業の長期電力契約'] },
    },
  },
  {
    id: 'process-semiconductor-capacity', slug: 'semiconductor-capacity', status: 'emerging', confidence: 'developing',
    startedAt: '2026-07-20T00:00:00+09:00', updatedAt: '2026-07-31T09:30:00+09:00', insightIds: [],
    tags: ['semiconductor', 'compute', 'manufacturing', 'supply-chain', 'policy', 'geopolitics', 'capital', 'ai'],
    connections: [
      { processId: 'process-ai-infrastructure-race', relationship: 'supplies', weight: 16 },
      { processId: 'process-geopolitical-technology-control', relationship: 'shaped_by', weight: 18 },
    ],
    evolution: [
      event('semi-e1', '2026-07-20T00:00:00+09:00', 'signal', 'supports', {
        en: ['Chip availability becomes a system constraint', 'Advanced compute demand exposes the limits of concentrated manufacturing capacity.', 'Semiconductor supply must be read as infrastructure, not inventory alone.'],
        zh: ['芯片可得性成为系统约束', '先进算力需求暴露了制造产能高度集中的限制。', '半导体供应需要被视为基础设施，而不只是库存。'],
        ja: ['半導体の入手性がシステム制約になる', '先端計算需要が集中生産能力の限界を示した。', '半導体供給は在庫ではなくインフラとして読む必要がある。'],
      }),
      event('semi-e2', '2026-07-28T18:00:00+09:00', 'emerging', 'updates', {
        en: ['Factory policy expands into ecosystem policy', 'Capital, equipment, talent and allied supply chains become part of the same decision.', 'An isolated fab is insufficient without a complete production ecosystem.'],
        zh: ['工厂政策扩展为生态政策', '资本、设备、人才与盟友供应链进入同一个决策系统。', '没有完整生产生态，孤立晶圆厂并不足够。'],
        ja: ['工場政策が生態系政策へ広がる', '資本・装置・人材・同盟供給網が同じ判断に組み込まれる。', '完全な生産生態系なしに孤立工場だけでは不十分になる。'],
      }),
      event('semi-e3', '2026-07-31T09:30:00+09:00', 'accelerating', 'challenges', {
        en: ['Geopolitical controls reshape capacity economics', 'Export controls and alliance rules alter where equipment, chips and capital can move.', 'Nominal capacity growth may not equal globally usable capacity.'],
        zh: ['地缘管制重塑产能经济性', '出口管制与联盟规则改变设备、芯片与资本的流动范围。', '名义产能增长不等于全球可用产能增长。'],
        ja: ['地政学的統制が能力経済を変える', '輸出規制と同盟ルールが装置・半導体・資本の移動先を変える。', '名目能力の増加が世界で利用可能な能力増加とは限らない。'],
      }),
    ],
    content: {
      en: { title: 'Semiconductor capacity becomes geopolitical infrastructure', summary: 'Advanced chip supply is increasingly shaped by long-term capacity, policy and geography.', thesis: 'The semiconductor advantage may depend as much on coordinated ecosystems as on individual chip designs.', nextQuestion: 'Can new manufacturing regions build complete ecosystems rather than isolated factories?', domains: ['Semiconductors', 'Manufacturing', 'Policy', 'Geopolitics'], storyLabel: 'Chips move from products to geopolitical infrastructure', currentStageLabel: 'Ecosystem contest', stageSummary: 'Capacity expansion is accelerating, but usable supply is increasingly segmented by policy and alliances.', observeNext: ['Equipment export-control scope', 'Advanced packaging capacity', 'Talent and supplier clustering around new fabs'] },
      zh: { title: '半导体产能成为地缘基础设施', summary: '先进芯片供应越来越受到长期产能、政策与地理位置共同塑造。', thesis: '半导体优势可能同样取决于协同生态，而不只是单一芯片设计。', nextQuestion: '新的制造地区能否建立完整生态，而不只是孤立工厂？', domains: ['半导体', '制造业', '政策', '地缘政治'], storyLabel: '芯片从商品变成地缘基础设施', currentStageLabel: '生态竞争期', stageSummary: '产能扩张正在加速，但可用供给越来越受到政策与联盟分割。', observeNext: ['设备出口管制范围', '先进封装产能', '新晶圆厂周边人才与供应商聚集'] },
      ja: { title: '半導体能力が地政学的インフラになる', summary: '先端半導体の供給は、長期能力・政策・地理によって形づくられつつある。', thesis: '半導体の優位は、個別設計だけでなく連携した生態系にも左右される可能性がある。', nextQuestion: '新しい生産地域は、孤立した工場ではなく完全な生態系を構築できるのか。', domains: ['半導体', '製造', '政策', '地政学'], storyLabel: '半導体が製品から地政学的インフラへ変わる', currentStageLabel: '生態系競争期', stageSummary: '能力拡張は加速しているが、利用可能な供給は政策と同盟で分断されつつある。', observeNext: ['装置輸出規制の範囲', '先端パッケージ能力', '新工場周辺の人材・供給者集積'] },
    },
  },
  {
    id: 'process-geopolitical-technology-control', slug: 'geopolitical-technology-control', status: 'accelerating', confidence: 'developing',
    startedAt: '2026-07-24T00:00:00+09:00', updatedAt: '2026-07-31T09:00:00+09:00', insightIds: [],
    tags: ['geopolitics', 'policy', 'export-control', 'semiconductor', 'energy', 'supply-chain', 'ai', 'security'],
    connections: [
      { processId: 'process-semiconductor-capacity', relationship: 'constrains', weight: 18 },
      { processId: 'process-energy-security', relationship: 'shaped_by', weight: 12 },
    ],
    evolution: [
      event('geo-e1', '2026-07-24T00:00:00+09:00', 'signal', 'supports', {
        en: ['Technology policy enters national security', 'Chips, data and industrial systems are increasingly governed through security frameworks.', 'Market access begins to depend on strategic alignment.'],
        zh: ['技术政策进入国家安全框架', '芯片、数据与工业系统越来越通过安全框架治理。', '市场准入开始依赖战略阵营。'],
        ja: ['技術政策が国家安全保障に入る', '半導体・データ・産業システムが安全保障枠組みで統治され始めた。', '市場アクセスが戦略的整合に依存し始める。'],
      }),
      event('geo-e2', '2026-07-29T00:00:00+09:00', 'emerging', 'updates', {
        en: ['Controls expand from products to ecosystems', 'Rules increasingly cover equipment, capital, talent and cloud access.', 'Technology blocs begin forming around controlled capacity.'],
        zh: ['管制从产品扩展到生态系统', '规则越来越覆盖设备、资本、人才与云服务准入。', '围绕受控能力的技术阵营开始形成。'],
        ja: ['統制が製品から生態系へ広がる', '規則が装置・資本・人材・クラウド利用まで覆い始めた。', '統制能力を中心に技術ブロックが形成される。'],
      }),
      event('geo-e3', '2026-07-31T09:00:00+09:00', 'accelerating', 'supports', {
        en: ['Industrial capacity becomes an alliance asset', 'Energy, semiconductor and AI infrastructure are coordinated through security and alliance policy.', 'Efficiency is no longer the only objective; resilience and control gain weight.'],
        zh: ['工业容量成为联盟资产', '能源、半导体与AI基础设施开始通过安全和联盟政策协同。', '效率不再是唯一目标，韧性与控制权的重要性上升。'],
        ja: ['産業能力が同盟資産になる', 'エネルギー・半導体・AIインフラが安全保障と同盟政策で調整され始めた。', '効率だけでなく強靭性と統制が重視される。'],
      }),
    ],
    content: {
      en: { title: 'Technology control becomes geopolitical infrastructure', summary: 'States are treating chips, energy, data and industrial supply chains as instruments of national power.', thesis: 'The geography of technological growth will increasingly be shaped by security policy, alliances and controlled access to critical capacity.', nextQuestion: 'Will technology blocs become more important than global market efficiency?', domains: ['Geopolitics', 'Technology Policy', 'Security', 'Supply Chains'], storyLabel: 'From open technology markets to strategic technology blocs', currentStageLabel: 'Bloc formation', stageSummary: 'Technology controls are accelerating from targeted restrictions into ecosystem-level alignment.', observeNext: ['Expansion of export-control categories', 'Allied investment-screening rules', 'Cross-border cloud, data and energy restrictions'] },
      zh: { title: '技术控制成为地缘基础设施', summary: '国家正在把芯片、能源、数据与工业供应链视为国家力量的工具。', thesis: '技术增长的地理分布，将越来越受到安全政策、联盟关系和关键能力准入的塑造。', nextQuestion: '技术阵营的重要性是否会超过全球市场效率？', domains: ['地缘政治', '技术政策', '安全', '供应链'], storyLabel: '从开放技术市场走向战略技术阵营', currentStageLabel: '阵营形成期', stageSummary: '技术管制正从定向限制，加速成为生态系统层面的阵营协同。', observeNext: ['出口管制品类扩张', '盟友投资审查规则', '跨境云、数据与能源限制'] },
      ja: { title: '技術統制が地政学的インフラになる', summary: '国家は半導体・エネルギー・データ・産業供給網を国力の手段として扱い始めている。', thesis: '技術成長の地理は、安全保障政策・同盟・重要能力への統制されたアクセスによって一層形づくられる。', nextQuestion: '技術ブロックは世界市場の効率性より重要になるのか。', domains: ['地政学', '技術政策', '安全保障', '供給網'], storyLabel: '開かれた技術市場から戦略的技術ブロックへ', currentStageLabel: 'ブロック形成期', stageSummary: '技術統制は個別制限から、生態系レベルの陣営調整へ加速している。', observeNext: ['輸出規制対象の拡大', '同盟国の投資審査規則', '越境クラウド・データ・エネルギー制限'] },
    },
  },
];
