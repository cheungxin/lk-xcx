const clone = (value) => JSON.parse(JSON.stringify(value))

const ENTRY_BANK = {
  summary: [
    {
      category: '答题框架',
      title: '概括归纳三步法',
      content:
        '先找问题、现状、原因等核心句，再归并同类信息，最后改写成简洁名词短语，按“一是、二是、三是”分点呈现。',
      example: '例如：一是基础设施薄弱；二是专业人才短缺；三是制度保障不足。',
      tags: ['框架', '概括归纳'],
    },
    {
      category: '高频词汇',
      title: '问题类高频表达',
      content:
        '可使用“短板、瓶颈、弱项、梗阻、失衡、碎片化、协同不足、供需错配”等词汇增强概括感。',
      example: '',
      tags: ['词汇', '高频'],
    },
    {
      category: '高频词汇',
      title: '成效类常用表达',
      content:
        '可使用“取得积极成效、持续向好、稳步提升、有效拓展、显著改善、不断优化”等表述总结积极变化。',
      example: '',
      tags: ['词汇', '成效'],
    },
    {
      category: '作答提醒',
      title: '概括题常见失分点',
      content:
        '避免照抄材料原句、避免夹杂评价、避免把原因和对策混写，确保每一点都围绕题干要求作答。',
      example: '',
      tags: ['提醒', '避坑'],
    },
    {
      category: '结构模板',
      title: '问题概括模板',
      content:
        '当前……主要存在以下问题：一是……；二是……；三是……。究其原因，在于……',
      example: '',
      tags: ['模板', '通用'],
    },
  ],
  countermeasure: [
    {
      category: '答题框架',
      title: '对策题四要素',
      content:
        '写对策时要同时说明“谁来做、做什么、怎么做、做到什么程度”，确保措施具体可执行。',
      example: '如：由街道牵头建立联席机制，按月会商，推动问题闭环解决。',
      tags: ['框架', '对策'],
    },
    {
      category: '句式模板',
      title: '制度机制类表达',
      content:
        '常用句式包括“建立健全……机制”“完善……制度体系”“压实……责任链条”“形成……工作闭环”。',
      example: '',
      tags: ['句式', '制度'],
    },
    {
      category: '句式模板',
      title: '资源保障类表达',
      content:
        '常用句式包括“加大资金投入”“强化要素保障”“优化资源配置”“推动资源向基层下沉”。',
      example: '',
      tags: ['句式', '资源'],
    },
    {
      category: '作答提醒',
      title: '对策题避空泛技巧',
      content:
        '少写“加强重视”，多写“建立台账、明确时限、细化流程、引入第三方评估”等具体动作。',
      example: '',
      tags: ['提醒', '实操'],
    },
    {
      category: '结构模板',
      title: '问题对应式模板',
      content:
        '针对……问题，应……；针对……短板，应……；针对……堵点，应……；最终形成……合力。',
      example: '',
      tags: ['模板', '对应'],
    },
  ],
  analysis: [
    {
      category: '答题框架',
      title: '综合分析三段式',
      content:
        '先表明态度，再从积极意义、现实问题、原因影响等角度展开分析，最后提出方向性建议。',
      example: '',
      tags: ['框架', '综合分析'],
    },
    {
      category: '辩证表达',
      title: '一分为二表达模板',
      content:
        '既要看到……带来的积极变化，也要看到……背后的隐患与风险；既不能简单否定，也不能盲目乐观。',
      example: '',
      tags: ['辩证', '表达'],
    },
    {
      category: '原因分析',
      title: '原因展开方式',
      content:
        '可从思想观念、制度设计、资源配置、技术条件、执行落实、群众需求等层面分析成因。',
      example: '',
      tags: ['分析', '原因'],
    },
    {
      category: '作答提醒',
      title: '分析题常见问题',
      content:
        '避免只表态不分析，避免只罗列材料，避免建议部分过长、喧宾夺主，应始终围绕“怎么看”展开。',
      example: '',
      tags: ['提醒', '避坑'],
    },
    {
      category: '结构模板',
      title: '现象分析模板',
      content:
        '这一现象的出现有其现实背景和积极价值，但也暴露出……问题。对此，应坚持……导向，推动……规范发展。',
      example: '',
      tags: ['模板', '现象'],
    },
  ],
  execution: [
    {
      category: '公文格式',
      title: '通知常用结构',
      content:
        '标题写“关于……的通知”，正文一般包括目的依据、具体事项、工作要求三部分，结尾可用“请认真贯彻执行”。',
      example: '',
      tags: ['公文', '通知'],
    },
    {
      category: '公文格式',
      title: '实施方案常用结构',
      content:
        '通常包含工作目标、重点任务、时间安排、责任分工、保障措施五部分，逻辑上要先总后分。',
      example: '',
      tags: ['公文', '方案'],
    },
    {
      category: '语言规范',
      title: '公文写作常用词',
      content:
        '可使用“现将有关事项通知如下”“请结合实际抓好落实”“特此报告”“以上方案，妥否，请审定”等规范表达。',
      example: '',
      tags: ['公文', '规范'],
    },
    {
      category: '作答提醒',
      title: '贯彻执行题注意事项',
      content:
        '要紧扣身份和场景写作，不能把通知写成议论文，也不能忽略对象、语气、落款等格式要求。',
      example: '',
      tags: ['提醒', '格式'],
    },
    {
      category: '结构模板',
      title: '倡议书模板',
      content:
        '一般包括背景缘由、倡议事项、号召结语三部分，语言应真诚有感染力，兼顾可操作性。',
      example: '',
      tags: ['模板', '倡议书'],
    },
  ],
  essay: [
    {
      category: '结构框架',
      title: '议论文五段式',
      content:
        '开头点题亮观点，中间三段分论点展开论证，结尾总结升华回扣主题，是最稳妥的大作文结构。',
      example: '',
      tags: ['大作文', '结构'],
    },
    {
      category: '论点提炼',
      title: '分论点写法',
      content:
        '分论点最好做到“观点句+价值判断”，例如“创新驱动，是塑造产业优势的关键引擎”。',
      example: '',
      tags: ['大作文', '分论点'],
    },
    {
      category: '论证技巧',
      title: '案例论证使用方法',
      content:
        '案例要服务观点，写法上可采用“案例现象+价值提炼+回扣论点”的三步结构，避免堆砌素材。',
      example: '',
      tags: ['论证', '案例'],
    },
    {
      category: '语言表达',
      title: '开头结尾升华模板',
      content:
        '开头可用现实背景切题，结尾可用“唯有……，方能……”进行价值升华，增强文章完整度。',
      example: '',
      tags: ['表达', '升华'],
    },
    {
      category: '作答提醒',
      title: '大作文常见失分点',
      content:
        '避免标题空泛、分论点重复、材料照抄和结构失衡，尤其要避免论据多而论证少。',
      example: '',
      tags: ['提醒', '避坑'],
    },
  ],
}

const EXPRESSIONS = Object.keys(ENTRY_BANK).reduce((result, typeKey, typeIndex) => {
  ENTRY_BANK[typeKey].forEach((item, index) => {
    const id = `exp-${typeKey}-${String(typeIndex * 5 + index + 1).padStart(3, '0')}`
    result.push({
      id,
      type: typeKey,
      category: item.category,
      title: item.title,
      content: item.content,
      example: item.example,
      tags: item.tags,
    })
  })
  return result
}, [])

export function getExpressions(type = '') {
  if (!type) {
    return clone(EXPRESSIONS)
  }
  return clone(EXPRESSIONS.filter((item) => item.type === type))
}

export function searchExpressions(keyword = '') {
  const kw = keyword.trim().toLowerCase()
  if (!kw) {
    return clone(EXPRESSIONS)
  }

  return clone(
    EXPRESSIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.content.toLowerCase().includes(kw) ||
        item.tags.some((tag) => tag.toLowerCase().includes(kw)),
    ),
  )
}
