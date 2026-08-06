import type { LanguageCode, Signal, Source } from '../types/insight';

type Copy = { whyImportant: string; evidenceTitle: string; evidenceBody: string; sourceNote: string };
const copy: Record<LanguageCode, Record<string, Copy>> = {
  en: {
    'project-finance': { whyImportant: 'Project finance makes future AI capacity depend on credit guarantees and long-duration obligations, not only current technology revenue.', evidenceTitle: 'AI capacity is being financed as a large industrial project.', evidenceBody: 'A proposed $15 billion loan, Google-backed obligations and 1.6 GW of dedicated power join finance, compute and generation in one project.', sourceNote: 'Financial reporting on the proposed Anthropic campus financing structure.' },
    'industrial-site': { whyImportant: 'When governments repurpose strategic industrial land for AI, compute becomes part of national development and energy policy.', evidenceTitle: 'AI campuses are being developed at the scale of energy-industrial complexes.', evidenceBody: 'The Kentucky proposal combines a 1.8 GW data-center campus with 2 GW of gas generation and 2.6 GW of batteries.', sourceNote: 'Associated Press reporting on the Department of Energy site redevelopment plan.' },
    'utility-demand': { whyImportant: 'Utility earnings reveal when AI demand has moved from announced plans into actual load growth and capital planning.', evidenceTitle: 'Data-center electricity demand is affecting utility forecasts.', evidenceBody: 'American Electric Power raised its operating earnings outlook as large-load demand accelerated.', sourceNote: 'Reuters reporting based on AEP results and guidance.' },
    power: { whyImportant: 'Power availability increasingly determines when and where new AI capacity can be deployed. Long-term access behaves like a strategic right, not merely an operating cost.', evidenceTitle: 'Electricity supply is becoming a deployment constraint.', evidenceBody: 'Grid connection, generation availability and long-term procurement increasingly shape the expansion schedule of large data centres.', sourceNote: 'Primary international energy analysis used to verify the scale and direction of data-centre electricity demand.' },
    compute: { whyImportant: 'When compute is reserved far in advance, access itself becomes a competitive moat and product roadmaps inherit earlier infrastructure decisions.', evidenceTitle: 'AI capacity is increasingly delivered as an integrated system.', evidenceBody: 'The market is moving beyond individual accelerators toward complete systems, networking, software and persistent cloud capacity.', sourceNote: 'Official product material showing compute offered as a persistent capacity layer.' },
    land: { whyImportant: 'A site without available power, cooling or permits cannot become deployable AI capacity. Physical location therefore enters the competitive equation.', evidenceTitle: 'Deployment depends on local physical systems.', evidenceBody: 'Site selection depends on power, water, network access, permitting and construction conditions rather than land cost alone.', sourceNote: 'Official overview of the physical infrastructure required to operate large-scale cloud systems.' },
  },
  zh: {
    'project-finance': { whyImportant: '项目融资意味着未来AI容量开始依赖信用担保与长期义务，而不只是科技公司的当期收入。', evidenceTitle: 'AI容量正在像大型工业项目一样被融资。', evidenceBody: '拟议中的150亿美元贷款、Google担保与1.6吉瓦专用电力，把金融、算力与发电组织进同一项目。', sourceNote: '关于Anthropic园区融资结构的财经报道。' },
    'industrial-site': { whyImportant: '当政府把战略工业土地转为AI用途，算力就进入国家发展与能源政策。', evidenceTitle: 'AI园区正按能源—工业综合体的规模开发。', evidenceBody: '肯塔基方案将1.8吉瓦数据中心、2吉瓦燃气发电与2.6吉瓦电池储能组合在一起。', sourceNote: '美联社关于美国能源部场地再开发计划的报道。' },
    'utility-demand': { whyImportant: '电力公司业绩能够显示，AI需求何时从宣布中的规划变成实际负荷与资本开支。', evidenceTitle: '数据中心用电正在影响电力公司预测。', evidenceBody: 'American Electric Power因大型负荷需求加速而上调经营盈利预期。', sourceNote: '路透社基于AEP业绩与指引的报道。' },
    power: { whyImportant: '电力供应越来越直接地决定新的AI容量能在何时、何地投入使用。长期准入权已经不只是运营成本，而更接近战略资产。', evidenceTitle: '电力供应正在成为AI部署的约束。', evidenceBody: '并网、发电能力和长期采购正在直接影响大型数据中心的扩张进度。', sourceNote: '用于核对数据中心用电规模与发展方向的国际能源机构资料。' },
    compute: { whyImportant: '当算力被提前很久锁定时，获得算力本身就会形成竞争壁垒，产品路线也会受到早期基础设施决策的影响。', evidenceTitle: 'AI容量越来越以完整系统的形式交付。', evidenceBody: '市场正在从单独购买加速器，转向计算系统、网络、软件和持续云容量。', sourceNote: '显示算力如何作为持续容量层提供的公司官方资料。' },
    land: { whyImportant: '即使土地合适，只要缺少电力、冷却或许可，也无法变成可部署的AI容量。物理地点因此进入竞争公式。', evidenceTitle: '部署依赖当地的实体系统。', evidenceBody: '选址取决于电力、水、网络、许可和施工条件，而不仅仅是土地价格。', sourceNote: '介绍大规模云系统所需实体基础设施的公司官方资料。' },
  },
  ja: {
    'project-finance': { whyImportant: 'プロジェクト金融は、将来のAI能力が現在の技術収益だけでなく、信用保証と長期債務に依存することを意味する。', evidenceTitle: 'AI能力が大型産業プロジェクトとして資金調達される。', evidenceBody: '150億ドル融資案、Googleの保証、1.6GW専用電源が金融・計算・発電を一案件に結びつける。', sourceNote: 'Anthropicキャンパスの資金調達構造に関する金融報道。' },
    'industrial-site': { whyImportant: '政府が戦略産業用地をAI向けに転換すると、計算能力は国家開発・エネルギー政策の一部になる。', evidenceTitle: 'AIキャンパスがエネルギー産業複合体の規模で開発される。', evidenceBody: 'ケンタッキー計画は1.8GWデータセンター、2GWガス発電、2.6GW蓄電池を組み合わせる。', sourceNote: '米エネルギー省用地再開発計画に関するAP報道。' },
    'utility-demand': { whyImportant: '電力会社の業績は、AI需要が計画発表から実需要と設備投資へ移った時点を示す。', evidenceTitle: 'データセンター電力需要が電力会社の予測に影響する。', evidenceBody: 'American Electric Powerは大型需要の加速を受け、営業利益見通しを引き上げた。', sourceNote: 'AEP決算・見通しに基づくReuters報道。' },
    power: { whyImportant: '電力供給は、新しいAI容量をいつ・どこで稼働できるかを左右する。長期アクセスは運営費ではなく戦略的な権利に近づいている。', evidenceTitle: '電力供給がAI展開の制約になりつつある。', evidenceBody: '系統接続、発電能力、長期調達が大規模データセンターの拡張時期を左右し始めている。', sourceNote: 'データセンター電力需要の規模と方向を確認する国際エネルギー機関の資料。' },
    compute: { whyImportant: '計算能力が長期に確保されると、アクセスそのものが競争障壁となり、製品ロードマップも過去のインフラ判断に左右される。', evidenceTitle: 'AI容量は統合システムとして提供される傾向が強まっている。', evidenceBody: '市場は単体アクセラレータから、計算システム、ネットワーク、ソフトウェア、継続的なクラウド容量へ移っている。', sourceNote: '計算能力が継続的な容量レイヤーとして提供されることを示す公式資料。' },
    land: { whyImportant: '土地が適していても、電力、冷却、許認可がなければAI容量として展開できない。物理的な立地が競争条件に入っている。', evidenceTitle: '展開は地域の物理システムに依存する。', evidenceBody: '立地選定は土地価格だけでなく、電力、水、ネットワーク、許認可、建設条件で決まる。', sourceNote: '大規模クラウド運用に必要な物理基盤を説明する企業公式資料。' },
  },
};

const sourceBySignal: Record<string, Source[]> = {
  'project-finance': [
    {
      id: 'wsj-anthropic-finance-2026',
      title: 'Banks in Talks to Lend $15 Billion for Anthropic Data Center Backed by Google',
      publisher: 'The Wall Street Journal',
      publishedAt: '2026-07-31',
      url: 'https://www.wsj.com/tech/banks-in-talks-to-lend-15-billion-for-anthropic-data-center-backed-by-google-606d7afd',
      type: 'media',
      reliability: 'strong',
    },
    {
      id: 'brookfield-infrastructure-outlook-2026',
      title: 'Infrastructure outlook: Accelerating growth, embedded resilience',
      publisher: 'Brookfield',
      publishedAt: '2026',
      url: 'https://www.brookfield.com/views-news/insights/infrastructure-outlook-accelerating-growth',
      type: 'official',
      reliability: 'context',
    },
    {
      id: 'iea-energy-ai-2025',
      title: 'Energy and AI',
      publisher: 'International Energy Agency',
      publishedAt: '2025',
      url: 'https://www.iea.org/reports/energy-and-ai',
      type: 'government',
      reliability: 'context',
    },
  ],
  'industrial-site': [
    {
      id: 'ap-kentucky-ai-campus-2026',
      title: 'Federal government to turn a Kentucky uranium plant into an AI data center and gas power complex',
      publisher: 'Associated Press',
      publishedAt: '2026-07-31',
      url: 'https://apnews.com/article/a4cf07af1b6776971dc5d609c996ca13',
      type: 'media',
      reliability: 'strong',
    },
    {
      id: 'doe-paducah-ai-rfo-2025',
      title: 'U.S. Energy Department Seeks Proposals for AI Data Centers, Energy Projects at Paducah Site',
      publisher: 'U.S. Department of Energy',
      publishedAt: '2025',
      url: 'https://www.energy.gov/em/articles/us-energy-department-seeks-proposals-ai-data-centers-energy-projects-paducah-site',
      type: 'government',
      reliability: 'primary',
    },
    {
      id: 'doe-federal-ai-sites-2025',
      title: 'DOE Announces Site Selection for AI Data Center and Energy Infrastructure Development on Federal Lands',
      publisher: 'U.S. Department of Energy',
      publishedAt: '2025',
      url: 'https://www.energy.gov/articles/doe-announces-site-selection-ai-data-center-and-energy-infrastructure-development-federal',
      type: 'government',
      reliability: 'primary',
    },
  ],
  'utility-demand': [
    {
      id: 'reuters-aep-ai-demand-2026',
      title: 'American Electric Power lifts forecast as AI fuels electricity demand',
      publisher: 'Reuters',
      publishedAt: '2026-07-30',
      url: 'https://www.reuters.com/business/energy/american-electric-power-lifts-forecast-ai-fuels-electricity-surge-2026-07-30/',
      type: 'media',
      reliability: 'strong',
    },
    {
      id: 'aep-q2-2026-release',
      title: 'AEP Reports Second-Quarter 2026 Earnings, Raises Full-Year Guidance',
      publisher: 'American Electric Power',
      publishedAt: '2026-07-30',
      url: 'https://www.prnewswire.com/news-releases/aep-reports-second-quarter-2026-earnings-raises-full-year-guidance-302838454.html',
      type: 'official',
      reliability: 'primary',
    },
    {
      id: 'aep-2026-q2-10q',
      title: 'American Electric Power 2026 Second-Quarter Form 10-Q',
      publisher: 'American Electric Power',
      publishedAt: '2026-07-30',
      url: 'https://docs.aep.com/docs/investors/AEP10Q20262Q.pdf',
      type: 'filing',
      reliability: 'primary',
    },
  ],
  power: [
    {
      id: 'iea-energy-ai',
      title: 'Energy and AI',
      publisher: 'International Energy Agency',
      publishedAt: '2025',
      url: 'https://www.iea.org/reports/energy-and-ai',
      type: 'government',
      reliability: 'primary',
    },
  ],
  compute: [
    {
      id: 'nvidia-dgx-cloud',
      title: 'DGX Cloud',
      publisher: 'NVIDIA',
      url: 'https://www.nvidia.com/en-us/data-center/dgx-cloud/',
      type: 'official',
      reliability: 'primary',
    },
  ],
  land: [
    {
      id: 'microsoft-datacenters',
      title: 'Microsoft Datacenters',
      publisher: 'Microsoft',
      url: 'https://datacenters.microsoft.com/',
      type: 'official',
      reliability: 'primary',
    },
  ],
};

export function enrichSignal(signal: Signal, language: LanguageCode): Signal {
  const localized = copy[language][signal.id];
  const sources = sourceBySignal[signal.id];
  if (!localized || !sources?.length) return signal;

  const localizedSources = sources.map((source, index) => ({
    ...source,
    note: index === 0 ? localized.sourceNote : undefined,
  }));

  return {
    ...signal,
    whyImportant: localized.whyImportant,
    evidence: [
      {
        id: `${signal.id}-evidence`,
        title: localized.evidenceTitle,
        description: localized.evidenceBody,
        confidence: 'verified',
        sourceIds: localizedSources.map((source) => source.id),
      },
    ],
    sources: localizedSources,
  };
}
