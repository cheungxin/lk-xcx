const mockCourseDetail = {
  1: {
    id: 1,
    title: '2026国考行测系统精讲班',
    teacher: '张老师',
    cover: '#4A90D9',
    price: 299,
    originalPrice: 599,
    playCount: 12580,
    studentCount: 3680,
    rating: 4.9,
    ratingCount: 1286,
    totalHours: 36,
    chapterCount: 48,
    desc: '本课程系统讲解公务员行测考试五大模块（言语理解、数量关系、判断推理、资料分析、常识判断）的核心考点与解题方法。配合历年真题演练，帮助考生建立系统的知识体系，快速提升解题能力。\n\n课程特色：\n1. 考点全覆盖：从基础到进阶，系统梳理所有考点\n2. 方法论导向：不讲题海战术，注重解题思维的培养\n3. 真题精讲：精选近5年国考/省考真题，深度解析\n4. 随堂练习：每节课后配有针对性练习，巩固所学\n\n适合人群：\n- 零基础备考公务员考试的考生\n- 行测分数长期徘徊在60分以下的考生\n- 希望系统提升行测各模块能力的考生',
    chapters: [
      {
        id: 1,
        title: '第一章：言语理解与表达',
        sections: [
          { id: 101, title: '1.1 逻辑填空核心方法', duration: '45:00', free: true },
          { id: 102, title: '1.2 片段阅读技巧精讲', duration: '38:00', free: true },
          { id: 103, title: '1.3 语句排序与衔接', duration: '35:00', free: false },
          { id: 104, title: '1.4 言语理解真题演练', duration: '42:00', free: false }
        ]
      },
      {
        id: 2,
        title: '第二章：数量关系',
        sections: [
          { id: 201, title: '2.1 数字推理规律总结', duration: '40:00', free: false },
          { id: 202, title: '2.2 数学运算高频题型', duration: '48:00', free: false },
          { id: 203, title: '2.3 代入排除法精讲', duration: '36:00', free: false },
          { id: 204, title: '2.4 数量关系真题演练', duration: '44:00', free: false }
        ]
      },
      {
        id: 3,
        title: '第三章：判断推理',
        sections: [
          { id: 301, title: '3.1 图形推理核心考点', duration: '42:00', free: false },
          { id: 302, title: '3.2 定义判断与类比推理', duration: '38:00', free: false },
          { id: 303, title: '3.3 逻辑判断技巧', duration: '45:00', free: false }
        ]
      }
    ]
  }
}

// 默认课程详情（id不存在时使用）
const defaultDetail = {
  id: 0,
  title: '课程详情',
  teacher: '讲师',
  cover: '#4A90D9',
  price: 0,
  originalPrice: 0,
  playCount: 0,
  studentCount: 0,
  rating: 4.8,
  ratingCount: 0,
  totalHours: 0,
  chapterCount: 0,
  desc: '课程简介',
  chapters: []
}

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    courseId: 0,
    course: defaultDetail,
    isFavorited: false,
    expandedChapters: {},
    showCatalog: false
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()
    const courseId = parseInt(options.id) || 0
    const course = mockCourseDetail[courseId] || {
      ...defaultDetail,
      id: courseId,
      title: '示例课程 - 精讲班',
      teacher: '金牌讲师',
      cover: '#6A4AD9',
      price: 199,
      originalPrice: 399,
      playCount: 8888,
      studentCount: 2100,
      rating: 4.8,
      ratingCount: 680,
      totalHours: 20,
      chapterCount: 24,
      desc: '本课程涵盖公务员考试核心知识体系，由资深讲师精心打造，帮助考生高效备考。',
      chapters: [
        {
          id: 1, title: '第一章 基础知识',
          sections: [
            { id: 101, title: '1.1 考试概述与备考策略', duration: '30:00', free: true },
            { id: 102, title: '1.2 核心知识点梳理', duration: '45:00', free: false }
          ]
        }
      ]
    }
    
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: sysInfo.statusBarHeight + 44,
      courseId,
      course
    })
  },

  onFavoriteTap() {
    this.setData({ isFavorited: !this.data.isFavorited })
    wx.showToast({
      title: this.data.isFavorited ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  },

  onStartLearn() {
    const { course } = this.data
    if (course.chapters.length > 0 && course.chapters[0].sections.length > 0) {
      const firstSection = course.chapters[0].sections[0]
      wx.navigateTo({
        url: `/subpackages/course/play/play?courseId=${course.id}&sectionId=${firstSection.id}`
      })
    } else {
      wx.showToast({ title: '暂无课程内容', icon: 'none' })
    }
  },

  toggleChapter(e) {
    const { id } = e.currentTarget.dataset
    const expanded = { ...this.data.expandedChapters }
    expanded[id] = !expanded[id]
    this.setData({ expandedChapters: expanded })
  },

  onSectionTap(e) {
    const { courseid, sectionid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/subpackages/course/play/play?courseId=${courseid}&sectionId=${sectionid}`
    })
  },

  showCatalogPopup() {
    this.setData({ showCatalog: true })
  },

  hideCatalogPopup() {
    this.setData({ showCatalog: false })
  },

  goBack() {
    wx.navigateBack()
  },

  onShareAppMessage() {
    const { course } = this.data
    return {
      title: course.title,
      path: `/subpackages/course/detail/detail?id=${course.id}`
    }
  }
})
