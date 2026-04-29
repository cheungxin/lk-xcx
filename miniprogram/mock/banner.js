/**
 * Mock数据 - Banner数据
 */
export const BANNERS = [
  {
    id: 1,
    image: 'https://imgcdn.tuwind.com.cn/mini/banner1.jpg',
    title: '国考备考指南',
    link: '/pages/index/index',
    type: 'internal'
  },
  {
    id: 2,
    image: 'https://imgcdn.tuwind.com.cn/mini/banner2.jpg',
    title: '省考历年真题',
    link: '/subpackages/course/list/list?mode=historical-papers',
    type: 'internal'
  },
  {
    id: 3,
    image: 'https://imgcdn.tuwind.com.cn/mini/banner3.jpg',
    title: '事业单位备考',
    link: '/subpackages/course/list/list?mode=historical-papers',
    type: 'internal'
  }
]

/**
 * 获取所有Banner
 */
export function getBanners() {
  return BANNERS
}
