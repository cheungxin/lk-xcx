const clone = (value) => JSON.parse(JSON.stringify(value))

const QUESTION_TYPE_NAMES = {
  summary: '概括归纳',
  countermeasure: '提出对策',
  analysis: '综合分析',
  execution: '贯彻执行',
  essay: '申发论述',
}

const TYPE_CONFIG = {
  summary: {
    wordLimit: 200,
    difficulty: 'medium',
    taskLabel: '概括主要问题',
  },
  countermeasure: {
    wordLimit: 350,
    difficulty: 'hard',
    taskLabel: '提出具体对策',
  },
  analysis: {
    wordLimit: 400,
    difficulty: 'hard',
    taskLabel: '展开综合分析',
  },
  execution: {
    wordLimit: 800,
    difficulty: 'medium',
    taskLabel: '完成贯彻执行类公文',
  },
  essay: {
    wordLimit: 1000,
    difficulty: 'hard',
    taskLabel: '完成议论文写作',
  },
}

const TOPIC_BANK = {
  summary: [
    {
      year: 2026,
      source: '国考申论（省级以上）',
      title: '数字治理中的数据孤岛问题',
      materialTitle: '关于公共数据共享的调研材料',
      theme: '当前不少地方在推进数字治理过程中，部门系统标准不统一、接口不兼容、共享意愿不足，导致数据重复采集、基层填表负担加重，群众办事仍需反复提交材料。',
      prompt: '请根据给定资料，概括当前公共数据共享存在的主要问题。',
      tags: ['数字治理', '数据共享'],
    },
    {
      year: 2025,
      source: '省考申论（A卷）',
      title: '县域文旅融合面临的短板',
      materialTitle: '关于县域旅游发展的走访记录',
      theme: '部分县域虽然拥有自然资源和红色文化资源，但存在产品同质化、配套服务不足、宣传方式老旧、专业运营人才匮乏等问题，旺季热闹、淡季冷清。',
      prompt: '请概括县域文旅融合发展面临的突出问题。',
      tags: ['文旅融合', '县域发展'],
    },
    {
      year: 2025,
      source: '国考申论（地市级）',
      title: '社区养老服务供给不足',
      materialTitle: '关于社区养老服务体系建设的访谈纪要',
      theme: '社区养老服务覆盖面不断扩大，但服务内容偏少、供需对接不精准、专业护理人员短缺、居家上门服务标准不统一，制约了养老服务质量提升。',
      prompt: '请概括当前社区养老服务存在的主要问题。',
      tags: ['养老服务', '基层治理'],
    },
    {
      year: 2024,
      source: '省考申论（B卷）',
      title: '青年返乡创业的现实困难',
      materialTitle: '关于返乡创业青年的案例材料',
      theme: '一些返乡青年有意愿、有项目，但普遍反映融资渠道少、品牌打造难、政策获取不及时、物流和供应链体系薄弱，创业初期抗风险能力不足。',
      prompt: '请概括青年返乡创业面临的现实困难。',
      tags: ['返乡创业', '乡村振兴'],
    },
    {
      year: 2024,
      source: '联考申论',
      title: '基层减负中的形式主义问题',
      materialTitle: '关于基层减负的问卷材料',
      theme: '尽管减负要求反复强调，但基层仍存在层层留痕、重复报表、临时检查过多、系统填报重复等现象，一线干部将大量时间耗费在事务性工作上。',
      prompt: '请概括基层减负工作中仍然存在的突出问题。',
      tags: ['基层减负', '形式主义'],
    },
  ],
  countermeasure: [
    {
      year: 2026,
      source: '省考申论（A卷）',
      title: '老旧小区治理提升对策',
      materialTitle: '关于老旧小区改造的座谈材料',
      theme: '部分老旧小区改造后“硬件更新快、后续管理弱”，居民议事机制不健全，物业引入难，停车、加装电梯和空间利用等问题反复出现。',
      prompt: '请结合材料，提出提升老旧小区治理水平的具体对策。',
      tags: ['社区治理', '老旧小区'],
    },
    {
      year: 2025,
      source: '国考申论（地市级）',
      title: '县域医疗服务提质对策',
      materialTitle: '关于县域医疗共同体建设的调研材料',
      theme: '基层医疗机构设备利用率不高，优秀医生下沉激励不足，群众跨区就医成本高，慢病管理链条不够完整。',
      prompt: '请提出提升县域医疗服务能力的对策建议。',
      tags: ['医疗改革', '公共服务'],
    },
    {
      year: 2025,
      source: '联考申论',
      title: '制造业中小企业数字化改造对策',
      materialTitle: '关于中小企业转型升级的调研材料',
      theme: '中小企业在数字化改造中面临投入压力大、专业团队不足、方案不匹配、数据安全担忧等问题，很多企业“不敢转、不愿转、不会转”。',
      prompt: '请结合资料，提出推进制造业中小企业数字化改造的对策。',
      tags: ['制造业', '数字化转型'],
    },
    {
      year: 2024,
      source: '省考申论（A卷）',
      title: '农村电商持续发展对策',
      materialTitle: '关于农村电商发展的走访报告',
      theme: '农村电商发展速度快，但品牌意识薄弱、冷链物流不完善、直播人才短缺、售后体系不健全，制约了农业产品上行。',
      prompt: '请针对农村电商发展中的问题提出可行对策。',
      tags: ['农村电商', '乡村振兴'],
    },
    {
      year: 2024,
      source: '事业单位申论',
      title: '校园心理健康服务对策',
      materialTitle: '关于学生心理健康教育的调研材料',
      theme: '部分学校心理教师配比不足，预警机制滞后，家校协同不够，学生求助意识不强，心理健康教育常常流于活动化、口号化。',
      prompt: '请提出完善校园心理健康服务体系的具体建议。',
      tags: ['教育治理', '心理健康'],
    },
  ],
  analysis: [
    {
      year: 2026,
      source: '国考申论（省级以上）',
      title: '如何看待“慢就业”现象',
      materialTitle: '关于青年就业观念变化的评论材料',
      theme: '部分年轻人毕业后没有立即就业，而是选择考证、学习、实习或短暂休整。舆论对此既有理解也有质疑。',
      prompt: '请结合材料，谈谈你对“慢就业”现象的看法。',
      tags: ['青年就业', '社会现象'],
    },
    {
      year: 2025,
      source: '省考申论（A卷）',
      title: '公共文化空间“网红化”现象分析',
      materialTitle: '关于城市公共文化空间建设的案例材料',
      theme: '一些书店、文化馆、博物馆通过视觉设计和社交媒体传播吸引大量游客，但也出现“打卡多、阅读少”“流量高、转化弱”等争议。',
      prompt: '请对公共文化空间“网红化”现象进行综合分析。',
      tags: ['公共文化', '城市治理'],
    },
    {
      year: 2025,
      source: '国考申论（地市级）',
      title: 'AI赋能政务服务的利与弊',
      materialTitle: '关于人工智能政务应用的调研材料',
      theme: 'AI客服、智能审批和辅助决策等应用不断增加，一方面提升效率，另一方面也带来数据安全、责任边界和算法偏差问题。',
      prompt: '请分析人工智能赋能政务服务的积极意义和潜在风险。',
      tags: ['人工智能', '政务服务'],
    },
    {
      year: 2024,
      source: '联考申论',
      title: '“社区合伙人”治理模式分析',
      materialTitle: '关于基层共治模式的案例材料',
      theme: '一些社区引入社会组织、商户和志愿者，共同参与环境整治、便民服务和活动组织，形成了“社区合伙人”机制。',
      prompt: '请对“社区合伙人”治理模式进行综合分析。',
      tags: ['基层治理', '共建共治'],
    },
    {
      year: 2024,
      source: '省考申论（B卷）',
      title: '预制菜进校园的争议分析',
      materialTitle: '关于校园餐饮管理的讨论材料',
      theme: '预制菜因标准化和便捷性进入一些学校食堂，但家长对营养、口味和安全仍有担心，社会讨论持续升温。',
      prompt: '请围绕“预制菜进校园”现象展开分析。',
      tags: ['食品安全', '校园治理'],
    },
  ],
  execution: [
    {
      year: 2026,
      source: '省考申论（B卷）',
      title: '撰写青年夜校工作方案',
      materialTitle: '关于打造青年夜校品牌的通知材料',
      theme: '某市拟面向青年群体开设夜校课程，课程涵盖职业技能、文化艺术、心理减压、非遗体验等内容，要求各区制定实施方案。',
      prompt: '请以区人社局名义，撰写一份青年夜校实施方案。',
      tags: ['实施方案', '青年服务'],
    },
    {
      year: 2025,
      source: '国考申论（地市级）',
      title: '撰写营商环境优化情况汇报',
      materialTitle: '关于优化营商环境典型做法的材料',
      theme: '某地通过“企业服务专员”“拿地即开工”“高频事项一窗办”等改革措施，显著缩短了项目审批周期。',
      prompt: '请以市行政审批局名义，写一份优化营商环境工作情况汇报。',
      tags: ['工作汇报', '营商环境'],
    },
    {
      year: 2025,
      source: '联考申论',
      title: '撰写文明养犬倡议书',
      materialTitle: '关于文明城市创建的背景材料',
      theme: '随着城市养犬数量增加，遛狗不牵绳、犬只扰民、粪便不清理等问题引发居民投诉，街道拟开展文明养犬宣传活动。',
      prompt: '请以街道办名义撰写一份文明养犬倡议书。',
      tags: ['倡议书', '文明创建'],
    },
    {
      year: 2024,
      source: '省考申论（A卷）',
      title: '撰写农产品品牌推介稿',
      materialTitle: '关于区域公用品牌建设的材料',
      theme: '某县围绕富硒茶、生态米和山地果蔬打造区域农产品品牌，准备在博览会上集中推介。',
      prompt: '请以县农业农村局名义撰写一篇农产品品牌推介稿。',
      tags: ['推介稿', '农业品牌'],
    },
    {
      year: 2024,
      source: '事业单位申论',
      title: '撰写社区志愿服务招募通知',
      materialTitle: '关于开展社区志愿服务月活动的材料',
      theme: '社区计划在志愿服务月中开展助老、助学、环境整治、文明劝导等活动，需要向辖区居民发布志愿者招募通知。',
      prompt: '请撰写一份社区志愿服务招募通知。',
      tags: ['通知', '志愿服务'],
    },
  ],
  essay: [
    {
      year: 2026,
      source: '国考申论（省级以上）',
      title: '因地制宜发展县域经济',
      materialTitle: '关于县域经济高质量发展的案例材料',
      theme: '材料展示了不同地区依托产业基础、资源禀赋和区位条件，探索特色化、差异化发展的实践路径。',
      prompt: '请以“因地制宜发展县域经济”为主题写一篇议论文。',
      tags: ['县域经济', '高质量发展'],
    },
    {
      year: 2025,
      source: '省考申论（A卷）',
      title: '让基层治理更有温度',
      materialTitle: '关于基层精细化治理的系列案例',
      theme: '一些基层组织通过网格走访、社区议事和数字工具提升治理精度，同时注重面对面沟通，让治理更有温度。',
      prompt: '请以“让基层治理更有温度”为题写一篇文章。',
      tags: ['基层治理', '民生服务'],
    },
    {
      year: 2025,
      source: '联考申论',
      title: '以创新驱动塑造产业新优势',
      materialTitle: '关于科技创新与产业升级的材料',
      theme: '材料围绕科技成果转化、企业创新主体作用、产学研融合和人才支撑，展示了产业升级的实践路径。',
      prompt: '请以“以创新驱动塑造产业新优势”为主题写一篇文章。',
      tags: ['科技创新', '产业升级'],
    },
    {
      year: 2024,
      source: '省考申论（B卷）',
      title: '在传承中激活文化生命力',
      materialTitle: '关于非遗保护与活化利用的案例材料',
      theme: '多地通过非遗进校园、数字化展示和文创开发，让传统文化走入当代生活，既保护了技艺，也带动了就业。',
      prompt: '请围绕“在传承中激活文化生命力”写一篇议论文。',
      tags: ['文化传承', '非遗保护'],
    },
    {
      year: 2024,
      source: '事业单位申论',
      title: '把群众满意作为工作的出发点',
      materialTitle: '关于优化公共服务的案例材料',
      theme: '一些单位通过换位思考、流程优化和作风转变，把群众满意度作为衡量工作成效的重要标准，取得明显成效。',
      prompt: '请以“把群众满意作为工作的出发点”为主题写一篇文章。',
      tags: ['群众路线', '作风建设'],
    },
  ],
}

const buildReferenceAnswer = (type, item) => {
  if (type === 'summary') {
    return `材料主要反映了${item.tags[0]}领域的几个突出问题：一是${item.theme.slice(0, 22)}；二是制度、资源和机制配套仍不完善；三是执行落地和群众体验之间存在明显落差。作答时应分点提炼、概括准确。`
  }

  if (type === 'countermeasure') {
    return `建议从四个方面发力：一是完善制度机制，明确责任分工；二是加大资源投入，补齐短板弱项；三是强化人才和技术支撑，提升专业化水平；四是建立评估反馈机制，推动措施常态长效落实。`
  }

  if (type === 'analysis') {
    return `该现象具有两面性。一方面，它反映了现实需求与治理创新，具有积极意义；另一方面，也暴露出规则供给不足、风险识别不够和协同治理不充分等问题。应坚持问题导向，趋利避害、规范发展。`
  }

  if (type === 'execution') {
    return `正文应包括背景目的、工作目标、主要措施、时间安排和组织保障等部分，语言规范、结构完整，结尾可用“以上方案，请审定”或“特此通知”等常用表述。`
  }

  return `文章可围绕主题提出总论点，再从制度保障、创新驱动、群众参与或文化价值等角度展开论证，做到观点鲜明、结构完整、论据充分、结尾有升华。`
}

const buildScoringPoints = (type) => {
  if (type === 'summary') {
    return ['要点全面', '分类准确', '语言精炼', '条理清晰']
  }
  if (type === 'countermeasure') {
    return ['问题对应', '对策具体', '主体明确', '可操作性强']
  }
  if (type === 'analysis') {
    return ['观点明确', '分析辩证', '逻辑完整', '建议合理']
  }
  if (type === 'execution') {
    return ['格式规范', '内容完整', '结构清晰', '语言得体']
  }
  return ['立意准确', '论证充分', '结构完整', '语言流畅']
}

const SHENLUN_QUESTIONS = Object.keys(TOPIC_BANK).reduce(
  (result, typeKey, typeIndex) => {
    const baseOffset = typeIndex * 5
    TOPIC_BANK[typeKey].forEach((item, index) => {
      const id = `sq${String(baseOffset + index + 1).padStart(3, '0')}`
      result.push({
        id,
        type: typeKey,
        year: item.year,
        source: item.source,
        title: item.title,
        materialTitle: item.materialTitle,
        material: `【材料】${item.theme}\n\n地方调研还显示，相关主体普遍认为，要破解难题，既需要完善顶层设计，也需要加强基层执行、资源整合和群众参与，推动经验从“个别探索”走向“机制固化”。`,
        question: `${item.prompt}\n\n要求：${TYPE_CONFIG[typeKey].taskLabel}，字数控制在${TYPE_CONFIG[typeKey].wordLimit}字以内。`,
        wordLimit: TYPE_CONFIG[typeKey].wordLimit,
        difficulty: TYPE_CONFIG[typeKey].difficulty,
        referenceAnswer: buildReferenceAnswer(typeKey, item),
        scoringPoints: buildScoringPoints(typeKey),
        tags: item.tags,
      })
    })
    return result
  },
  [],
)

const DAILY_SHENLUN_POOL = {
  '2026-03-26': { questionId: 'sq001', type: 'summary' },
  '2026-03-25': { questionId: 'sq006', type: 'countermeasure' },
  '2026-03-24': { questionId: 'sq011', type: 'analysis' },
  '2026-03-23': { questionId: 'sq016', type: 'execution' },
  '2026-03-22': { questionId: 'sq021', type: 'essay' },
}

const expandQuestions = (list, count) => {
  if (!list.length || count <= 0) {
    return []
  }

  const result = []
  for (let index = 0; index < count; index += 1) {
    result.push(list[index % list.length])
  }
  return result
}

export function getShenlunQuestions(type, count = 3) {
  const filtered = SHENLUN_QUESTIONS.filter((item) => item.type === type)
  return clone(expandQuestions(filtered, count))
}

export function getDailyShenlunQuestions(date = '2026-03-26') {
  const mapped = DAILY_SHENLUN_POOL[date]
  if (!mapped) {
    return getShenlunQuestions('summary', 1)
  }

  const question = SHENLUN_QUESTIONS.find((item) => item.id === mapped.questionId)
  return clone(question ? [question] : getShenlunQuestions(mapped.type, 1))
}

export function getShenlunQuestionById(id) {
  return clone(SHENLUN_QUESTIONS.find((item) => item.id === id) || null)
}

export function getQuestionTypeNames() {
  return clone(QUESTION_TYPE_NAMES)
}
