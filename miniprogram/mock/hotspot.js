const clone = (value) => JSON.parse(JSON.stringify(value))

const HOTSPOTS = [
  {
    id: 'hs-001',
    tag: '时政',
    title: '人工智能与新质生产力',
    date: '2026-03',
    isHot: true,
    summary: '人工智能正成为培育新质生产力的重要引擎，发展与治理并重成为公共讨论重点。',
    background:
      '多地围绕人工智能产业布局算力、算法和场景应用，但也同步面临数据安全、算法偏差和就业替代等现实挑战。',
    keyPoints: [
      '坚持发展与安全并重',
      '推动人工智能与实体经济深度融合',
      '强化技术伦理和数据治理',
      '完善人才培养与就业转型支持',
    ],
    quotations: [{ source: '政策表述', text: '加快发展新质生产力。' }],
    relatedTopics: ['请分析人工智能产业发展带来的机遇与挑战。'],
  },
  {
    id: 'hs-002',
    tag: '经济',
    title: '县域经济高质量发展',
    date: '2026-03',
    isHot: true,
    summary: '县域经济正从“拼资源”转向“拼特色、拼链条、拼服务”。',
    background:
      '部分县域依托特色制造、现代农业和文旅资源培育产业集群，但仍存在同质竞争、人才外流和公共服务承载不足等问题。',
    keyPoints: [
      '因地制宜发展主导产业',
      '完善公共服务和营商环境',
      '增强园区和产业链协同能力',
      '吸引青年人才返乡创业就业',
    ],
    quotations: [],
    relatedTopics: ['请提出推动县域经济高质量发展的具体路径。'],
  },
  {
    id: 'hs-003',
    tag: '社会',
    title: '基层减负与数字治理',
    date: '2026-02',
    isHot: true,
    summary: '基层减负进入深水区，数字工具既可能赋能，也可能带来新的填报负担。',
    background:
      '一些地方通过整合系统、压减台账和优化流程减轻基层负担，但也有地方出现系统重复建设、报表叠加等问题。',
    keyPoints: [
      '系统整合优先于系统叠加',
      '减负要直达基层末梢',
      '重视群众感受和实际效果',
      '建立常态化评估和反馈机制',
    ],
    quotations: [],
    relatedTopics: ['请分析数字治理在基层减负中的作用与限度。'],
  },
  {
    id: 'hs-004',
    tag: '民生',
    title: '银发经济与养老服务',
    date: '2026-02',
    isHot: true,
    summary: '老龄化背景下，银发经济成为扩内需与惠民生的重要结合点。',
    background:
      '养老服务需求加快释放，康养、适老化改造、老年教育和智慧养老等新业态不断出现，但标准和供给仍需完善。',
    keyPoints: [
      '完善社区居家养老服务网络',
      '鼓励适老产品和服务创新',
      '加强养老服务监管',
      '推进医养康养结合',
    ],
    quotations: [],
    relatedTopics: ['请提出发展银发经济、提升养老服务质量的建议。'],
  },
  {
    id: 'hs-005',
    tag: '乡村',
    title: '农村电商与农产品上行',
    date: '2026-02',
    isHot: false,
    summary: '农村电商成为拓宽农产品销售渠道的重要手段，但产业链配套仍待加强。',
    background:
      '直播带货、冷链物流和区域品牌推广持续发展，不过很多地区仍存在品牌弱、仓配慢、售后难等短板。',
    keyPoints: [
      '做强区域公用品牌',
      '完善冷链物流和仓配体系',
      '培养本土电商人才',
      '提升产品标准化水平',
    ],
    quotations: [],
    relatedTopics: ['请结合农村电商发展现状提出改进思路。'],
  },
  {
    id: 'hs-006',
    tag: '文化',
    title: '非遗活化与文旅融合',
    date: '2026-01',
    isHot: false,
    summary: '非遗活化正从静态保护走向动态传承，关键在于让传统文化融入现代生活。',
    background:
      '不少地方借助非遗工坊、研学旅游和文创开发带动就业，但也存在过度商业化和内容空心化风险。',
    keyPoints: [
      '坚持保护优先、合理利用',
      '增强年轻群体参与感',
      '推动非遗与文旅、教育融合',
      '警惕“只重流量不重传承”',
    ],
    quotations: [],
    relatedTopics: ['请分析非遗活化利用中的机遇与风险。'],
  },
  {
    id: 'hs-007',
    tag: '教育',
    title: '校园心理健康服务',
    date: '2026-01',
    isHot: false,
    summary: '学生心理健康问题受到高度关注，预防、识别、干预一体化体系建设成为重点。',
    background:
      '心理教师、课程、家校协同和社会支持体系仍存在短板，部分学校心理健康教育的专业化程度不足。',
    keyPoints: [
      '强化心理健康教育课程体系',
      '完善早识别早干预机制',
      '健全家校医社协同支持',
      '提升心理服务专业化水平',
    ],
    quotations: [],
    relatedTopics: ['请提出完善校园心理健康服务体系的对策。'],
  },
  {
    id: 'hs-008',
    tag: '治理',
    title: '社区合伙人与共治共享',
    date: '2026-01',
    isHot: false,
    summary: '“社区合伙人”模式为激发社会力量参与基层治理提供了新思路。',
    background:
      '社区通过链接商户、社会组织和居民骨干，共同参与服务供给和空间运营，提升了公共资源利用效率。',
    keyPoints: [
      '明确规则和参与边界',
      '构建多元协同治理机制',
      '保障居民主体地位',
      '防止形式化、标签化合作',
    ],
    quotations: [],
    relatedTopics: ['请分析“社区合伙人”模式的价值与推广条件。'],
  },
  {
    id: 'hs-009',
    tag: '生态',
    title: '绿色低碳转型与城市更新',
    date: '2025-12',
    isHot: false,
    summary: '城市更新进入品质提升阶段，绿色低碳改造成为重要方向。',
    background:
      '老旧建筑节能改造、公共交通优化和绿色基础设施建设持续推进，但资金平衡和长效运维仍是难点。',
    keyPoints: [
      '把绿色理念贯穿更新全过程',
      '统筹短期投入与长期收益',
      '鼓励市场和社会资本参与',
      '提升居民参与和获得感',
    ],
    quotations: [],
    relatedTopics: ['请围绕绿色低碳城市更新谈谈你的理解。'],
  },
  {
    id: 'hs-010',
    tag: '就业',
    title: '灵活就业与社会保障',
    date: '2025-12',
    isHot: false,
    summary: '新就业形态持续扩容，如何在提高就业弹性的同时完善权益保障备受关注。',
    background:
      '平台经济催生了大量灵活就业岗位，但劳动关系认定、工伤保障和职业发展支持仍存在制度空白。',
    keyPoints: [
      '完善新就业形态劳动者权益保障',
      '优化社会保险参保机制',
      '加强职业培训和能力提升',
      '推动平台企业履责',
    ],
    quotations: [],
    relatedTopics: ['请分析灵活就业快速发展背景下的制度完善方向。'],
  },
]

export function getHotspots(tag = '') {
  if (!tag || tag === '推荐') {
    return clone(HOTSPOTS)
  }

  return clone(HOTSPOTS.filter((item) => item.tag === tag))
}

export function getHotspotById(id) {
  return clone(HOTSPOTS.find((item) => item.id === id) || null)
}
