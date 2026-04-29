const mockCourses = [
  {
    id: 1,
    title: '2026国考行测系统精讲班',
    teacher: '张老师',
    teacherAvatar: '',
    cover: '#4A90D9',
    price: 299,
    originalPrice: 599,
    playCount: 12580,
    chapterCount: 48,
    totalHours: 36,
    rating: 4.9,
    category: 'xingce',
    tag: '热门',
    desc: '系统讲解行测五大模块核心考点，配合真题演练，快速提升解题能力。'
  },
  {
    id: 2,
    title: '申论高分写作特训营',
    teacher: '李老师',
    teacherAvatar: '',
    cover: '#D94A7A',
    price: 199,
    originalPrice: 399,
    playCount: 8960,
    chapterCount: 32,
    totalHours: 24,
    rating: 4.8,
    category: 'shenlun',
    tag: '新课',
    desc: '从素材积累到文章结构，全方位提升申论写作能力。'
  },
  {
    id: 3,
    title: '面试实战模拟班',
    teacher: '王老师',
    teacherAvatar: '',
    cover: '#4AD9A0',
    price: 399,
    originalPrice: 799,
    playCount: 6720,
    chapterCount: 24,
    totalHours: 18,
    rating: 4.9,
    category: 'mianshi',
    tag: '推荐',
    desc: '还原真实面试场景，模拟训练答题思路与表达。'
  },
  {
    id: 4,
    title: '时政热点精讲',
    teacher: '赵老师',
    teacherAvatar: '',
    cover: '#D9A04A',
    price: 0,
    originalPrice: 0,
    playCount: 18920,
    chapterCount: 16,
    totalHours: 12,
    rating: 4.7,
    category: 'shizheng',
    tag: '免费',
    desc: '每月更新最新时政热点，帮助考生把握命题方向。'
  },
  {
    id: 5,
    title: '资料分析速成技巧',
    teacher: '张老师',
    teacherAvatar: '',
    cover: '#6A4AD9',
    price: 99,
    originalPrice: 199,
    playCount: 15340,
    chapterCount: 20,
    totalHours: 15,
    rating: 4.8,
    category: 'xingce',
    tag: '畅销',
    desc: '掌握速算技巧，资料分析正确率提升30%以上。'
  },
  {
    id: 6,
    title: '数量关系突破班',
    teacher: '孙老师',
    teacherAvatar: '',
    cover: '#D94A4A',
    price: 149,
    originalPrice: 299,
    playCount: 7650,
    chapterCount: 18,
    totalHours: 14,
    rating: 4.6,
    category: 'xingce',
    tag: '',
    desc: '突破数量关系难题，掌握代入排除法等高频解题方法。'
  },
  {
    id: 7,
    title: '言语理解强化班',
    teacher: '周老师',
    teacherAvatar: '',
    cover: '#4A7AD9',
    price: 129,
    originalPrice: 259,
    playCount: 11230,
    chapterCount: 22,
    totalHours: 16,
    rating: 4.7,
    category: 'xingce',
    tag: '',
    desc: '系统讲解逻辑填空与片段阅读的核心方法与技巧。'
  },
  {
    id: 8,
    title: '判断推理高分攻略',
    teacher: '吴老师',
    teacherAvatar: '',
    cover: '#D96A4A',
    price: 129,
    originalPrice: 259,
    playCount: 9870,
    chapterCount: 20,
    totalHours: 15,
    rating: 4.8,
    category: 'xingce',
    tag: '好评',
    desc: '图形推理、定义判断、类比推理、逻辑判断全面突破。'
  }
]

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    searchValue: '',
    currentTab: 0,
    categories: [
      { key: 'all', label: '全部课程' },
      { key: 'xingce', label: '行测技巧' },
      { key: 'shenlun', label: '申论写作' },
      { key: 'mianshi', label: '面试指导' },
      { key: 'shizheng', label: '时政热点' }
    ],
    courses: mockCourses,
    filteredCourses: mockCourses,
    loading: false
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: sysInfo.statusBarHeight + 44
    })
  },

  onSearchChange(e) {
    this.setData({ searchValue: e.detail.value })
    this.filterCourses()
  },

  onSearch() {
    this.filterCourses()
  },

  onSearchClear() {
    this.setData({ searchValue: '' })
    this.filterCourses()
  },

  onTabChange(e) {
    this.setData({ currentTab: e.detail.value })
    this.filterCourses()
  },

  filterCourses() {
    const { searchValue, currentTab, categories, courses } = this.data
    const categoryKey = categories[currentTab]?.key || 'all'
    
    let filtered = courses
    if (categoryKey !== 'all') {
      filtered = filtered.filter(c => c.category === categoryKey)
    }
    if (searchValue.trim()) {
      const keyword = searchValue.trim().toLowerCase()
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(keyword) || 
        c.teacher.toLowerCase().includes(keyword)
      )
    }
    this.setData({ filteredCourses: filtered })
  },

  onCourseTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/subpackages/course/detail/detail?id=${id}`
    })
  },

  // 格式化播放次数
  formatPlayCount(count) {
    if (count > 10000) {
      return (count / 10000).toFixed(1) + '万'
    }
    return count
  }
})
