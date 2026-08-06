import type { LanguageCode } from '../types/insight';

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  body: string;
};

export type KnowledgeNode = {
  id: string;
  label: string;
  title: string;
  summary: string;
};

export type KnowledgeConnection = {
  id: string;
  from: string;
  to: string;
  title: string;
  explanation: string;
};

export type RelatedInsight = {
  id: string;
  label: string;
  title: string;
  summary: string;
  status: 'living' | 'adjacent' | 'watch';
};

export type KnowledgeNetwork = {
  timeline: TimelineEvent[];
  nodes: KnowledgeNode[];
  connections: KnowledgeConnection[];
  relatedInsights: RelatedInsight[];
};

const networks: Record<LanguageCode, KnowledgeNetwork> = {
  en: {
    timeline: [
      { id: 't1', date: '2023–2024', title: 'Model scaling dominated the race', body: 'Competitive attention centred on parameters, training runs and benchmark leadership.' },
      { id: 't2', date: '2024–2025', title: 'Capacity bottlenecks became visible', body: 'Accelerator supply, networking and data-centre availability began to shape launch schedules.' },
      { id: 't3', date: '2025–2026', title: 'Infrastructure moved into strategy', body: 'Power contracts, sites and long-term capacity commitments became part of the competitive moat.' },
      { id: 't4', date: 'NEXT', title: 'Distribution may become the deciding layer', body: 'The winner may be the company that can reliably deliver intelligence through an owned customer relationship.' },
    ],
    nodes: [
      { id: 'models', label: 'MODELS', title: 'Model advantage', summary: 'The quality and efficiency of the intelligence being produced.' },
      { id: 'compute', label: 'COMPUTE', title: 'Compute capacity', summary: 'Accelerators, networking, systems software and reserved cloud capacity.' },
      { id: 'energy', label: 'ENERGY', title: 'Power access', summary: 'Generation, grid connection and long-duration energy procurement.' },
      { id: 'sites', label: 'PHYSICAL', title: 'Deployable sites', summary: 'Land, cooling, permits, water and construction readiness.' },
      { id: 'distribution', label: 'MARKET', title: 'Distribution', summary: 'The customer relationships through which AI becomes a dependable service.' },
    ],
    connections: [
      { id: 'c1', from: 'models', to: 'compute', title: 'Better models increase infrastructure demand', explanation: 'More capable models often require larger training runs and more inference, making compute availability part of product performance.' },
      { id: 'c2', from: 'compute', to: 'energy', title: 'Compute converts directly into power demand', explanation: 'Reserved accelerators are only useful when data centres can secure enough electricity to operate them continuously.' },
      { id: 'c3', from: 'energy', to: 'sites', title: 'Power determines which land is strategic', explanation: 'A site becomes valuable when it combines grid access, cooling, permits and construction readiness.' },
      { id: 'c4', from: 'sites', to: 'distribution', title: 'Infrastructure matters only when it reaches users', explanation: 'Physical capacity becomes economic power when it can be translated into reliable products and customer access.' },
    ],
    relatedInsights: [
      { id: 'r1', label: 'ENERGY', title: 'The AI boom is becoming an electricity story.', summary: 'Data-centre growth may reshape generation, grid investment and the value of firm power.', status: 'adjacent' },
      { id: 'r2', label: 'CAPITAL', title: 'AI competition is becoming a balance-sheet contest.', summary: 'Long-duration infrastructure commitments favour companies that can finance capacity before demand fully arrives.', status: 'living' },
      { id: 'r3', label: 'DISTRIBUTION', title: 'Owning the customer may matter more than owning the model.', summary: 'Distribution can turn similar model capability into very different economic outcomes.', status: 'watch' },
    ],
  },
  zh: {
    timeline: [
      { id: 't1', date: '2023–2024', title: '模型扩张主导竞争', body: '竞争焦点集中在参数规模、训练投入和榜单领先。' },
      { id: 't2', date: '2024–2025', title: '容量瓶颈开始显现', body: '加速器、网络和数据中心供应开始影响产品上线节奏。' },
      { id: 't3', date: '2025–2026', title: '基础设施进入公司战略', body: '电力合同、土地和长期容量承诺开始成为竞争壁垒。' },
      { id: 't4', date: '下一阶段', title: '分发可能成为决定性层级', body: '真正的赢家，可能是能够通过自有客户关系稳定交付智能的企业。' },
    ],
    nodes: [
      { id: 'models', label: '模型', title: '模型优势', summary: '被生产出来的智能本身，其质量与效率。' },
      { id: 'compute', label: '算力', title: '算力容量', summary: '加速器、网络、系统软件以及被预订的云容量。' },
      { id: 'energy', label: '能源', title: '电力接入', summary: '发电能力、并网资格和长期能源采购。' },
      { id: 'sites', label: '实体设施', title: '可部署地点', summary: '土地、冷却、许可、水资源和施工准备度。' },
      { id: 'distribution', label: '市场', title: '分发能力', summary: '让AI成为稳定服务的客户关系和入口。' },
    ],
    connections: [
      { id: 'c1', from: 'models', to: 'compute', title: '更强模型会提高基础设施需求', explanation: '更有能力的模型通常需要更大规模训练和更多推理，因此算力可用性会直接影响产品表现。' },
      { id: 'c2', from: 'compute', to: 'energy', title: '算力会直接转化为电力需求', explanation: '被预订的加速器只有在数据中心能够持续获得足够电力时，才真正有价值。' },
      { id: 'c3', from: 'energy', to: 'sites', title: '电力决定哪些土地具有战略价值', explanation: '只有同时具备并网、冷却、许可和施工条件，土地才会变成真正可部署的容量。' },
      { id: 'c4', from: 'sites', to: 'distribution', title: '基础设施必须抵达用户才有意义', explanation: '物理容量只有被转化为稳定产品与客户入口，才会形成经济力量。' },
    ],
    relatedInsights: [
      { id: 'r1', label: '能源', title: 'AI繁荣正在变成一场电力故事。', summary: '数据中心扩张可能重塑发电、电网投资，以及稳定电源的价值。', status: 'adjacent' },
      { id: 'r2', label: '资本', title: 'AI竞争正在变成资产负债表竞赛。', summary: '长期基础设施承诺，更有利于能够在需求完全出现前提前融资的企业。', status: 'living' },
      { id: 'r3', label: '分发', title: '拥有客户，可能比拥有模型更重要。', summary: '分发能力会让相似的模型能力产生完全不同的经济结果。', status: 'watch' },
    ],
  },
  ja: {
    timeline: [
      { id: 't1', date: '2023–2024', title: 'モデル拡大が競争を主導', body: '競争の焦点はパラメータ、学習規模、ベンチマーク優位にあった。' },
      { id: 't2', date: '2024–2025', title: '容量制約が見え始める', body: 'アクセラレータ、ネットワーク、データセンター供給が製品投入時期を左右し始めた。' },
      { id: 't3', date: '2025–2026', title: 'インフラが経営戦略へ', body: '電力契約、立地、長期容量契約が競争障壁になり始めた。' },
      { id: 't4', date: '次の段階', title: '流通が決定層になる可能性', body: '自社の顧客関係を通じて知能を安定供給できる企業が優位になる可能性がある。' },
    ],
    nodes: [
      { id: 'models', label: 'モデル', title: 'モデル優位', summary: '生み出される知能そのものの品質と効率。' },
      { id: 'compute', label: '計算資源', title: '計算容量', summary: 'アクセラレータ、ネットワーク、システムソフトウェア、予約済みクラウド容量。' },
      { id: 'energy', label: 'エネルギー', title: '電力アクセス', summary: '発電、系統接続、長期エネルギー調達。' },
      { id: 'sites', label: '物理基盤', title: '展開可能な立地', summary: '土地、冷却、許認可、水、建設準備。' },
      { id: 'distribution', label: '市場', title: '流通', summary: 'AIを安定したサービスに変える顧客関係と入口。' },
    ],
    connections: [
      { id: 'c1', from: 'models', to: 'compute', title: '高性能モデルはインフラ需要を増やす', explanation: 'より高性能なモデルは大規模学習と推論を必要とし、計算資源の確保が製品性能の一部になる。' },
      { id: 'c2', from: 'compute', to: 'energy', title: '計算資源は電力需要へ直結する', explanation: '予約したアクセラレータも、データセンターが十分な電力を継続確保できなければ価値を持たない。' },
      { id: 'c3', from: 'energy', to: 'sites', title: '電力が戦略的な土地を決める', explanation: '系統接続、冷却、許認可、建設条件が揃って初めて土地は展開可能な容量になる。' },
      { id: 'c4', from: 'sites', to: 'distribution', title: 'インフラはユーザーに届いて初めて意味を持つ', explanation: '物理容量は安定した製品と顧客アクセスへ変換されて初めて経済力になる。' },
    ],
    relatedInsights: [
      { id: 'r1', label: 'エネルギー', title: 'AIブームは電力の物語になりつつある。', summary: 'データセンター成長は発電、送電網投資、安定電源の価値を変える可能性がある。', status: 'adjacent' },
      { id: 'r2', label: '資本', title: 'AI競争はバランスシート競争になりつつある。', summary: '長期インフラ契約は、需要が完全に現れる前に資金を投入できる企業を有利にする。', status: 'living' },
      { id: 'r3', label: '流通', title: 'モデルより顧客を持つことが重要になる可能性。', summary: '流通力は似たモデル能力から大きく異なる経済成果を生み出す。', status: 'watch' },
    ],
  },
};

export function getKnowledgeNetwork(language: LanguageCode): KnowledgeNetwork {
  return networks[language] ?? networks.en;
}
