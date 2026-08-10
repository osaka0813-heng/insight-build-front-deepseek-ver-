import type { LocalizedInsightEdition } from '../types/insight';

export const seedInsights: LocalizedInsightEdition[] = [
  {
    id: 'global-2026-07-31-industrial-ai',
    slug: 'ai-infrastructure-enters-industrial-finance-phase',
    status: 'update_living',
    parentInsightId: 'global-2026-07-29-capacity',
    processId: 'process-ai-infrastructure-race',
    publishedAt: '2026-07-31T13:30:00+09:00',
    updatedAt: '2026-07-31T13:30:00+09:00',
    confidence: 'verified',
    content: {
      en: {
        cover: {
          eyebrow: "TODAY'S OBSERVE",
          secondaryEyebrow: 'Living Insight Update',
          title: 'AI infrastructure is no longer being bought like technology. It is being financed like heavy industry.',
          summary: 'The competition has crossed into project finance, dedicated power generation and state-scale site development.'
        },
        question: {
          lead: 'The previous Insight identified capacity as the scarce asset. New evidence now shows that capacity itself must be financed, powered and politically assembled.',
          title: 'What changes when AI companies must assemble banks, power plants, land and public policy before they can assemble intelligence?',
          footnote: 'The important change is not simply that data centers are getting larger. Their financing and energy structure now resembles industrial megaprojects.'
        },
        signals: {
          title: 'Three signals show the same phase transition.',
          items: [
            {
              id: 'project-finance',
              label: 'FINANCE',
              title: 'AI capacity is moving into project finance.',
              body: 'Banks are discussing a $15 billion loan for a 1.6-gigawatt Anthropic campus, supported by Google guarantees and a dedicated natural-gas power plant.'
            },
            {
              id: 'industrial-site',
              label: 'STATE + LAND',
              title: 'Public industrial sites are being rebuilt as AI-energy complexes.',
              body: 'A former uranium facility in Kentucky is planned as a $100 billion campus combining 1.8 gigawatts of data centers with 2 gigawatts of gas generation and 2.6 gigawatts of battery storage.'
            },
            {
              id: 'utility-demand',
              label: 'UTILITY',
              title: 'AI demand is becoming visible in utility earnings and planning.',
              body: 'American Electric Power raised its outlook as data centers and other large customers accelerated electricity demand.'
            }
          ],
          sourceNote: 'These are separate financing, land and utility signals. Together they indicate a change in the operating model of AI expansion.'
        },
        pattern: {
          title: 'The AI stack is expanding into an industrial development system.',
          before: 'Technology companies purchased chips and rented cloud capacity.',
          shift: 'Capacity shortages forced long-term commitments to sites, power and compute.',
          now: 'AI expansion requires project finance, dedicated generation, guarantees, construction and public-sector coordination.',
          conclusion: 'The leading AI operators are beginning to behave less like software buyers and more like industrial infrastructure developers.'
        },
        insight: {
          title: 'AI has entered its industrial-finance phase.',
          formula: 'CAPITAL GUARANTEES × DEDICATED POWER × INDUSTRIAL SITES = SOVEREIGN-SCALE AI CAPACITY',
          explanation: 'The next constraint is not only whether a company can design a better model, but whether it can organize a bankable physical system large enough to run it. This raises the advantage of firms with strong balance sheets—and transfers more AI risk into utilities, lenders, governments and local communities.'
        },
        observe: {
          title: 'Watch whether this industrial model becomes the default.',
          items: [
            { label: 'GUARANTEES', prompt: 'More technology companies guaranteeing leases, loans or power obligations for AI partners.', meta: 'FINANCE' },
            { label: 'BEHIND THE METER', prompt: 'More campuses pairing data centers with dedicated gas, nuclear or storage assets.', meta: 'ENERGY' },
            { label: 'PUBLIC LAND', prompt: 'More governments converting military, nuclear or industrial sites into AI campuses.', meta: 'POLICY' },
            { label: 'RISK', prompt: 'Whether electricity costs, stranded capacity or credit exposure migrate outside the AI company itself.', meta: 'SYSTEM' }
          ],
          ending: 'The AI race is now visible in the institutions that finance and power heavy industry.'
        }
      },
      zh: {
        cover: {
          eyebrow: '今日观察',
          secondaryEyebrow: '持续洞察更新',
          title: 'AI基础设施不再像科技产品那样被采购，而开始像重工业那样被融资。',
          summary: '竞争已经进入项目融资、专用发电与国家级工业场地开发阶段。'
        },
        question: {
          lead: '上一条洞察确认了“容量”正在变得稀缺；新的证据进一步显示，容量本身也必须被融资、供电并通过公共协同组织起来。',
          title: '当AI公司必须先组织银行、电厂、土地与公共政策，才能组织智能时，意味着什么？',
          footnote: '重要变化不只是数据中心变得更大，而是它的融资与能源结构开始接近大型工业项目。'
        },
        signals: {
          title: '三个信号显示同一个阶段跃迁。',
          items: [
            {
              id: 'project-finance',
              label: '融资',
              title: 'AI容量开始进入项目融资体系。',
              body: '银行正讨论为Anthropic的1.6吉瓦园区提供150亿美元贷款，Google以担保支持租赁与电力义务，园区还配套专用天然气电厂。'
            },
            {
              id: 'industrial-site',
              label: '国家＋土地',
              title: '公共工业场地正在被重建为AI—能源综合体。',
              body: '肯塔基一座旧铀设施计划改造成1000亿美元园区，将1.8吉瓦数据中心、2吉瓦燃气发电和2.6吉瓦电池储能放进同一项目。'
            },
            {
              id: 'utility-demand',
              label: '公用事业',
              title: 'AI需求开始直接进入电力公司的业绩与规划。',
              body: 'American Electric Power因数据中心和大型客户用电加速，上调了盈利预期。'
            }
          ],
          sourceNote: '融资、土地与公用事业是三类独立信号；它们共同显示AI扩张的运营模式正在改变。'
        },
        pattern: {
          title: 'AI技术栈正在扩展成一套工业开发系统。',
          before: '科技公司购买芯片，并租用云端容量。',
          shift: '容量短缺迫使企业长期锁定场地、电力与算力。',
          now: 'AI扩张需要项目融资、专用发电、信用担保、工程建设与公共部门协同。',
          conclusion: '领先的AI运营者正越来越不像软件采购者，而更像工业基础设施开发商。'
        },
        insight: {
          title: 'AI已经进入“工业融资阶段”。',
          formula: '资本担保 × 专用能源 × 工业场地 = 国家级AI容量',
          explanation: '下一道约束不只是能否设计更好的模型，而是能否组织出一个足够大、可以被融资、可以真实运行的物理系统。这会放大强资产负债表公司的优势，同时把更多AI风险传导给电力公司、银行、政府与当地社区。'
        },
        observe: {
          title: '接下来观察这种工业模式是否成为默认路径。',
          items: [
            { label: '担保', prompt: '更多科技公司是否为AI合作伙伴的租赁、贷款或电力义务提供担保。', meta: '金融' },
            { label: '表后电源', prompt: '更多园区是否把数据中心与燃气、核能或储能资产直接配套。', meta: '能源' },
            { label: '公共土地', prompt: '更多政府是否把军事、核工业或旧工业场地转为AI园区。', meta: '政策' },
            { label: '风险转移', prompt: '电价、闲置容量与信用风险是否被转移到AI公司之外。', meta: '系统' }
          ],
          ending: 'AI竞赛如今已经出现在为重工业融资、供电的那些制度之中。'
        }
      },
      ja: {
        cover: {
          eyebrow: '今日の観察',
          secondaryEyebrow: '継続インサイト更新',
          title: 'AIインフラは、もはや技術製品のように購入されず、重工業のように資金調達され始めた。',
          summary: '競争はプロジェクト金融、専用発電、国家規模の産業用地開発へ入った。'
        },
        question: {
          lead: '前回のインサイトは「供給能力」の希少化を捉えた。新しい証拠は、その能力自体を金融・電力・公共調整で組成する必要があることを示している。',
          title: 'AI企業が知能を組み立てる前に、銀行・発電所・土地・公共政策を組み立てなければならないとき、何が変わるのか。',
          footnote: '重要なのはデータセンターが大型化したことだけではない。資金調達とエネルギー構造が巨大産業プロジェクトに近づいたことだ。'
        },
        signals: {
          title: '三つのシグナルが同じ段階転換を示す。',
          items: [
            {
              id: 'project-finance',
              label: '金融',
              title: 'AI能力がプロジェクト金融へ入る。',
              body: '銀行はAnthropic向け1.6GWキャンパスへの150億ドル融資を協議し、Googleが賃貸・電力義務を保証、専用ガス発電も組み込まれる。'
            },
            {
              id: 'industrial-site',
              label: '国家＋土地',
              title: '公共産業用地がAI・エネルギー複合施設へ再編される。',
              body: 'ケンタッキーの旧ウラン施設では、1.8GWのデータセンター、2GWのガス発電、2.6GWの蓄電池を組み合わせる1000億ドル計画が進む。'
            },
            {
              id: 'utility-demand',
              label: '電力会社',
              title: 'AI需要が電力会社の業績と計画に直接現れる。',
              body: 'American Electric Powerは、データセンターなど大型需要家の電力需要増加を受け、業績見通しを引き上げた。'
            }
          ],
          sourceNote: '金融、土地、電力会社という別々のシグナルが、AI拡張の運営モデルの変化を同時に示している。'
        },
        pattern: {
          title: 'AIスタックが産業開発システムへ広がる。',
          before: '技術企業は半導体を購入し、クラウド能力を借りていた。',
          shift: '能力不足が、用地・電力・計算資源の長期確保を迫った。',
          now: 'AI拡張にはプロジェクト金融、専用発電、信用保証、建設、公共部門との調整が必要になる。',
          conclusion: '主要AI事業者は、ソフトウェア購入者より産業インフラ開発者に近づいている。'
        },
        insight: {
          title: 'AIは「産業金融フェーズ」に入った。',
          formula: '資本保証 × 専用電源 × 産業用地 = 国家規模のAI能力',
          explanation: '次の制約は優れたモデルを設計できるかだけではなく、それを動かす巨大で融資可能な物理システムを組成できるかである。強い財務基盤を持つ企業が有利になり、AIリスクは電力会社、金融機関、政府、地域社会へ広がる。'
        },
        observe: {
          title: 'この産業モデルが標準になるかを観察する。',
          items: [
            { label: '保証', prompt: '技術企業がAI提携先の賃貸、融資、電力義務を保証する例が増えるか。', meta: '金融' },
            { label: '専用電源', prompt: 'データセンターとガス、原子力、蓄電設備を直接組み合わせるキャンパスが増えるか。', meta: 'エネルギー' },
            { label: '公共用地', prompt: '軍事、原子力、旧産業用地をAIキャンパスへ転換する政府が増えるか。', meta: '政策' },
            { label: 'リスク', prompt: '電気料金、遊休能力、信用リスクがAI企業の外へ移るか。', meta: 'システム' }
          ],
          ending: 'AI競争は、重工業を支える金融と電力の制度の中に現れ始めた。'
        }
      }
    }
  },
  {
    id: 'global-2026-07-29-capacity', slug: 'ai-capacity-becomes-strategic-asset', status: 'publish_new', processId: 'process-ai-infrastructure-race',
    publishedAt: '2026-07-29T07:00:00+09:00', updatedAt: '2026-07-29T15:30:00+09:00', confidence: 'verified',
    content: {
      en: {
        cover: { eyebrow: "TODAY'S OBSERVE", secondaryEyebrow: 'Global Insight', title: 'AI companies are no longer only buying chips. They are buying capacity.', summary: 'The competition is shifting from model performance to control over the physical systems that make intelligence available.' },
        question: { lead: 'The market still talks about models.', title: 'What changes when the scarce asset is no longer intelligence itself, but the capacity to deliver it?', footnote: 'The important change is not a single investment. It is the repeated acquisition of power, land, data-center access and long-term infrastructure.' },
        signals: { title: 'Three signals point to the same structural change.', items: [
          { id: 'power', label: 'ENERGY', title: 'Power contracts are becoming strategic assets.', body: 'AI operators increasingly secure long-duration energy access rather than relying only on spot availability.' },
          { id: 'compute', label: 'COMPUTE', title: 'Compute is being reserved years ahead.', body: 'Capacity planning is moving from quarterly purchasing to multi-year infrastructure commitments.' },
          { id: 'land', label: 'PHYSICAL', title: 'Land and grid access now shape AI expansion.', body: 'Projects are constrained by interconnection queues, cooling, permits and suitable physical locations.' },
        ], sourceNote: 'Signals are evaluated as a system. No single signal is sufficient on its own.' },
        pattern: { title: 'The competitive advantage is moving down the stack.', before: 'Win by building the best model.', shift: 'Secure the systems required to run intelligence at scale.', now: 'Win by controlling access to power, compute, land and distribution.', conclusion: 'The AI race is becoming an infrastructure race without ceasing to be a software race.' },
        insight: { title: 'AI capacity is becoming a strategic asset class.', formula: 'MODEL ADVANTAGE × INFRASTRUCTURE CONTROL × DISTRIBUTION = DEPLOYABLE INTELLIGENCE', explanation: 'The companies able to turn intelligence into a dependable utility may gain an advantage that cannot be reproduced by model quality alone.' },
        observe: { title: 'Watch whether the system keeps moving in this direction.', items: [
          { label: 'GRID', prompt: 'Long-term power agreements and interconnection access.', meta: 'ENERGY' },
          { label: 'COMPUTE', prompt: 'Multi-year reservation of accelerators and data-center capacity.', meta: 'INFRA' },
          { label: 'LAND', prompt: 'Acquisition of locations with power, cooling and permitting advantages.', meta: 'PHYSICAL' },
          { label: 'DISTRIBUTION', prompt: 'Who owns the customer relationship through which AI is delivered.', meta: 'MARKET' },
        ], ending: "Today's observation is complete." },
      },
      zh: {
        cover: { eyebrow: '今日观察', secondaryEyebrow: '全球洞察', title: 'AI公司购买的已不只是芯片，而是整个“能力供给”。', summary: '竞争正在从模型性能，转向对电力、算力、土地和分发系统的控制。' },
        question: { lead: '市场仍在谈论模型。', title: '当真正稀缺的不再是智能本身，而是稳定交付智能的能力时，会发生什么？', footnote: '重要的变化并不是某一笔投资，而是企业反复锁定电力、土地、数据中心与长期基础设施。' },
        signals: { title: '三个信号正在指向同一个结构性变化。', items: [
          { id: 'power', label: '能源', title: '长期电力合同正在成为战略资产。', body: 'AI运营者开始锁定长期能源，而不再只依赖随时可获得的现货供应。' },
          { id: 'compute', label: '算力', title: '算力开始提前数年被预订。', body: '容量规划正从按季度采购，转向跨越数年的基础设施承诺。' },
          { id: 'land', label: '实体设施', title: '土地与电网接入正在决定AI扩张。', body: '项目越来越受制于并网排队、冷却、许可和合适的物理位置。' },
        ], sourceNote: '这些信号必须作为一个系统进行判断，任何单一信号都不足以形成结论。' },
        pattern: { title: '竞争优势正在向技术栈的底层移动。', before: '通过打造最好的模型取胜。', shift: '先确保大规模运行智能所需的系统。', now: '通过控制电力、算力、土地和分发入口取胜。', conclusion: 'AI竞赛在没有停止软件竞争的同时，正在变成一场基础设施竞赛。' },
        insight: { title: 'AI能力供给正在成为一种战略资产类别。', formula: '模型优势 × 基础设施控制 × 分发能力 = 可交付的智能', explanation: '能够把智能变成稳定公共能力的企业，可能获得一种仅靠模型质量无法复制的优势。' },
        observe: { title: '接下来观察这个系统是否继续沿同一方向发展。', items: [
          { label: '电网', prompt: '长期购电协议与并网资格。', meta: '能源' },
          { label: '算力', prompt: '加速器与数据中心容量的多年预订。', meta: '基础设施' },
          { label: '土地', prompt: '具备电力、冷却和许可优势的地点收购。', meta: '实体资产' },
          { label: '分发', prompt: '谁掌握将AI交付给用户的客户关系。', meta: '市场' },
        ], ending: '今天的观察已经完成。' },
      },
      ja: {
        cover: { eyebrow: '今日の観察', secondaryEyebrow: 'グローバル・インサイト', title: 'AI企業が買っているのは、もはやチップだけではない。「供給能力」そのものだ。', summary: '競争の軸はモデル性能から、電力・計算資源・土地・流通を支える物理システムの支配へ移りつつある。' },
        question: { lead: '市場は今もモデルを語っている。', title: '希少なのが知能そのものではなく、知能を安定して届ける能力になったとき、何が変わるのか。', footnote: '重要なのは一件の投資ではない。電力、土地、データセンター、長期インフラを繰り返し確保する動きである。' },
        signals: { title: '三つのシグナルが同じ構造変化を示している。', items: [
          { id: 'power', label: 'エネルギー', title: '長期電力契約が戦略資産になりつつある。', body: 'AI事業者はスポット供給だけに頼らず、長期の電力アクセスを確保し始めている。' },
          { id: 'compute', label: '計算資源', title: '計算能力が数年先まで予約されている。', body: '容量計画は四半期ごとの購入から、複数年のインフラ契約へ移行している。' },
          { id: 'land', label: '物理基盤', title: '土地と電力網への接続がAI拡張を左右する。', body: '系統接続待ち、冷却、許認可、適地の不足がプロジェクトを制約している。' },
        ], sourceNote: 'シグナルは一つずつではなく、システムとして評価する必要がある。' },
        pattern: { title: '競争優位は技術スタックの下層へ移っている。', before: '最良のモデルを作ることで勝つ。', shift: '知能を大規模に動かすためのシステムを先に確保する。', now: '電力、計算資源、土地、流通経路へのアクセスを支配して勝つ。', conclusion: 'AI競争はソフトウェア競争であり続けながら、インフラ競争へ変わりつつある。' },
        insight: { title: 'AIの供給能力は戦略的な資産クラスになりつつある。', formula: 'モデル優位 × インフラ支配 × 流通 = 実際に届けられる知能', explanation: '知能を安定した公共能力へ変えられる企業は、モデル品質だけでは再現できない優位を得る可能性がある。' },
        observe: { title: 'このシステムが同じ方向へ進み続けるかを見る。', items: [
          { label: '電力網', prompt: '長期電力契約と系統接続権。', meta: 'エネルギー' },
          { label: '計算資源', prompt: 'アクセラレータとデータセンター容量の複数年予約。', meta: 'インフラ' },
          { label: '土地', prompt: '電力・冷却・許認可で優位な立地の取得。', meta: '物理資産' },
          { label: '流通', prompt: 'AIを届ける顧客接点を誰が所有するか。', meta: '市場' },
        ], ending: '今日の観察は完了です。' },
      },
    },
  },
  {
    id: 'global-2026-07-26-capacity-update', slug: 'ai-capacity-living-update', status: 'update_living', parentInsightId: 'global-2026-07-29-capacity', processId: 'process-ai-infrastructure-race',
    publishedAt: '2026-07-26T08:00:00+09:00', updatedAt: '2026-07-28T18:10:00+09:00', confidence: 'developing',
    content: {
      en: compact('LIVING INSIGHT', 'The AI race is expanding beyond models.', 'New evidence suggests infrastructure ownership may become as important as model leadership.', 'Is infrastructure becoming the less visible source of AI power?', 'AI leadership may depend on infrastructure control.', 'This insight was later updated.'),
      zh: compact('持续洞察', 'AI竞赛正在从模型扩展到模型之外。', '新证据显示，基础设施所有权可能与模型领先同样重要。', '基础设施是否正在成为AI力量中不易被看见的来源？', 'AI领导力可能取决于基础设施控制。', '这条洞察后来得到了更新。'),
      ja: compact('継続インサイト', 'AI競争はモデルの外側へ広がっている。', '新しい証拠は、インフラ所有がモデル優位と同じほど重要になる可能性を示す。', 'インフラはAIの見えにくい力の源になりつつあるのか。', 'AIの主導権はインフラ支配に左右される可能性がある。', 'この洞察は後に更新された。'),
    },
  },
  {
    id: 'global-2026-07-22-no-new', slug: 'no-new-global-insight', status: 'no_new',
    publishedAt: '2026-07-22T07:00:00+09:00', updatedAt: '2026-07-22T07:00:00+09:00', confidence: 'verified',
    content: {
      en: compact('NO NEW GLOBAL INSIGHT', 'The world changed, but not enough to justify a new global thesis.', 'Important events occurred, yet the evidence did not establish a new system relationship or phase transition.', 'Did the evidence change the structure, or only the headlines?', 'No new Global Insight today.', 'Observation continues.'),
      zh: compact('今日无新洞察', '世界发生了变化，但还不足以形成新的全球命题。', '重要事件确实发生了，但证据尚未建立新的系统关系或阶段跃迁。', '证据改变的是结构，还是只有新闻标题？', '今天没有新的全球洞察。', '观察仍在继续。'),
      ja: compact('新しいグローバル洞察なし', '世界は変化したが、新しい世界的命題を出すには至らなかった。', '重要な出来事はあったが、新しいシステム関係や段階転換を示す証拠は不足していた。', '証拠が変えたのは構造か、それとも見出しだけか。', '今日は新しいグローバル・インサイトなし。', '観察は続く。'),
    },
  },
];

function compact(eyebrow: string, title: string, summary: string, question: string, insightTitle: string, ending: string) {
  return {
    cover: { eyebrow, title, summary },
    question: { lead: summary, title: question, footnote: summary },
    signals: { title: summary, items: [
      { id: 'one', label: '01', title: summary, body: summary },
      { id: 'two', label: '02', title: question, body: summary },
      { id: 'three', label: '03', title: insightTitle, body: summary },
    ], sourceNote: summary },
    pattern: { title: summary, before: title, shift: question, now: insightTitle, conclusion: summary },
    insight: { title: insightTitle, formula: 'SIGNAL × EVIDENCE × STRUCTURE = INSIGHT', explanation: summary },
    observe: { title: question, items: [
      { label: '01', prompt: summary, meta: 'WATCH' }, { label: '02', prompt: question, meta: 'WATCH' },
      { label: '03', prompt: insightTitle, meta: 'WATCH' }, { label: '04', prompt: summary, meta: 'WATCH' },
    ], ending },
  };
}
