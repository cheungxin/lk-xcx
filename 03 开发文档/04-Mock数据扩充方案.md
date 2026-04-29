# Mock 数据扩充方案

> 本文档面向 AI 执行，列出项目需要新建或扩充的所有 Mock 数据文件，以及每个文件的完整数据结构和内容示例。

---

## 总览

| 文件路径 | 状态 | 说明 |
|---------|------|------|
| `mock/questions.js` | 已完成 | 已补充到 30 道行测题，并完善知识点树子分类 |
| `mock/papers.js` | 已完成 | 已补充完整试卷 sections + 题目，支持考场模式选卷 |
| `mock/daily.js` | 已完成 | 已补充每日一练题目池 + 历史打卡记录 |
| `mock/shenlun.js` | 已完成 | 已补充 5 种题型 × 5 道题的申论题库 |
| `mock/hotspot.js` | 已完成 | 已补充 10 条热点素材 |
| `mock/expression.js` | 已完成 | 已补充 5 种题型 × 5 条规范表述 |
| `mock/records.js` | 已完成 | 已补充练习记录 Mock 数据 |
| `mock/wrong.js` | 已完成 | 已补充错题本 Mock 数据 |

---

## 文件一：`mock/questions.js` 扩充

### 扩充目标

- 当前只有 3 道题（q001/q002/q003）
- 扩充到至少 **30 道题**（6大类 × 5题）
- 增加子分类字段，完善知识点树的子节点数据

### 行测六大类知识点树扩充

在 `PRACTICE_CATEGORY_TREE.xingce` 中，补充每个一级分类的子节点：

```javascript
// 政治理论
{ id: 'politics', name: '政治理论', children: [
  { id: 'marxism', name: '马克思主义哲学', answered: 0, total: 80 },
  { id: 'mao', name: '毛泽东思想', answered: 0, total: 60 },
  { id: 'xi', name: '习近平新时代中国特色社会主义思想', answered: 0, total: 86 },
]}

// 言语理解与表达
{ id: 'verbal', name: '言语理解与表达', children: [
  { id: 'verbal-fill', name: '逻辑填空', answered: 0, total: 3240 },
  { id: 'verbal-read', name: '阅读理解', answered: 0, total: 2800 },
  { id: 'verbal-express', name: '语句表达', answered: 0, total: 1850 },
  { id: 'verbal-understand', name: '语义理解', answered: 0, total: 1460 },
  { id: 'verbal-read2', name: '文章阅读', answered: 0, total: 2000 },
]}

// 数量关系
{ id: 'math', name: '数量关系', children: [
  { id: 'math-number', name: '数字推理', answered: 0, total: 480 },
  { id: 'math-calc', name: '数学运算', answered: 0, total: 5295 },
]}

// 判断推理
{ id: 'logic', name: '判断推理', children: [
  { id: 'logic-figure', name: '图形推理', answered: 0, total: 2800 },
  { id: 'logic-definition', name: '定义判断', answered: 0, total: 2640 },
  { id: 'logic-analogy', name: '类比推理', answered: 0, total: 1800 },
  { id: 'logic-deduce', name: '逻辑判断', answered: 0, total: 5288 },
]}

// 资料分析
{ id: 'data', name: '资料分析', children: [
  { id: 'data-text', name: '文字资料', answered: 0, total: 1500 },
  { id: 'data-table', name: '表格资料', answered: 0, total: 1800 },
  { id: 'data-chart', name: '图表资料', answered: 0, total: 1960 },
  { id: 'data-mixed', name: '综合资料', answered: 0, total: 1552 },
]}
```

### 扩充题目内容（增加 27 道题，共 30 道）

```javascript
// 以下为新增题目示例（需补充完整内容）

// 言语理解 - 逻辑填空（5题）
{
  questionId: 'q004',
  type: 'single',
  category: '言语理解与表达',
  subCategory: '逻辑填空',
  difficulty: 'easy',
  content: '以下例子省略，实际开发时补充5道题...',
  options: [...],
  answer: 'B',
  analysis: '...',
  knowledge: ['逻辑填空', '词语辨析'],
  year: 2024,
  source: '国考行测',
},

// 判断推理 - 定义判断（5题）
{
  questionId: 'q009',
  type: 'single',
  category: '判断推理',
  subCategory: '定义判断',
  difficulty: 'medium',
  content: '...',
  options: [...],
  answer: 'C',
  analysis: '...',
  knowledge: ['定义判断'],
  year: 2025,
  source: '省考行测',
},

// 数量关系（5题）
// 资料分析（5题）
// 常识判断（5题）
// 政治理论（4题，已有 q003）
```

### 扩充函数

```javascript
// 在 mock/questions.js 末尾新增：

export function getQuestionsByFocus(subject, focusId, count = 20) {
  // 根据 focus id 筛选对应题目
  const subCategoryMap = {
    'verbal-fill': '逻辑填空',
    'verbal-read': '阅读理解',
    'logic-figure': '图形推理',
    'logic-definition': '定义判断',
    'logic-analogy': '类比推理',
    'logic-deduce': '逻辑判断',
    'math-calc': '数学运算',
    'data-text': '文字资料',
    // ...
  }
  
  const categoryMap = {
    'verbal': '言语理解与表达',
    'logic': '判断推理',
    'math': '数量关系',
    'data': '资料分析',
    'common': '常识判断',
    'politics': '政治理论',
  }
  
  const subCategory = subCategoryMap[focusId]
  const category = categoryMap[focusId] || Object.entries(categoryMap).find(([k]) => focusId.startsWith(k))?.[1]
  
  let filtered = QUESTIONS
  if (subCategory) {
    filtered = filtered.filter(q => q.subCategory === subCategory)
  } else if (category) {
    filtered = filtered.filter(q => q.category === category)
  }
  
  // 若题目不足，循环补充（Mock 数据有限时的处理）
  const result = []
  for (let i = 0; i < count; i++) {
    result.push({ ...filtered[i % filtered.length], questionId: `${filtered[i % filtered.length].questionId}_${i}` })
  }
  return clone(result.slice(0, count))
}
```

---

## 文件二：`mock/papers.js` 扩充

### 扩充目标

- 当前 `PAPERS` 只有 4 条元数据（无题目）
- 考场模式的「全套考试」选卷后需要真实题目加载
- 扩充 `FULL_EXAM_PAPERS` 中的每套试卷，加入完整 `sections` + 题目

### 扩充完整试卷数据

```javascript
// 在现有 FULL_EXAM_PAPERS 基础上，给每套试卷加 sections 字段：

const FULL_EXAM_PAPERS = [
  {
    id: 'full-1',
    title: '2026年国家公务员录用考试《行测》题（副省级网友回忆版）',
    questionCount: 20,   // Mock 阶段用20题代替真实135题
    duration: 30,         // Mock 阶段用30分钟
    sections: [
      {
        name: '常识判断',
        questions: [
          // 5道常识题（从 QUESTIONS 中取或新增）
          { id: 'fp1-001', type: '单选题', stem: '...', options: [...], correctAnswer: 'B', explanation: '...' },
          // ...共5道
        ],
      },
      {
        name: '言语理解与表达',
        questions: [
          // 5道言语题
        ],
      },
      {
        name: '判断推理',
        questions: [
          // 5道判断推理题
        ],
      },
      {
        name: '数量关系',
        questions: [
          // 3道数量题
        ],
      },
      {
        name: '资料分析',
        questions: [
          // 2道资料题
        ],
      },
    ],
  },
  // full-2, full-3 类似结构，题目可以与 full-1 有所不同
]

// 修改 getExamModePapers 函数，返回包含 sections 的完整数据
export function getExamModePapers(mode = 'full') {
  if (mode === 'full') {
    return clone(FULL_EXAM_PAPERS)
  }
  return []
}

// 新增：根据 id 获取完整试卷（含题目）
export function getFullExamPaperById(id) {
  return clone(FULL_EXAM_PAPERS.find(p => p.id === id) || null)
}
```

---

## 文件三：`mock/daily.js`（新建）

```javascript
const clone = (v) => JSON.parse(JSON.stringify(v))

// 每日一练题目池（按日期固定出5道题）
// 注：实际生产环境由后端按日期下发，此处 Mock 固定

const DAILY_QUESTION_POOL = {
  '2026-03-25': [
    {
      id: 'dq-20260325-1',
      type: '单选题',
      category: '常识判断',
      subCategory: '政治常识',
      difficulty: 'medium',
      stem: '2025年全国两会批准的"十五五"规划的总体要求中，强调的核心发展理念是：',
      options: [
        { id: 'A', text: '创新、协调、绿色、开放、共享' },
        { id: 'B', text: '科技、数字、绿色、开放、共享' },
        { id: 'C', text: '创新、数字、低碳、开放、安全' },
        { id: 'D', text: '科技、协调、绿色、安全、共享' },
      ],
      correctAnswer: 'A',
      explanation: '新发展理念包括：创新、协调、绿色、开放、共享，这是党的十八届五中全会提出的，贯穿整个规划体系。',
      knowledgePoint: '常识判断 > 政治常识',
    },
    {
      id: 'dq-20260325-2',
      type: '单选题',
      category: '言语理解与表达',
      subCategory: '逻辑填空',
      difficulty: 'medium',
      stem: '科技创新是______现代化产业体系的______支撑。依次填入横线部分最恰当的一项是：',
      options: [
        { id: 'A', text: '构建 / 核心' },
        { id: 'B', text: '打造 / 重要' },
        { id: 'C', text: '建立 / 关键' },
        { id: 'D', text: '构建 / 重要' },
      ],
      correctAnswer: 'D',
      explanation: '"构建现代化产业体系"是官方固定表述；"重要支撑"比"核心支撑""关键支撑"更常见于相关政策文本。',
      knowledgePoint: '言语理解 > 逻辑填空',
    },
    {
      id: 'dq-20260325-3',
      type: '单选题',
      category: '判断推理',
      subCategory: '图形推理',
      difficulty: 'easy',
      stem: '下图中，每行图形遵循某种规律，问号处应填入哪个选项？（图形递增规律）',
      options: [
        { id: 'A', text: '选项A图形' },
        { id: 'B', text: '选项B图形' },
        { id: 'C', text: '选项C图形' },
        { id: 'D', text: '选项D图形' },
      ],
      correctAnswer: 'B',
      explanation: '每行图形中，内部元素数量依次增加1个，第三行第三列应为4个元素，选B。',
      knowledgePoint: '判断推理 > 图形推理',
    },
    {
      id: 'dq-20260325-4',
      type: 'single',
      category: '数量关系',
      subCategory: '数学运算',
      difficulty: 'hard',
      stem: '某单位组织团建活动，共有员工60人，男女比例为2:1。若安排每桌6人，男女比例均匀搭配（每桌男女相等），则需要多少桌？',
      options: [
        { id: 'A', text: '8桌' },
        { id: 'B', text: '10桌' },
        { id: 'C', text: '12桌' },
        { id: 'D', text: '15桌' },
      ],
      correctAnswer: 'B',
      explanation: '总人数60人，男女比2:1，则男40人、女20人。每桌6人且男女相等（各3人），则可以安排 20÷3 ≈ 6.7，不整除，改为每桌男女比2:1，每桌2女4男，共需 20÷2=10桌。',
      knowledgePoint: '数量关系 > 数学运算',
    },
    {
      id: 'dq-20260325-5',
      type: '单选题',
      category: '资料分析',
      subCategory: '文字资料',
      difficulty: 'medium',
      stem: '2024年某省GDP为5.2万亿元，同比增长6.1%，则2023年该省GDP约为：',
      options: [
        { id: 'A', text: '4.85万亿元' },
        { id: 'B', text: '4.90万亿元' },
        { id: 'C', text: '4.96万亿元' },
        { id: 'D', text: '4.99万亿元' },
      ],
      correctAnswer: 'B',
      explanation: '2023年GDP = 5.2 ÷ (1+6.1%) = 5.2 ÷ 1.061 ≈ 4.90万亿元。',
      knowledgePoint: '资料分析 > 增长率计算',
    },
  ],
  '2026-03-24': [
    // 3月24日的5道题（类似结构，此处省略，实际需补充）
  ],
}

// 每日一练打卡历史（初始 Mock 数据，供日历页展示）
const DAILY_RECORDS_MOCK = {
  '2026-03-24': { done: true, correct: 4, total: 5, accuracy: 80, duration: '8分钟' },
  '2026-03-23': { done: true, correct: 3, total: 5, accuracy: 60, duration: '10分钟' },
  '2026-03-22': { done: false },
  '2026-03-21': { done: true, correct: 5, total: 5, accuracy: 100, duration: '6分钟' },
  '2026-03-20': { done: true, correct: 4, total: 5, accuracy: 80, duration: '9分钟' },
  '2026-03-19': { done: true, correct: 2, total: 5, accuracy: 40, duration: '12分钟' },
  '2026-03-18': { done: false },
  '2026-03-17': { done: true, correct: 4, total: 5, accuracy: 80, duration: '7分钟' },
  '2026-03-16': { done: true, correct: 3, total: 5, accuracy: 60, duration: '11分钟' },
  '2026-03-15': { done: true, correct: 5, total: 5, accuracy: 100, duration: '5分钟' },
}

export function getDailyQuestions(date) {
  return clone(DAILY_QUESTION_POOL[date] || DAILY_QUESTION_POOL['2026-03-25'])
}

export function getDailyRecordsMock() {
  return clone(DAILY_RECORDS_MOCK)
}

export function hasDailyQuestions(date) {
  return !!DAILY_QUESTION_POOL[date]
}
```

---

## 文件四：`mock/shenlun.js`（新建）

```javascript
const clone = (v) => JSON.parse(JSON.stringify(v))

const QUESTION_TYPE_NAMES = {
  summary: '概括归纳',
  countermeasure: '提出对策',
  analysis: '综合分析',
  execution: '贯彻执行',
  essay: '申发论述',
}

const SHENLUN_QUESTIONS = [
  // ===== 概括归纳（5道）=====
  {
    id: 'sq001',
    type: 'summary',
    year: 2025,
    source: '国考申论（省级以上）',
    title: '2025年国考申论（省级）第一题',
    materialTitle: '关于数字经济高质量发展的调研报告',
    material: `【材料一】
数字经济是以数字化的知识和信息作为关键生产要素、以现代信息网络作为重要载体、以信息通信技术的有效使用作为效率提升和经济结构优化的重要推动力的一系列经济活动。近年来，我国数字经济规模持续扩大，2024年数字经济核心产业增加值占GDP比重超过10%。然而，数字经济发展仍面临诸多挑战：

一是区域发展不平衡。东部沿海省份数字经济体量占全国70%以上，中西部地区数字基础设施建设滞后，农村地区宽带覆盖率与城市相比差距明显。

二是数据安全与隐私保护压力持续增大。近年来数据泄露事件时有发生，个人信息被非法收集、利用的现象屡见不鲜。

三是核心技术受制于人。在芯片、操作系统、工业软件等核心领域，我国与发达国家相比仍有较大差距，"卡脖子"问题突出。

四是平台经济监管有待完善。部分头部互联网企业形成垄断，不利于公平竞争，中小企业创新空间受限。`,
    question: '根据给定资料，概括我国数字经济发展面临的主要问题。\n\n要求：全面准确，条理清晰，不超过200字。',
    wordLimit: 200,
    difficulty: 'medium',
    referenceAnswer: `我国数字经济发展面临以下主要问题：一、区域发展不平衡，东西部差距明显，农村数字基础设施薄弱；二、数据安全形势严峻，个人信息泄露和非法使用问题突出；三、核心技术受制于人，芯片、操作系统等关键领域存在"卡脖子"短板；四、平台经济监管不完善，头部企业垄断抑制公平竞争，中小企业创新空间受限。`,
    scoringPoints: [
      '区域发展不平衡（3分）',
      '数据安全问题（3分）',
      '核心技术短板（4分）',
      '平台监管不足（4分）',
      '表达清晰，条理分明（6分）',
    ],
    tags: ['数字经济', '问题概括', '2025'],
  },
  // sq002 ~ sq005：概括归纳，其余4题（结构相同，内容不同）

  // ===== 提出对策（5道）=====
  {
    id: 'sq006',
    type: 'countermeasure',
    year: 2024,
    source: '省考申论（A卷）',
    title: '2024年省考申论第二题',
    materialTitle: '关于老龄化社会养老服务体系建设的调研',
    material: `【材料二】
随着我国老龄化进程加快，2025年60岁以上老年人口突破3亿，占总人口比例超过21%。当前养老服务面临供需矛盾突出、专业人才短缺、服务质量参差不齐等问题。

调查显示，农村地区养老机构床位严重不足，每千名老人床位数不到20张，远低于城市的35张。养老护理员流失率高达30%，从业人员平均年龄偏大，专业技能培训不足。部分民营养老机构存在虚假宣传、服务缩水等问题，监管难度较大。

与此同时，"互联网+养老"模式在发达地区逐步推广，智慧养老平台通过整合家政、医疗、餐饮等资源，有效提升了居家养老服务的覆盖面和质量。`,
    question: '请结合给定资料，提出改善我国养老服务体系的具体对策。\n\n要求：问题导向，对策具体可行，不超过350字。',
    wordLimit: 350,
    difficulty: 'hard',
    referenceAnswer: `针对当前养老服务体系存在的问题，提出以下对策：

一、补齐农村养老设施短板。加大财政投入，支持农村地区新建、改扩建养老机构，鼓励闲置学校、医院等公共设施转型为养老服务场所，提升农村千人床位配置比例。

二、加强养老人才队伍建设。将养老护理专业纳入职业教育支持体系，提供定向奖学金；建立养老从业人员薪酬保障机制和职业晋升通道，降低人才流失率。

三、强化行业监管，规范服务质量。建立养老机构信用评价体系，推行"黑名单"制度；推广服务质量第三方评估，强化违规机构的处罚力度。

四、推进智慧养老模式推广。政府搭建区域性智慧养老平台，整合医疗、家政、餐饮资源，推动居家社区养老向数字化、标准化转型，扩大惠及面。`,
    scoringPoints: [
      '设施补充对策（4分）',
      '人才培养对策（4分）',
      '监管对策（4分）',
      '智慧养老对策（4分）',
      '表达规范，逻辑清晰（4分）',
    ],
    tags: ['养老', '对策', '2024'],
  },
  // sq007 ~ sq010：提出对策，其余4题

  // ===== 综合分析（5道）=====
  {
    id: 'sq011',
    type: 'analysis',
    year: 2025,
    source: '国考申论（地市级）',
    title: '2025年国考申论（地市）第三题',
    materialTitle: '关于"躺平"现象的讨论',
    material: `【材料三】
网络上流行的"躺平"一词，最初指年轻人面对高压竞争选择降低欲望、减少消费的生活态度。一些人认为，"躺平"是年轻人对内卷文化的理性反思，体现了对生命质量的重新审视；另一些人则批评"躺平"是消极避世，不利于社会进步和个人发展。

某研究机构调查显示，表达"躺平"意愿的青年群体中，75%实际上仍在努力工作学习，只是希望减少无谓内耗；而真正"完全放弃奋斗"的仅占5%。大多数"躺平"话语的背后，是对教育、就业、住房等压力的真实表达。`,
    question: '根据给定资料，谈谈你对"躺平"现象的综合分析。\n\n要求：观点明确，分析全面辩证，不超过400字。',
    wordLimit: 400,
    difficulty: 'hard',
    referenceAnswer: `"躺平"现象是社会压力下的多元化表达，需辩证看待。

从现象本质看，绝大多数"躺平"并非真正放弃，而是对高强度竞争和无效内耗的抵触，反映出年轻人对生活节奏和人生价值的重新思考，具有一定的积极意义。

从社会根源看，"躺平"折射出当前教育内卷、就业压力大、房价高企等现实困境，是结构性问题在个体层面的投射，不能简单归咎为年轻人的懒惰或缺乏进取心。

从潜在风险看，若"躺平"演变为真正的消极主义，将影响个人成长和社会活力，长期来看不利于创新与发展。

因此，应从社会层面入手：一是完善就业保障，降低竞争内耗成本；二是引导形成多元成功观，破除"唯分数、唯名校"的单一评价体系；三是加强心理健康支持，帮助年轻人以积极心态应对现实挑战。`,
    scoringPoints: [
      '现象本质分析（5分）',
      '社会根源分析（5分）',
      '潜在风险分析（4分）',
      '解决方向（6分）',
    ],
    tags: ['社会现象', '综合分析', '年轻人'],
  },
  // sq012 ~ sq015：综合分析，其余4题

  // ===== 贯彻执行（5道）=====
  {
    id: 'sq016',
    type: 'execution',
    year: 2024,
    source: '省考申论（B卷）',
    title: '2024年省考申论贯彻执行题',
    materialTitle: '关于开展节约粮食宣传活动的背景材料',
    material: `【材料四】
某市决定开展"光盘行动 2.0"系列宣传活动，重点针对餐饮企业、学校食堂、机关食堂三类场所。市文明办要求各区县制定详细方案，并于本月20日前上报实施计划。计划内容需包括：活动目标、具体措施、时间安排、责任分工、预期效果。

要求：以某区文明办名义，撰写一份向市文明办上报的《关于开展"光盘行动 2.0"系列活动的实施计划》，内容完整，格式规范，字数600-800字。`,
    question: '请根据给定材料，完成上述公文写作任务。\n\n要求：格式正确，内容具体，逻辑清晰，字数600-800字。',
    wordLimit: 800,
    difficulty: 'medium',
    referenceAnswer: `关于开展"光盘行动2.0"系列活动的实施计划

市文明办：

为深入贯彻落实厉行节约、反对浪费的精神，扎实推进"光盘行动2.0"系列宣传活动，现将我区实施计划上报如下。

一、活动目标
通过多形式宣传引导，力争辖区内餐饮企业、学校食堂和机关食堂的餐饮浪费现象较上年度下降30%，文明用餐意识显著增强。

二、具体措施
（一）餐饮企业：推行"小份菜""半份菜"标准化服务，设置"光盘打卡"积分奖励，引导消费者适量点餐。
（二）学校食堂：组织学生开展"舌尖上的浪费"主题教育，设立"光盘之星"评选活动，将文明用餐纳入学生行为规范考核。
（三）机关食堂：制定用餐公示制度，干部带头示范，每周公布光盘情况，对浪费行为予以通报批评。

三、时间安排
本月25日前：完成宣传物料制作及各场所动员部署；
下月1日至15日：开展集中宣传活动；
下月底：对活动效果进行总结评估。

四、责任分工
区文明办负责统筹协调；区市场监管局负责餐饮企业指导；区教育局负责学校食堂；区机关事务局负责机关食堂。

五、预期效果
通过本次活动，预计参与市民超过5万人次，有效提升全区文明用餐水平，树立节约光荣的社会风气。

特此报告，请审阅。

某区文明办
2026年3月25日`,
    scoringPoints: [
      '公文格式规范（5分）',
      '活动目标明确（4分）',
      '三类场所措施具体（9分）',
      '时间安排合理（4分）',
      '责任分工清晰（3分）',
      '语言流畅规范（5分）',
    ],
    tags: ['公文写作', '实施计划', '贯彻执行'],
  },
  // sq017 ~ sq020：贯彻执行，其余4题

  // ===== 申发论述（5道）=====
  {
    id: 'sq021',
    type: 'essay',
    year: 2025,
    source: '国考申论（省级以上）',
    title: '2025年国考申论大作文',
    materialTitle: '关于新质生产力与高质量发展的系列材料',
    material: `【材料五】
习近平总书记指出，新质生产力是创新起主导作用，摆脱传统经济增长方式、生产力发展路径，具有高科技、高效能、高质量特征，符合新发展理念的先进生产力质态。

材料中列举了多个省份发展新质生产力的典型案例：深圳依托科技创新，新能源汽车产业规模全国领先；安徽依托量子科技、人工智能等前沿技术，实现弯道超车；云南利用丰富的绿色能源资源，大力发展绿色铝、绿色硅等绿色低碳产业，走出了具有自身特色的新质生产力发展之路。`,
    question: '请以"因地制宜发展新质生产力"为主题，写一篇议论文。\n\n要求：主题明确，论点突出，论据充分，语言流畅，800-1000字。',
    wordLimit: 1000,
    difficulty: 'hard',
    referenceAnswer: `（大作文参考范文，800-1000字）

因地制宜，方能点石成金

新质生产力是推动高质量发展的重要引擎。然而，各地资源禀赋、产业基础、创新能力各有不同，唯有因地制宜、精准施策，才能让新质生产力的种子在最适合的土壤中生根发芽。

因地制宜，是尊重客观规律的必然选择。...

（完整范文此处省略，实际需补充完整800字内容）`,
    scoringPoints: [
      '标题提炼准确（5分）',
      '开篇点题，论点明确（10分）',
      '论据丰富，逻辑严密（15分）',
      '结构完整，过渡自然（10分）',
      '语言表达规范生动（10分）',
    ],
    tags: ['新质生产力', '议论文', '2025'],
  },
  // sq022 ~ sq025：申发论述，其余4题
]

// 每日一练申论题池（按日期映射）
const DAILY_SHENLUN_POOL = {
  '2026-03-25': { questionId: 'sq001', type: 'summary' },
  '2026-03-24': { questionId: 'sq006', type: 'countermeasure' },
  '2026-03-23': { questionId: 'sq011', type: 'analysis' },
  '2026-03-22': { questionId: 'sq016', type: 'execution' },
  '2026-03-21': { questionId: 'sq002', type: 'summary' },
}

export function getShenlunQuestions(type, count = 3) {
  const filtered = SHENLUN_QUESTIONS.filter(q => q.type === type)
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(filtered[i % filtered.length])
  }
  return clone(result)
}

export function getDailyShenlunQuestions(date) {
  const pool = DAILY_SHENLUN_POOL[date]
  if (!pool) return getShenlunQuestions('summary', 1)
  const q = SHENLUN_QUESTIONS.find(q => q.id === pool.questionId)
  return clone(q ? [q] : getShenlunQuestions(pool.type, 1))
}

export function getShenlunQuestionById(id) {
  return clone(SHENLUN_QUESTIONS.find(q => q.id === id) || null)
}

export function getQuestionTypeNames() {
  return { ...QUESTION_TYPE_NAMES }
}
```

---

## 文件五：`mock/hotspot.js`（新建）

```javascript
const clone = (v) => JSON.parse(JSON.stringify(v))

const HOTSPOTS = [
  {
    id: 'hs-001',
    tag: '时政',
    title: '人工智能与新质生产力',
    date: '2026-03',
    isHot: true,
    summary: '人工智能是新质生产力的核心驱动力，如何在发展中规范、在规范中发展，成为各方关注焦点。',
    background: `近年来，ChatGPT、Sora等人工智能应用的爆发式增长，引发全球新一轮科技竞赛。我国陆续出台《生成式人工智能服务管理暂行办法》等政策法规，明确"发展与安全并重"的基本原则。

在产业应用层面，AI在医疗影像、智能制造、金融风控等领域快速落地，有效提升了生产效率。然而，数据安全、算法偏见、就业替代等风险也随之而来，如何建立科学完善的AI治理体系，成为摆在政府和社会面前的重要课题。`,
    keyPoints: [
      '人工智能是新质生产力的重要组成部分，需大力发展',
      '坚持"发展与安全并重"，在规范中促进健康发展',
      '加强AI伦理研究，防范算法歧视和数据滥用',
      '关注AI对就业结构的影响，完善社会保障体系',
    ],
    quotations: [
      {
        source: '习近平总书记',
        text: '要加快发展新质生产力，扎实推进高质量发展。',
      },
    ],
    relatedTopics: [
      '请结合材料，分析人工智能发展对就业市场带来的机遇与挑战，并提出应对建议。',
    ],
  },
  {
    id: 'hs-002',
    tag: '经济',
    title: '乡村振兴与共同富裕',
    date: '2026-02',
    isHot: true,
    summary: '推进农业农村现代化，缩小城乡差距，是实现共同富裕的重要路径。',
    background: `脱贫攻坚取得全面胜利后，乡村振兴成为"三农"工作的重心。当前，部分农村地区面临空心化、老龄化、产业空洞化等问题。各地积极探索"一村一品"特色产业、电商助农、文旅融合等模式，涌现出一批振兴典型。

然而，振兴成效仍参差不齐。人才回流难、资金投入不足、农产品品牌化程度低等问题制约了部分地区的发展。如何打通从"输血"到"造血"的转变，是下一阶段乡村振兴的核心任务。`,
    keyPoints: [
      '以产业振兴为核心，发展特色农业、乡村文旅等新业态',
      '人才是乡村振兴的关键，需完善人才引进和留用机制',
      '强化基层治理，发挥村民自治和村集体经济作用',
      '科技赋能农业，推广数字农业、智慧农业',
    ],
    quotations: [],
    relatedTopics: [
      '请根据给定材料，提出推进乡村产业振兴的具体对策。',
    ],
  },
  // hs-003 ~ hs-010：其余8条热点
]

export function getHotspots(tag = '') {
  if (!tag || tag === '推荐') return clone(HOTSPOTS)
  return clone(HOTSPOTS.filter(h => h.tag === tag || h.isHot))
}

export function getHotspotById(id) {
  return clone(HOTSPOTS.find(h => h.id === id) || null)
}
```

---

## 文件六：`mock/expression.js`（新建）

```javascript
const clone = (v) => JSON.parse(JSON.stringify(v))

const EXPRESSIONS = [
  // ===== 概括归纳 =====
  {
    id: 'exp-s-001',
    type: 'summary',
    category: '答题框架',
    title: '概括归纳万能框架',
    content: `第一步：通读全文，勾画关键句（原因、现状、问题、影响等）
第二步：提炼要点，按逻辑关系（并列/总分）归类
第三步：压缩语言，用"名词短语"表述，避免长句

常见结构：
• 问题概括：一是……；二是……；三是……
• 原因分析：主要体现在：（一）……；（二）……；（三）……`,
    example: '【示例】材料反映了当前我国农村养老服务存在以下问题：一是基础设施薄弱，床位严重不足；二是专业人才缺乏，服务质量低下；三是政策保障不到位，资金投入有限。',
    tags: ['框架', '通用', '必背'],
  },
  {
    id: 'exp-s-002',
    type: 'summary',
    category: '常用词汇',
    title: '概括归纳高频词汇',
    content: `问题类：制约、瓶颈、不足、缺失、滞后、薄弱、短板、失衡
成效类：成效显著、成果丰硕、有力推动、稳步提升
原因类：根源在于、深层原因、究其原因、主要制约因素
影响类：严重影响、制约发展、导致……恶化、不利于……`,
    example: '',
    tags: ['词汇', '常用'],
  },
  // exp-s-003 ~ exp-s-005：概括归纳其余3条

  // ===== 提出对策 =====
  {
    id: 'exp-c-001',
    type: 'countermeasure',
    category: '答题框架',
    title: '对策答题四步法',
    content: `一、针对"问题"提"对策"（一一对应原则）
二、主体要明确：政府（哪级政府）/企业/个人
三、措施要具体："制定……制度""加大……投入""建立……机制"
四、结尾可升华：形成……合力，推动……高质量发展

对策句式模板：
• 加强/完善/建立 + 制度/机制/体系
• 加大 + 财政投入/政策支持/宣传力度  
• 发挥 + 主体 + 作用，推动 + 目标实现`,
    example: '【示例】针对人才流失问题：建立健全激励机制，提高基层人员薪酬待遇，畅通职业晋升通道，营造干事创业的良好环境。',
    tags: ['框架', '对策', '必背'],
  },
  // exp-c-002 ~ exp-c-005：提出对策其余4条

  // ===== 综合分析 =====
  {
    id: 'exp-a-001',
    type: 'analysis',
    category: '答题框架',
    title: '综合分析辩证三步法',
    content: `第一步：亮明观点（是什么 / 持何立场）
第二步：多角度分析（正面/负面/原因/影响）
  • "一分为二"：既要看到……，也要看到……
  • 辩证法语言："从本质上看……，但也要警惕……"
第三步：给出方向性建议（不必具体，方向为主）

禁忌：
× 单方面肯定或否定
× 忽略社会背景和根本原因
× 建议太空泛（"加强重视"）`,
    example: '【示例】对"躺平"现象应辩证看待。一方面，"躺平"是年轻人对过度竞争的理性反思，反映出真实的生活压力，具有一定积极意义；另一方面，过度消极避世不利于个人成长和社会活力，需加以引导。',
    tags: ['框架', '辩证', '综合分析'],
  },
  // 其余4条...

  // ===== 贯彻执行 =====
  {
    id: 'exp-e-001',
    type: 'execution',
    category: '答题框架',
    title: '常用公文格式要点',
    content: `一、通知格式
标题：关于……的通知
主送单位：各……（顶格）
正文：开头说明目的 → 分条说明事项 → 结尾要求
落款：单位名称（右下）+ 日期

二、报告格式
标题：关于……的报告（或……工作报告）
主送单位：（上级机关，顶格）
正文：开头 → 工作情况分段 → 结尾"特此报告"
落款：单位名称 + 日期

三、实施方案格式
目的 → 工作目标 → 具体措施（分项）→ 时间安排 → 责任分工 → 预期效果`,
    example: '',
    tags: ['公文', '格式', '必背'],
  },
  // 其余4条...

  // ===== 申发论述 =====
  {
    id: 'exp-es-001',
    type: 'essay',
    category: '答题框架',
    title: '申论大作文五段式结构',
    content: `第一段（开头）：引入话题，亮明观点（1个分论点或总论点）
  约150字，避免套话，可用数据/现象/名言引入

第二、三、四段（论证）：每段一个分论点
  • 分论点句 + 阐释/举例 + 小结
  • 约200字/段，共3段

第五段（结尾）：总结升华，回扣主题
  约100字，展望未来，呼应开头

总字数：约800-900字

分论点写法：
• 并列式："A，是……；B，是……；C，是……"
• 递进式："首先……，其次……，最终……"`,
    example: '【示例标题】以创新驱动引领高质量发展\n【示例分论点】一、创新是突破"卡脖子"技术的关键钥匙；二、创新是激活实体经济内生动力的核心引擎；三、创新是打造高素质人才队伍的重要支撑。',
    tags: ['大作文', '结构', '必背'],
  },
  // 其余4条...
]

export function getExpressions(type) {
  return clone(EXPRESSIONS.filter(e => e.type === type))
}

export function searchExpressions(keyword) {
  const kw = keyword.toLowerCase()
  return clone(EXPRESSIONS.filter(e =>
    e.title.includes(kw) || e.content.includes(kw) || e.tags.some(t => t.includes(kw))
  ))
}
```

---

## 文件七：`mock/records.js`（新建，供开发调试）

```javascript
// 开发环境初始化用的 Mock 练习记录（格式与 storage.appendRecord 写入的格式一致）

export function getMockPracticeRecords() {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]

  return [
    { id: 'r001', type: '快练', title: '言语理解专项快练', questions: 10, correct: 8, accuracy: 80, time: '12:30', duration: '8分钟', date: today },
    { id: 'r002', type: '专项练习', title: '判断推理 > 图形推理', questions: 15, correct: 11, accuracy: 73, time: '10:15', duration: '18分钟', date: today },
    { id: 'r003', type: '模拟刷题', title: '2024国考行测模拟卷（一）', questions: 20, correct: 12, accuracy: 60, time: '08:00', duration: '35分钟', date: today },
    { id: 'r004', type: '每日一练', title: `行测每日一练 ${yesterday}`, questions: 5, correct: 4, accuracy: 80, time: '21:00', duration: '10分钟', date: yesterday },
    { id: 'r005', type: '专项练习', title: '数量关系 > 工程问题', questions: 10, correct: 4, accuracy: 40, time: '15:30', duration: '15分钟', date: yesterday },
    { id: 'r006', type: '模拟刷题', title: '省考行测全真模拟', questions: 20, correct: 14, accuracy: 70, time: '09:00', duration: '90分钟', date: twoDaysAgo },
  ]
}
```

---

## 文件八：`mock/wrong.js`（新建，供开发调试）

```javascript
export function getMockWrongQuestions() {
  return [
    {
      id: 'q_w001',
      type: '单选题',
      category: '数量关系',
      subCategory: '数学运算',
      stem: '某工程由甲乙合做需12天完成...',
      options: [...],
      correctAnswer: 'C',
      explanation: '...',
      userAnswer: 'B',
      knowledgePoint: '数量关系 > 工程问题',
      source: '2024国考行测',
      addedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      mastered: false,
      errorCount: 2,
    },
    // 更多错题...
  ]
}
```

---

## 执行顺序

1. 扩充 `mock/questions.js`（增加题目 + 补充子节点）
2. 扩充 `mock/papers.js`（给全套试卷加题目）
3. 新建 `mock/daily.js`
4. 新建 `mock/shenlun.js`（25道申论题）
5. 新建 `mock/hotspot.js`
6. 新建 `mock/expression.js`
7. 新建 `mock/records.js`
8. 新建 `mock/wrong.js`

---

*文档版本：v1.0 | 生成日期：2026-03-25*
