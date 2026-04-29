import { getQuestionsByFocus } from './questions'

const clone = (value) => JSON.parse(JSON.stringify(value))

const HISTORICAL_REGIONS = [
  { id: 'national', name: '全国', total: 39 },
  { id: 'guizhou', name: '贵州', total: 17 },
  // { id: 'anhui', name: '安徽', total: 18 },
  // { id: 'beijing', name: '北京', total: 18 },
  // { id: 'chongqing', name: '重庆', total: 27 },
  // { id: 'fujian', name: '福建', total: 22 },
  // { id: 'gansu', name: '甘肃', total: 14 },
  // { id: 'guangxi', name: '广西', total: 18 },
]

const buildSection = (paperId, sectionIndex, name, focusId, count) => {
  const questions = getQuestionsByFocus('xingce', focusId, count).map((question, index) => ({
    ...question,
    id: `${paperId}-${sectionIndex + 1}-${index + 1}`,
    questionId: `${paperId}-${sectionIndex + 1}-${index + 1}`,
    type: question.type === 'single' ? '单选题' : question.type,
    stem: question.stem || question.content,
    explanation: question.explanation || question.analysis,
    section: name,
  }))

  return {
    name,
    questions,
  }
}

const createPaper = ({
  id,
  title,
  subtitle,
  year,
  difficulty,
  isHot,
  isNew,
  passRate,
  duration = 30,
  sections,
}) => {
  const builtSections = sections.map((section, index) =>
    buildSection(id, index, section.name, section.focusId, section.count),
  )

  const questionCount = builtSections.reduce(
    (total, section) => total + section.questions.length,
    0,
  )

  return {
    id,
    paperId: id,
    title,
    name: title,
    subtitle,
    questionCount,
    duration,
    totalDuration: duration,
    year,
    isHot,
    isNew,
    difficulty,
    passRate,
    sections: builtSections,
  }
}

const FULL_EXAM_PAPERS = [
  createPaper({
    id: 'gk-2026-fs',
    title: '2026年国家公务员录用考试《行测》题（副省级网友回忆版）',
    subtitle: '副省级 · 网友回忆版',
    year: 2026,
    difficulty: 'hard',
    isHot: true,
    isNew: true,
    passRate: 38.5,
    sections: [
      { name: '常识判断', focusId: 'common', count: 5 },
      { name: '言语理解与表达', focusId: 'verbal', count: 5 },
      { name: '判断推理', focusId: 'logic', count: 5 },
      { name: '数量关系', focusId: 'math', count: 3 },
      { name: '资料分析', focusId: 'data', count: 2 },
    ],
  }),
  createPaper({
    id: 'gk-2026-ds',
    title: '2026年国家公务员录用考试《行测》题（地市级网友回忆版）',
    subtitle: '地市级 · 网友回忆版',
    year: 2026,
    difficulty: 'medium',
    isHot: true,
    isNew: false,
    passRate: 42.1,
    sections: [
      { name: '政治理论', focusId: 'politics', count: 4 },
      { name: '常识判断', focusId: 'current-affairs', count: 4 },
      { name: '言语理解与表达', focusId: 'verbal-read', count: 4 },
      { name: '判断推理', focusId: 'logic-deduce', count: 4 },
      { name: '资料分析', focusId: 'data-chart', count: 4 },
    ],
  }),
  createPaper({
    id: 'gk-2025-fs',
    title: '2025年国家公务员录用考试《行测》题（副省级）',
    subtitle: '国家卷 · 副省级',
    year: 2025,
    difficulty: 'hard',
    isHot: false,
    isNew: false,
    passRate: 40.3,
    sections: [
      { name: '政治理论', focusId: 'xi', count: 3 },
      { name: '常识判断', focusId: 'political-common', count: 4 },
      { name: '言语理解与表达', focusId: 'verbal-fill', count: 5 },
      { name: '判断推理', focusId: 'logic-definition', count: 4 },
      { name: '数量关系', focusId: 'math-calc', count: 4 },
    ],
  }),
  createPaper({
    id: 'gk-2025-ds',
    title: '2025年国家公务员录用考试《行测》题（地市级）',
    subtitle: '国家卷 · 地市级',
    year: 2025,
    difficulty: 'medium',
    isHot: false,
    isNew: false,
    passRate: 44.2,
    sections: [
      { name: '常识判断', focusId: 'geography-common', count: 4 },
      { name: '言语理解与表达', focusId: 'verbal-understand', count: 4 },
      { name: '判断推理', focusId: 'logic-analogy', count: 4 },
      { name: '数量关系', focusId: 'math-number', count: 4 },
      { name: '资料分析', focusId: 'data-mixed', count: 4 },
    ],
  }),
]

const PAPERS = FULL_EXAM_PAPERS.map(({ sections, totalDuration, ...paper }) => ({
  ...paper,
  duration: totalDuration,
}))

export function getAllPapers() {
  return clone(PAPERS)
}

export function getRecommendPapers() {
  return clone(PAPERS.filter((item) => item.isHot || item.isNew).slice(0, 3))
}

export function getHistoricalPapers() {
  return clone(PAPERS.filter((item) => item.year <= 2025))
}

export function getPaperDetail(paperId) {
  return clone(
    FULL_EXAM_PAPERS.find(
      (item) => item.paperId === paperId || item.id === paperId,
    ) || null,
  )
}

export function getHistoricalPaperRegions() {
  return clone(HISTORICAL_REGIONS)
}

export function getExamModePapers(mode = 'full') {
  if (mode === 'full') {
    return clone(FULL_EXAM_PAPERS)
  }

  return []
}

export function getFullExamPaperById(id) {
  return getPaperDetail(id)
}
