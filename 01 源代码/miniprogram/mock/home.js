const clone = (value) => JSON.parse(JSON.stringify(value))

const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const EXAM_TYPES = [
  {
    id: 'gwy',
    name: '公务员',
    regions: [
      '全国',
      '贵州',
      // '国家', '北京', '天津', '河北', '山西', '内蒙古',
      // '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江',
      // '安徽', '福建', '江西', '山东', '河南', '湖北',
      // '湖南', '广东', '广西', '海南', '重庆', '四川',
      // '云南', '西藏', '陕西', '甘肃', '青海',
      // '宁夏', '新疆',
    ],
  },
  {
    id: 'sydw',
    name: '事业单位',
    regions: [
      '全国',
      // '联考', '综合岗', '教育岗', '医疗岗',
    ],
  },
  {
    id: 'teacher',
    name: '教师招聘',
    regions: [
      '全国',
      // '省统考', '地市',
    ],
  },
  {
    id: 'teacher-cert',
    name: '教师资格证',
    regions: [
      '全国',
      // '笔试', '面试',
    ],
  },
  {
    id: 'zhuanshengben',
    name: '专升本',
    regions: [
      '全国',
      // '统招', '校考',
    ],
  },
  {
    id: 'police',
    name: '公安联考',
    regions: ['全国'],
  },
  {
    id: 'medical',
    name: '医疗招聘',
    regions: [
      '全国',
      // '统考', '专项',
    ],
  },
  {
    id: 'support',
    name: '三支一扶',
    regions: ['全国'],
  },
  {
    id: 'xds',
    name: '选调生',
    regions: [
      '全国',
      // '国家', '省选调',
    ],
  },
]

const SUBJECT_TABS = [
  { id: 'xingce', name: '行测' },
  { id: 'shenlun', name: '申论' },
]

const BANNER_LIST = [
  {
    id: 'report',
    badge: '阶段刷题总结',
    title: '点击查看我的',
    highlight: '学习报告',
    buttonText: '立即查看',
    pageText: '1/3',
    bgStart: '#5D8FFF',
    bgEnd: '#8AB8FF',
    accent: '#FFB347',
  },
  {
    id: 'ai',
    badge: '面试 AI',
    title: '一试忘不掉',
    highlight: '立即前往',
    buttonText: '去体验',
    pageText: '2/3',
    bgStart: '#2D63FF',
    bgEnd: '#2FB3FF',
    accent: '#7EFFE1',
  },
  {
    id: 'sprint',
    badge: '备战 26 省考',
    title: '75-60 天上岸挑战',
    highlight: '点击开始挑战',
    buttonText: '马上加入',
    pageText: '3/3',
    bgStart: '#3E7BFF',
    bgEnd: '#65C3FF',
    accent: '#FFD564',
  },
]

// 轮播图数据 - 支持图片轮播和页面跳转
const SWIPER_LIST = [
  {
    id: 'banner1',
    image: 'https://tdesign.gtimg.com/mobile/demos/swiper1.png',
    type: 'page', // page: 小程序页面, web: 网络链接
    url: '/pages/activity/activity?id=1',
    title: '国考备考指南',
  },
  {
    id: 'banner2',
    image: 'https://tdesign.gtimg.com/mobile/demos/swiper2.png',
    type: 'web',
    url: 'https://example.com/activity',
    title: '省考历年真题',
  },
  {
    id: 'banner3',
    image: 'https://tdesign.gtimg.com/mobile/demos/swiper1.png',
    type: 'page',
    url: '/pages/index/index',
    title: '事业单位备考',
  },
]

const QUICK_ENTRY_LIST = [
  {
    id: 'daily',
    title: '每日一练',
    icon: 'calendar',
    iconColor: '#3A76F0',
    bgColor: '#EDF4FF',
    gradient: 'linear-gradient(135deg, #3A76F0 0%, #5B9BFF 100%)',
    badge: '',
  },
  {
    id: 'current-affairs',
    title: '最新时政',
    icon: 'notification',
    iconColor: '#00B2FF',
    bgColor: '#E6F7FF',
    gradient: 'linear-gradient(135deg, #00B2FF 0%, #00D4FF 100%)',
    badge: '',
  },
  {
    id: 'papers',
    title: '历年试卷',
    icon: 'file',
    iconColor: '#FF8A3D',
    bgColor: '#FFF5EB',
    gradient: 'linear-gradient(135deg, #FF8A3D 0%, #FFB366 100%)',
    badge: '',
  },
  {
    id: 'suite',
    title: '套题练习',
    icon: 'layers',
    iconColor: '#7B66FF',
    bgColor: '#F2F0FF',
    gradient: 'linear-gradient(135deg, #7B66FF 0%, #9D8AFF 100%)',
    badge: '13套',
  },
  {
    id: 'mock',
    title: '模拟试卷',
    icon: 'chart',
    iconColor: '#00C18E',
    bgColor: '#E6FFF5',
    gradient: 'linear-gradient(135deg, #00C18E 0%, #00E5A8 100%)',
    badge: '1252套',
  },
]

const SHENLUN_QUICK_ENTRY_LIST = [
  {
    id: 'daily',
    title: '每日一练',
    icon: 'calendar',
    iconColor: '#3A76F0',
    bgColor: '#EDF4FF',
    gradient: 'linear-gradient(135deg, #3A76F0 0%, #5B9BFF 100%)',
    badge: '',
  },
  {
    id: 'hotspot',
    title: '热点素材',
    icon: 'notification',
    iconColor: '#FF6B35',
    bgColor: '#FFF1EB',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8F53 100%)',
    badge: '',
  },
  {
    id: 'expression',
    title: '规范表述',
    icon: 'edit',
    iconColor: '#7B66FF',
    bgColor: '#F2F0FF',
    gradient: 'linear-gradient(135deg, #7B66FF 0%, #9D8AFF 100%)',
    badge: '',
  },
  {
    id: 'papers',
    title: '历年真题',
    icon: 'file',
    iconColor: '#FF8A3D',
    bgColor: '#FFF5EB',
    gradient: 'linear-gradient(135deg, #FF8A3D 0%, #FFB366 100%)',
    badge: '',
  },
  {
    id: 'mock',
    title: '限时训练',
    icon: 'chart',
    iconColor: '#00C18E',
    bgColor: '#E6FFF5',
    gradient: 'linear-gradient(135deg, #00C18E 0%, #00E5A8 100%)',
    badge: '',
  },
]

const EXAM_MODE_CARDS = [
  {
    id: 'special',
    name: '专项考试',
    bgColor: '#FFF3EB',
    textColor: '#B97A40',
  },
  {
    id: 'hybrid',
    name: '混合考试',
    bgColor: '#F1EEFF',
    textColor: '#6A63D9',
  },
  {
    id: 'full',
    name: '全套考试',
    bgColor: '#ECF5FF',
    textColor: '#4E93E8',
  },
]

const PRACTICE_SETTINGS = {
  questionCount: 5,
  min: 5,
  max: 100,
  year: 'all',
  yearOptions: [
    { id: 'all', label: '不限' },
    { id: '3y', label: '近3年' },
    { id: '5y', label: '近5年' },
    { id: '10y', label: '近10年' },
  ],
  difficulty: 'all',
  difficultyOptions: [
    { id: 'all', label: '不限' },
    { id: 'easy', label: '简单' },
    { id: 'medium', label: '中等' },
    { id: 'hard', label: '困难' },
  ],
}

const QUESTION_SETTINGS = {
  duration: 10,
  durationMin: 0,
  durationMax: 120,
  durationStep: 5,
  totalCount: 20,
  countOptions: [10, 20, 30, 40, 50],
  mode: 'auto',
  manualConfigs: [],
  min: 5,
  max: 50,
  step: 5,
}

const TAB_DISPLAY_CONFIG = {
  enabledSubjectIds: ['xingce', 'shenlun'],
}

export function getHomeConfig() {
  return clone({
    examTypes: EXAM_TYPES,
    subjectTabs: SUBJECT_TABS,
    bannerList: BANNER_LIST,
    swiperList: SWIPER_LIST,
    quickEntryList: QUICK_ENTRY_LIST,
    examModeCards: EXAM_MODE_CARDS,
    practiceSettings: PRACTICE_SETTINGS,
    questionSettings: QUESTION_SETTINGS,
    tabDisplayConfig: TAB_DISPLAY_CONFIG,
    swiperAssets: BANNER_LIST.map((item) => ({
      value: TRANSPARENT_IMAGE,
      ariaLabel: `${item.title}${item.highlight}`,
    })),
  })
}

export function getShenlunQuickEntries() {
  return clone(SHENLUN_QUICK_ENTRY_LIST)
}

export function getExamTypeByName(name) {
  return clone(EXAM_TYPES.find((item) => item.name === name) || EXAM_TYPES[0])
}
