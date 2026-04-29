const clone = (value) => JSON.parse(JSON.stringify(value))

const TYPE_NAME_MAP = {
  single: '单选题',
  multi: '多选题',
  judge: '判断题',
}

const TYPE_ID_MAP = {
  single: 1,
  multi: 2,
  judge: 3,
}

const DIFFICULTY_LABEL_MAP = {
  easy: '简单',
  medium: '适中',
  hard: '困难',
}

const DIFFICULTY_LEVEL_MAP = {
  easy: 1,
  medium: 2,
  hard: 3,
}

const createOptions = (items = []) =>
  items.map((item) => {
    if (Array.isArray(item)) {
      const [id, text, image = ''] = item
      return {
        id,
        key: id,
        text,
        value: text,
        image,
      }
    }

    const id = item.id || item.key || ''
    const text = item.text || item.value || ''

    return {
      ...item,
      id,
      key: item.key || id,
      text,
      value: item.value || text,
      image: item.image || '',
    }
  })

const buildKnowledgeSegments = (knowledgePoint = '', category = '', subCategory = '') =>
  String(knowledgePoint || [category, subCategory].filter(Boolean).join(' > '))
    .split('>')
    .map((item) => String(item || '').trim())
    .filter(Boolean)

const createQuestion = ({
  questionId,
  type = 'single',
  category,
  subCategory,
  difficulty = 'medium',
  stem,
  options,
  correctAnswer,
  analysis,
  knowledgePoint,
  score,
  year = 2026,
  source = 'Mock题库',
  examType = '公职类',
  examSubtype = '公职类行测',
  material,
  materialTitle,
  materialPreview,
  materialImage,
  questionImage,
}) => {
  const resolvedTypeName = TYPE_NAME_MAP[type] || type
  const resolvedTypeId = TYPE_ID_MAP[type] || 1
  const resolvedDifficultyLabel = DIFFICULTY_LABEL_MAP[difficulty] || '适中'
  const resolvedKnowledgePoint = knowledgePoint || `${category} > ${subCategory}`
  const resolvedKnowledgeLevels = buildKnowledgeSegments(
    resolvedKnowledgePoint,
    category,
    subCategory,
  )
  const resolvedOptions = createOptions(options)
  const resolvedScore = score !== undefined ? score : type === 'multi' ? 2 : 1

  return {
    id: questionId,
    questionId,
    question_id: questionId,
    type,
    typeLabel: resolvedTypeName,
    type_name: resolvedTypeName,
    typeId: resolvedTypeId,
    type_id: resolvedTypeId,
    category,
    subCategory,
    question_type: subCategory || category || '未分类',
    difficulty,
    difficultyLabel: resolvedDifficultyLabel,
    question_difficulty: resolvedDifficultyLabel,
    level: DIFFICULTY_LEVEL_MAP[difficulty] || 2,
    stem,
    content: stem,
    question_content: stem,
    options: resolvedOptions,
    question_options: resolvedOptions,
    correctAnswer,
    correct_answer: correctAnswer,
    answer: correctAnswer,
    analysis,
    explanation: analysis,
    question_parse: analysis,
    knowledgePoint: resolvedKnowledgePoint,
    knowledgePath: resolvedKnowledgeLevels,
    knowledgeLevels: resolvedKnowledgeLevels,
    knowledge: resolvedKnowledgeLevels,
    exam_point: resolvedKnowledgePoint,
    year,
    source,
    question_source: source,
    questionScore: resolvedScore,
    question_score: resolvedScore,
    score: resolvedScore,
    examType,
    exam_type: examType,
    examSubtype,
    exam_subtype: examSubtype,
    material: material || '',
    materialTitle: materialTitle || '',
    materialPreview: materialPreview || '',
    materialImage: materialImage || '',
    questionImage: questionImage || '',
  }
}

const QUESTIONS = [
  createQuestion({
    questionId: 'q001',
    category: '政治理论',
    subCategory: '马克思主义哲学',
    difficulty: 'easy',
    stem: '“实践是检验真理的唯一标准”体现了马克思主义哲学中的哪一观点？',
    options: [
      ['A', '物质决定意识'],
      ['B', '实践观点'],
      ['C', '联系观点'],
      ['D', '发展观点'],
    ],
    correctAnswer: 'B',
    analysis: '该表述直接强调实践在认识活动中的决定性作用，属于马克思主义认识论中的实践观点。',
    year: 2024,
    source: '公基',
  }),
  createQuestion({
    questionId: 'q002',
    category: '政治理论',
    subCategory: '毛泽东思想',
    stem: '毛泽东思想活的灵魂不包括下列哪一项？',
    options: [
      ['A', '实事求是'],
      ['B', '群众路线'],
      ['C', '独立自主'],
      ['D', '全面从严治党'],
    ],
    correctAnswer: 'D',
    analysis: '毛泽东思想活的灵魂主要包括实事求是、群众路线、独立自主。',
    year: 2025,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q003',
    category: '政治理论',
    subCategory: '习近平新时代中国特色社会主义思想',
    difficulty: 'hard',
    stem: '新发展理念中，解决发展不平衡问题所强调的是：',
    options: [
      ['A', '创新'],
      ['B', '协调'],
      ['C', '绿色'],
      ['D', '共享'],
    ],
    correctAnswer: 'B',
    analysis: '协调发展注重解决发展不平衡问题，是五大发展理念的重要组成部分。',
    year: 2026,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q004',
    category: '政治理论',
    subCategory: '习近平新时代中国特色社会主义思想',
    difficulty: 'medium',
    stem: '推进中国式现代化，最鲜明的领导力量是：',
    options: [
      ['A', '人民群众'],
      ['B', '市场机制'],
      ['C', '中国共产党'],
      ['D', '科技创新'],
    ],
    correctAnswer: 'C',
    analysis: '党的领导是中国式现代化的根本保证，也是最鲜明的特征之一。',
    year: 2026,
    source: '公基',
  }),
  createQuestion({
    questionId: 'q005',
    category: '政治理论',
    subCategory: '马克思主义哲学',
    difficulty: 'medium',
    stem: '“量变达到一定程度必然引起质变”体现了辩证法中的：',
    options: [
      ['A', '对立统一规律'],
      ['B', '质量互变规律'],
      ['C', '否定之否定规律'],
      ['D', '普遍联系规律'],
    ],
    correctAnswer: 'B',
    analysis: '量变和质变的相互转化属于唯物辩证法的质量互变规律。',
    year: 2024,
    source: '事业单位',
  }),
  createQuestion({
    questionId: 'q006',
    category: '常识判断',
    subCategory: '时事政治',
    stem: '2026年政府工作报告强调要持续推进的首要任务之一是：',
    options: [
      ['A', '大规模减少财政支出'],
      ['B', '扩大高水平对外开放'],
      ['C', '全面取消数字经济监管'],
      ['D', '暂停制造业升级'],
    ],
    correctAnswer: 'B',
    analysis: '高水平对外开放是当前经济工作的重要抓手之一，其他选项明显不符合政策导向。',
    year: 2026,
    source: '时政热点',
  }),
  createQuestion({
    questionId: 'q007',
    category: '常识判断',
    subCategory: '政治常识',
    stem: '全国人民代表大会常务委员会有权行使下列哪项职权？',
    options: [
      ['A', '制定和修改刑事、民事、国家机构和其他的基本法律'],
      ['B', '批准省、自治区和直辖市的建置'],
      ['C', '解释法律'],
      ['D', '修改宪法'],
    ],
    correctAnswer: 'C',
    analysis: '法律解释权属于全国人大常委会；基本法律制定修改和宪法修改属于全国人大。',
    year: 2025,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q008',
    category: '常识判断',
    subCategory: '经济常识',
    difficulty: 'hard',
    stem: '下列关于通货膨胀的表述，正确的是：',
    options: [
      ['A', '通货膨胀一定会导致就业率上升'],
      ['B', '温和通胀对经济一定有害'],
      ['C', '货币供应量过快增长可能引发通货膨胀'],
      ['D', '通货膨胀意味着所有商品价格同比例上涨'],
    ],
    correctAnswer: 'C',
    analysis: '货币供给过快增长是引发通胀的重要因素，其他说法都过于绝对。',
    year: 2024,
    source: '公基',
  }),
  createQuestion({
    questionId: 'q009',
    category: '常识判断',
    subCategory: '生活常识',
    difficulty: 'easy',
    stem: '食盐放入水中逐渐溶解，这一现象属于：',
    options: [
      ['A', '化学变化'],
      ['B', '物理变化'],
      ['C', '氧化反应'],
      ['D', '还原反应'],
    ],
    correctAnswer: 'B',
    analysis: '溶解过程没有生成新物质，因此属于物理变化。',
    year: 2023,
    source: '省考常识',
  }),
  createQuestion({
    questionId: 'q010',
    category: '常识判断',
    subCategory: '地理常识',
    stem: '我国地势总的特点是：',
    options: [
      ['A', '东高西低'],
      ['B', '西高东低'],
      ['C', '南高北低'],
      ['D', '北高南低'],
    ],
    correctAnswer: 'B',
    analysis: '我国地势总体呈西高东低、阶梯状分布。',
    year: 2024,
    source: '事业单位',
  }),
  createQuestion({
    questionId: 'q011',
    category: '言语理解与表达',
    subCategory: '逻辑填空',
    difficulty: 'medium',
    stem: '数字政府建设不是简单地把线下流程搬到线上，而是通过流程再造提升治理效能，这要求改革必须更加______、更加精准。',
    options: [
      ['A', '粗放'],
      ['B', '系统'],
      ['C', '被动'],
      ['D', '单一'],
    ],
    correctAnswer: 'B',
    analysis: '与“更加精准”搭配最自然的是“更加系统”，体现整体性治理思维。',
    year: 2026,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q012',
    category: '言语理解与表达',
    subCategory: '阅读理解',
    stem: '文段指出，发展新质生产力既要重视技术突破，也要关注制度创新和人才培养。这段话意在强调：',
    options: [
      ['A', '技术突破最重要'],
      ['B', '人才培养并不关键'],
      ['C', '发展新质生产力需要系统推进'],
      ['D', '制度创新会削弱技术创新'],
    ],
    correctAnswer: 'C',
    analysis: '文段通过并列结构强调多要素协同，核心是“系统推进”。',
    year: 2025,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q013',
    category: '言语理解与表达',
    subCategory: '语句表达',
    difficulty: 'hard',
    stem: '将下列句子重新排序，语序最恰当的是：①推进公共数据开放共享 ②提升政务服务效率 ③打破部门信息壁垒 ④是建设数字政府的重要抓手',
    options: [
      ['A', '①③②④'],
      ['B', '④①③②'],
      ['C', '①④③②'],
      ['D', '④③①②'],
    ],
    correctAnswer: 'C',
    analysis: '“推进公共数据开放共享”作主语，后接“是……抓手”，再说明其作用“打破壁垒、提升效率”。',
    year: 2024,
    source: '联考',
  }),
  createQuestion({
    questionId: 'q014',
    category: '言语理解与表达',
    subCategory: '语义理解',
    stem: '“激活一池春水”在文段中最贴切的理解是：',
    options: [
      ['A', '阻止创新活动'],
      ['B', '唤起活力和动力'],
      ['C', '维持原有状态'],
      ['D', '减少市场主体'],
    ],
    correctAnswer: 'B',
    analysis: '“激活一池春水”是常见比喻，强调激发活力。',
    year: 2025,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q015',
    category: '言语理解与表达',
    subCategory: '文章阅读',
    difficulty: 'medium',
    stem: '文章指出，基层治理数字化不能“唯技术论”，其根本原因在于：',
    options: [
      ['A', '基层干部不会使用系统'],
      ['B', '治理归根到底是做群众工作'],
      ['C', '数字化一定降低效率'],
      ['D', '技术与治理互不相关'],
    ],
    correctAnswer: 'B',
    analysis: '文章强调技术只是工具，基层治理的核心仍是服务群众、解决问题。',
    year: 2026,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q016',
    category: '数量关系',
    subCategory: '数字推理',
    stem: '3，7，15，31，63，（ ）',
    options: [
      ['A', '95'],
      ['B', '111'],
      ['C', '127'],
      ['D', '135'],
    ],
    correctAnswer: 'C',
    analysis: '数列规律为前一项乘2再加1，因此下一项为63×2+1=127。',
    year: 2024,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q017',
    category: '数量关系',
    subCategory: '数学运算',
    difficulty: 'hard',
    stem: '某项工程，甲单独做10天完成，乙单独做15天完成。两人合作3天后，剩余工程由甲单独完成，还需要多少天？',
    options: [
      ['A', '2'],
      ['B', '3'],
      ['C', '4'],
      ['D', '5'],
    ],
    correctAnswer: 'D',
    analysis: '甲乙效率和为1/6，合作3天完成1/2；剩余1/2由甲单独完成，需要(1/2)÷(1/10)=5天。',
    knowledgePoint: '数量关系 > 工程问题',
    year: 2025,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q018',
    category: '数量关系',
    subCategory: '数学运算',
    stem: '一件商品先涨价20%，再降价20%，最终价格与原价相比：',
    options: [
      ['A', '上涨4%'],
      ['B', '下降4%'],
      ['C', '不变'],
      ['D', '下降8%'],
    ],
    correctAnswer: 'B',
    analysis: '设原价100，涨后120，再降20%得到96，较原价下降4%。',
    knowledgePoint: '数量关系 > 百分比计算',
    year: 2024,
    source: '联考',
  }),
  createQuestion({
    questionId: 'q019',
    category: '数量关系',
    subCategory: '数字推理',
    difficulty: 'easy',
    stem: '1，4，9，16，25，（ ）',
    options: [
      ['A', '30'],
      ['B', '32'],
      ['C', '36'],
      ['D', '49'],
    ],
    correctAnswer: 'C',
    analysis: '该数列为平方数列，依次为1²、2²、3²、4²、5²、6²。',
    year: 2023,
    source: '事业单位',
  }),
  createQuestion({
    questionId: 'q020',
    category: '数量关系',
    subCategory: '数学运算',
    stem: '某班男生人数比女生多8人，且男女生人数之比为5:3，则该班共有学生多少人？',
    options: [
      ['A', '24'],
      ['B', '28'],
      ['C', '32'],
      ['D', '40'],
    ],
    correctAnswer: 'C',
    analysis: '男女差为2份，对应8人，则1份为4人，总人数为8份，即32人。',
    knowledgePoint: '数量关系 > 比例问题',
    year: 2026,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q021',
    category: '判断推理',
    subCategory: '图形推理',
    difficulty: 'medium',
    stem: '观察下图中每个方格内三角形数量的变化规律，问问号处应选择哪一项？',
    options: [
      ['A', '2个三角形'],
      ['B', '3个三角形'],
      ['C', '4个三角形'],
      ['D', '5个三角形'],
    ],
    correctAnswer: 'C',
    analysis: '图形数量呈1、2、3、4递增，问号处应为4个三角形。',
    questionImage: '/assets/images/mock-figure-sequence.svg',
    year: 2025,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q022',
    category: '判断推理',
    subCategory: '定义判断',
    stem: '“绿色消费”是指消费者在满足基本生活需要的前提下，选择有利于生态环境保护的消费方式。根据上述定义，下列属于绿色消费的是：',
    options: [
      ['A', '为了省钱长期购买一次性餐具'],
      ['B', '优先购买节能家电'],
      ['C', '为追求时尚频繁更换手机'],
      ['D', '囤积食品导致浪费'],
    ],
    correctAnswer: 'B',
    analysis: '节能家电符合“有利于生态环境保护的消费方式”这一核心定义。',
    year: 2024,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q023',
    category: '判断推理',
    subCategory: '类比推理',
    difficulty: 'easy',
    stem: '水稻：粮食 与 下列哪一组关系最相近？',
    options: [
      ['A', '钢琴：乐器'],
      ['B', '汽车：公路'],
      ['C', '医生：医院'],
      ['D', '教师：学生'],
    ],
    correctAnswer: 'A',
    analysis: '水稻属于粮食，钢琴属于乐器，二者均为种属关系。',
    year: 2023,
    source: '事业单位',
  }),
  createQuestion({
    questionId: 'q024',
    category: '判断推理',
    subCategory: '逻辑判断',
    difficulty: 'hard',
    stem: '如果某项政策效果显著，那么群众满意度会提升。已知群众满意度没有提升，可以推出：',
    options: [
      ['A', '该政策一定失败'],
      ['B', '该政策效果不显著'],
      ['C', '群众评价不真实'],
      ['D', '政策没有实施'],
    ],
    correctAnswer: 'B',
    analysis: '根据充分条件假言命题的逆否命题，满意度未提升可推出效果不显著。',
    year: 2026,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q025',
    category: '判断推理',
    subCategory: '逻辑判断',
    stem: '某单位有甲、乙、丙三人，其中只有一人获得表彰。甲说“不是我”，乙说“是丙”，丙说“乙说错了”。若三人中只有一人说真话，则获得表彰的是：',
    options: [
      ['A', '甲'],
      ['B', '乙'],
      ['C', '丙'],
      ['D', '无法确定'],
    ],
    correctAnswer: 'A',
    analysis: '逐项代入可得只有甲获表彰时，乙、丙均说假话，甲说真话，满足题意。',
    year: 2025,
    source: '联考',
  }),
  createQuestion({
    questionId: 'q026',
    category: '资料分析',
    subCategory: '文字资料',
    stem: '某市2025年固定资产投资同比增长8%，比上年提高2个百分点，则2024年该市固定资产投资同比增长约为：',
    options: [
      ['A', '4%'],
      ['B', '5%'],
      ['C', '6%'],
      ['D', '7%'],
    ],
    correctAnswer: 'C',
    analysis: '“提高2个百分点”说明上年增速为8%-2%=6%。',
    year: 2026,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q027',
    category: '资料分析',
    subCategory: '表格资料',
    difficulty: 'medium',
    stem: '表格显示某企业第一季度三个月销量分别为120、150、180件，则月均销量为：',
    options: [
      ['A', '140件'],
      ['B', '145件'],
      ['C', '150件'],
      ['D', '160件'],
    ],
    correctAnswer: 'C',
    analysis: '平均数为（120+150+180）÷3=150件。',
    year: 2024,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q028',
    category: '资料分析',
    subCategory: '图表资料',
    difficulty: 'hard',
    stem: '某图表显示A产业占比由25%上升到30%，提升了：',
    options: [
      ['A', '5个百分点'],
      ['B', '5%'],
      ['C', '20个百分点'],
      ['D', '30%'],
    ],
    correctAnswer: 'A',
    analysis: '占比从25%提高到30%，提升的是5个百分点，而不是5%。',
    year: 2025,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q029',
    category: '资料分析',
    subCategory: '综合资料',
    stem: '某地区2025年GDP为5200亿元，同比增长4%，则2024年GDP约为多少亿元？',
    options: [
      ['A', '4900'],
      ['B', '5000'],
      ['C', '5200'],
      ['D', '5400'],
    ],
    correctAnswer: 'B',
    analysis: '2024年GDP约为5200÷1.04=5000亿元。',
    year: 2026,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q030',
    category: '资料分析',
    subCategory: '图表资料',
    difficulty: 'easy',
    stem: '某图中甲、乙、丙三项占比分别为40%、35%、25%，其中占比最高的是：',
    options: [
      ['A', '甲'],
      ['B', '乙'],
      ['C', '丙'],
      ['D', '无法判断'],
    ],
    correctAnswer: 'A',
    analysis: '40%最大，因此占比最高的是甲。',
    year: 2023,
    source: '事业单位',
  }),
  createQuestion({
    questionId: 'q031',
    type: 'multi',
    category: '资料分析',
    subCategory: '综合资料',
    difficulty: 'medium',
    stem: '根据材料和图示，下列说法正确的有：',
    options: [
      ['A', '健身站点数量最多'],
      ['B', '便民书屋数量比社区食堂多20个'],
      ['C', '三类站点合计为240个'],
      ['D', '社区食堂与便民书屋合计为160个'],
    ],
    correctAnswer: ['A', 'C'],
    analysis:
      '图示中社区食堂为60个，便民书屋为80个，健身站点为100个，因此A、C正确，B、D错误。',
    materialTitle: '某市“15分钟生活圈”服务站点建设情况',
    material:
      '某市围绕“15分钟生活圈”推进便民服务升级。2025年新增社区食堂60个、便民书屋80个、健身站点100个，计划在老旧社区优先布局复合型服务空间，并同步推动夜间延时开放与智慧预约。',
    materialPreview:
      '某市围绕“15分钟生活圈”推进便民服务升级，2025年新增社区食堂60个、便民书屋80个、健身站点100个……',
    materialImage: 'https://images.unsplash.com/photo-1543286386-713bcd534007?w=800&q=80',
    knowledgePoint: '资料分析 > 综合资料 > 图文综合判断',
    year: 2026,
    source: '国考行测',
  }),
  createQuestion({
    questionId: 'q032',
    type: 'single',
    category: '资料分析',
    subCategory: '文字资料',
    difficulty: 'hard',
    materialTitle: '关于2025年国民经济和社会发展计划执行情况的报告（节选）',
    material: `2025年，面对复杂严峻的国际环境和艰巨繁重的国内改革发展稳定任务，我国坚持稳中求进工作总基调，完整、准确、全面贯彻新发展理念，加快构建新发展格局，着力推动高质量发展。
    
    一、综合经济表现
    全年国内生产总值（GDP）达到142万亿元，按不变价格计算，比上年增长5.2%。其中，第一产业增加值9.5万亿元，增长4.1%；第二产业增加值54.2万亿元，增长4.7%；第三产业增加值78.3万亿元，增长5.8%。三次产业结构为6.7:38.2:55.1。全年城镇新增就业1300万人，城镇调查失业率平均为5.1%。居民消费价格（CPI）比上年上涨1.2%。
    
    二、工业和建筑业
    全口径工业增加值43.5万亿元，比上年增长4.6%。规模以上工业增加值增长4.5%。在规模以上工业中，分经济类型看，国有控股企业增加值增长5.0%；股份制企业增长5.3%，外商及港澳台商投资企业增长1.4%；私营企业增长3.1%。分门类看，采矿业增长2.3%，制造业增长5.0%，电力、热力、燃气及水生产和供应业增长4.3%。
    
    三、固定资产投资
    全社会固定资产投资56万亿元，比上年增长3.0%。其中，固定资产投资（不含农户）54.5万亿元，增长2.8%。在固定资产投资（不含农户）中，第一产业投资1.2万亿元，下降1.0%；第二产业投资18.5万亿元，增长9.0%；第三产业投资34.8万亿元，增长0.4%。民间固定资产投资28.5万亿元，下降0.4%。
    
    四、对外经济
    货物进出口总额42万亿元，比上年增长0.2%。其中，出口24万亿元，增长0.6%；进口18万亿元，下降0.3%。贸易顺差6万亿元。对“一带一路”共建国家进出口总额19.5万亿元，增长2.8%，占进出口总额的比重为46.4%。
    
    五、居民收入消费和社会保障
    全国居民人均可支配收入41000元，比上年名义增长6.3%，扣除价格因素，实际增长5.1%。按常住地分，城镇居民人均可支配收入54000元，名义增长5.1%，实际增长4.5%；农村居民人均可支配收入23000元，名义增长7.7%，实际增长7.3%。全国居民人均消费支出28000元，比上年名义增长9.2%，实际增长8.3%。`,
    stem: '根据上述材料，2025年我国第三产业增加值占GDP的比重比第二产业高约：',
    options: [
      ['A', '15.2个百分点'],
      ['B', '16.9个百分点'],
      ['C', '18.5个百分点'],
      ['D', '20.1个百分点'],
    ],
    correctAnswer: 'B',
    analysis: '从材料第一部分可知，三次产业结构为6.7:38.2:55.1。第三产业占比为55.1%，第二产业占比为38.2%。55.1 - 38.2 = 16.9个百分点。',
    year: 2026,
    source: '国考行测真题模拟',
  }),
  createQuestion({
    questionId: 'q033',
    type: 'single',
    category: '判断推理',
    subCategory: '图形推理',
    difficulty: 'medium',
    stem: '从所给的四个选项中，选择最合适的一个填入问号处，使之呈现一定的规律性：',
    questionImage: 'https://images.unsplash.com/photo-1502139194669-df483840778c?w=800&q=80',
    options: [
      ['A', '选项A', 'https://placehold.co/200x200?text=Option+A'],
      ['B', '选项B', 'https://placehold.co/200x200?text=Option+B'],
      ['C', '选项C', 'https://placehold.co/200x200?text=Option+C'],
      ['D', '选项D', 'https://placehold.co/200x200?text=Option+D'],
    ],
    correctAnswer: 'C',
    analysis: '本题考查图形的旋转规律。图中线条按顺时针方向每次旋转90度。',
    year: 2025,
    source: '省考真题',
  }),
  createQuestion({
    questionId: 'q034',
    type: 'single',
    category: '言语理解与表达',
    subCategory: '逻辑填空',
    difficulty: 'medium',
    stem: '在推进新型城镇化过程中，我们不仅要看摩天大楼的“高度”，更要看背后的“温度”。这种温度，体现在对每一个进城务工人员的______中，体现在对弱势群体的______中。',
    options: [
      ['A', '接纳 关怀'],
      ['B', '包容 庇护'],
      ['C', '排斥 救助'],
      ['D', '忽视 照顾'],
    ],
    correctAnswer: 'A',
    analysis: '第一空搭配进城务工人员，接纳或包容均可；第二空搭配弱势群体，关怀更符合语境，庇护贬义色彩较重。',
    year: 2026,
    source: '省考行测',
  }),
  createQuestion({
    questionId: 'q035',
    type: 'single',
    category: '常识判断',
    subCategory: '法律常识',
    difficulty: 'medium',
    stem: '下列图片所示的法律标志，对应正确的是：',
    questionImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    options: [
      ['A', '公平正义'],
      ['B', '诚实守信'],
      ['C', '权责一致'],
      ['D', '程序正当'],
    ],
    correctAnswer: 'A',
    analysis: '图片展示的是正义女神朱斯提提亚，象征着公平正义。',
    year: 2024,
    source: '法律常识',
  }),
]

const PRACTICE_CATEGORY_TREE = {
  xingce: [
    {
      id: 'politics',
      name: '政治理论',
      answered: 0,
      total: 226,
      expanded: false,
      children: [
        { id: 'marxism', name: '马克思主义哲学', answered: 0, total: 80 },
        { id: 'mao', name: '毛泽东思想', answered: 0, total: 60 },
        {
          id: 'xi',
          name: '习近平新时代中国特色社会主义思想',
          answered: 0,
          total: 86,
        },
      ],
    },
    {
      id: 'common',
      name: '常识判断',
      answered: 0,
      total: 7485,
      expanded: true,
      children: [
        { id: 'current-affairs', name: '时事政治', answered: 0, total: 80 },
        { id: 'political-common', name: '政治常识', answered: 0, total: 1560 },
        { id: 'economic-common', name: '经济常识', answered: 0, total: 414 },
        { id: 'other-common', name: '其他常识', answered: 0, total: 74 },
        { id: 'life-common', name: '生活常识', answered: 0, total: 22 },
        { id: 'geography-common', name: '地理常识', answered: 0, total: 455 },
      ],
    },
    {
      id: 'verbal',
      name: '言语理解与表达',
      answered: 0,
      total: 11350,
      expanded: false,
      children: [
        { id: 'verbal-fill', name: '逻辑填空', answered: 0, total: 3240 },
        { id: 'verbal-read', name: '阅读理解', answered: 0, total: 2800 },
        { id: 'verbal-express', name: '语句表达', answered: 0, total: 1850 },
        { id: 'verbal-understand', name: '语义理解', answered: 0, total: 1460 },
        { id: 'verbal-read2', name: '文章阅读', answered: 0, total: 2000 },
      ],
    },
    {
      id: 'math',
      name: '数量关系',
      answered: 0,
      total: 5775,
      expanded: false,
      children: [
        { id: 'math-number', name: '数字推理', answered: 0, total: 480 },
        { id: 'math-calc', name: '数学运算', answered: 0, total: 5295 },
      ],
    },
    {
      id: 'logic',
      name: '判断推理',
      answered: 0,
      total: 12528,
      expanded: false,
      children: [
        { id: 'logic-figure', name: '图形推理', answered: 0, total: 2800 },
        { id: 'logic-definition', name: '定义判断', answered: 0, total: 2640 },
        { id: 'logic-analogy', name: '类比推理', answered: 0, total: 1800 },
        { id: 'logic-deduce', name: '逻辑判断', answered: 0, total: 5288 },
      ],
    },
    {
      id: 'data',
      name: '资料分析',
      answered: 0,
      total: 6812,
      expanded: false,
      children: [
        { id: 'data-text', name: '文字资料', answered: 0, total: 1500 },
        { id: 'data-table', name: '表格资料', answered: 0, total: 1800 },
        { id: 'data-chart', name: '图表资料', answered: 0, total: 1960 },
        { id: 'data-mixed', name: '综合资料', answered: 0, total: 1552 },
      ],
    },
  ],
  shenlun: [
    {
      id: 'summary',
      name: '概括归纳',
      answered: 0,
      total: 380,
      expanded: false,
      children: [],
    },
    {
      id: 'countermeasure',
      name: '提出对策',
      answered: 0,
      total: 210,
      expanded: false,
      children: [],
    },
    {
      id: 'analysis',
      name: '综合分析',
      answered: 0,
      total: 295,
      expanded: false,
      children: [],
    },
    {
      id: 'execution',
      name: '贯彻执行',
      answered: 0,
      total: 164,
      expanded: false,
      children: [],
    },
    {
      id: 'essay',
      name: '申发论述',
      answered: 0,
      total: 132,
      expanded: false,
      children: [],
    },
  ],
}

const CATEGORY_MAP = {
  politics: '政治理论',
  common: '常识判断',
  verbal: '言语理解与表达',
  math: '数量关系',
  logic: '判断推理',
  data: '资料分析',
}

const SUB_CATEGORY_MAP = {
  marxism: '马克思主义哲学',
  mao: '毛泽东思想',
  xi: '习近平新时代中国特色社会主义思想',
  'current-affairs': '时事政治',
  'political-common': '政治常识',
  'economic-common': '经济常识',
  'other-common': '其他常识',
  'life-common': '生活常识',
  'geography-common': '地理常识',
  'verbal-fill': '逻辑填空',
  'verbal-read': '阅读理解',
  'verbal-express': '语句表达',
  'verbal-understand': '语义理解',
  'verbal-read2': '文章阅读',
  'math-number': '数字推理',
  'math-calc': '数学运算',
  'logic-figure': '图形推理',
  'logic-definition': '定义判断',
  'logic-analogy': '类比推理',
  'logic-deduce': '逻辑判断',
  'data-text': '文字资料',
  'data-table': '表格资料',
  'data-chart': '图表资料',
  'data-mixed': '综合资料',
}

const expandQuestions = (list, count) => {
  if (!Array.isArray(list) || !list.length || count <= 0) {
    return []
  }

  const result = []
  for (let index = 0; index < count; index += 1) {
    const question = list[index % list.length]
    const isRepeated = index >= list.length
    const suffix = isRepeated ? `_${index + 1}` : ''
    result.push({
      ...question,
      id: `${question.id}${suffix}`,
      questionId: `${question.questionId}${suffix}`,
    })
  }
  return result
}

export function getAllQuestions() {
  return clone(QUESTIONS)
}

export function getQuestionById(questionId) {
  return clone(
    QUESTIONS.find(
      (item) => item.questionId === questionId || item.id === questionId,
    ) || null,
  )
}

export function getQuestionsByCategory(category) {
  return clone(QUESTIONS.filter((item) => item.category === category))
}

export function getQuestionsByDifficulty(difficulty) {
  return clone(QUESTIONS.filter((item) => item.difficulty === difficulty))
}

export function getQuestionsByFocus(subject, focusId, count = 20) {
  if (subject && subject !== 'xingce') {
    return []
  }

  const subCategory = SUB_CATEGORY_MAP[focusId]
  const category =
    CATEGORY_MAP[focusId] ||
    CATEGORY_MAP[
      Object.keys(CATEGORY_MAP).find((key) => focusId && focusId.startsWith(key))
    ]

  let filtered = QUESTIONS
  if (subCategory) {
    filtered = QUESTIONS.filter((item) => item.subCategory === subCategory)
  } else if (category) {
    filtered = QUESTIONS.filter((item) => item.category === category)
  }

  if (!filtered.length) {
    filtered = QUESTIONS
  }

  return clone(expandQuestions(filtered, count))
}

export function getRandomQuestions(count = 10) {
  return clone(expandQuestions(QUESTIONS, count))
}

export function getPracticeCategories(subject = 'xingce') {
  return clone(PRACTICE_CATEGORY_TREE[subject] || PRACTICE_CATEGORY_TREE.xingce)
}

export function getKnowledgeTree(subject = 'xingce') {
  return getPracticeCategories(subject)
}

export function getCategories() {
  return getPracticeCategories('xingce')
}
