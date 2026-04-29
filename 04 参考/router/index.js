import $ from '../toolbox/tool'
const app = getApp()
/*pages*/
const pages = {
  /*通用部分*/
  index: '/pages/index/index', 
  login:'/components/login/login',
  privacy: '/components/privacy/privacy',
  webview: '/pages/webview/webview',
  contact: '/pages/contact/contact', 
  /*用户中心*/
  improve: '/pages/user/improve/improve',
  announcement:'/pages/announcement/announcement',
  announcementcollection:"/pages/announcementcollection/announcementcollection",
  position:'/pages/position/position', 
  overyears:"/pages/overyears/overyears",
  courriculum:'/pages/curriculum/courriculum',
  education:'/pages/education/education',
  addeducation:'/pages/addeducation/addeducation',
  jobcomparison:"/pages/jobcomparison/jobcomparison",
  collect:"/pages/collect/collect",
  joblist:"/pages/joblist/joblist",
  message:"/pages/message/message", 
  myCourse:"/pages/myCourse/myCourse",
  feedback:"/pages/feedback/feedback",
  answers:"/pages/answers/answers",
  questionwriter:"/pages/questionwriter/questionwriter",
  Intelligentanswer:"/pages/Intelligentanswer/Intelligentanswer",
  questionanswer:"/pages/questionanswer/questionanswer",
  smartrecharge:"/pages/smartrecharge/smartrecharge",
  shoplist:"/pages/shoplist/shoplist",
  shopdetail:"/pages/shopdetail/shopdetail",
  resume:"/pages/resume/resume",
  curriculumvitae:"/pages/curriculumvitae/curriculumvitae",
  positionlist:"/pages/positionlist/positionlist",
  jobhistory:"/pages/jobhistory/jobhistory",
  unithistory:"/pages/unithistory/unithistory"
}
export default {
  //自定义导航栏跳转
  switchTab(url, callback = () => { }) {
    wx.switchTab({
      url: pages[url] || url,
      success: callback,
      fail: (res) => { $.toast('暂未开放'); }
    })
  },
  //页面跳转
  push(url, events = {}, callback = () => { }) {
    const pageUrl = pages[url] || url;
    //事件参数也不能太大，建议把它控制在几十个字符以内 获取为 options=events 
    wx.navigateTo({
      url: pageUrl,
      events,
      success: callback, fail: () => {
        $.toast('暂未开放');
      }
    });
  },
  //重新定向
  redirect(url, events = {}, callback = () => { }) {
    const pageUrl = pages[url] || url;
    //事件参数也不能太大，建议把它控制在几十个字符以内 获取为 options=events 
    wx.redirectTo({
      url: pageUrl,
      events,
      success: callback, fail: () => {
        $.toast('暂未开放');
      }
    });
  },
  //页面跳转参数
  pushParam(url, parameter, events = {}, callback = () => { }) {
    const pageUrl = pages[url] || url;
    wx.navigateTo({
      url: pageUrl + parameter,
      events,
      success: callback,
      fail: () => {
        $.toast('暂未开放');
      }
    });
  },
  //返回
  backTo(delta) {
  
    wx.navigateBack({ delta })
  },
  //关闭当前页面,跳转到另外一个页面
  redirectTo(url) {
    wx.redirectTo({ url: pages[url] })
  },
  //跳转主页
  reLaunch(url) {
    wx.reLaunch({ url: pages[url] })
  },
  //跳转WebPage
  toWebview(link, title) {
    this.push('webview', {}, res => {
      res.eventChannel.emit('webView', {
        url: link,
        title
      })
    })
  },
  //跳转Read
  toRead(link, title) {
    this.push('webview', {}, res => {
      res.eventChannel.emit('webView', {
        url: '' + link, //
        title
      })
    })
  },
  //百度网盘
  toBaiduNetPan(page) {
    wx.navigateToMiniProgram({
      appId: 'wxdcd3d073e47d1742',
      path: page,
      fail: err => {
        err.errMsg == 'navigateToMiniProgram:fail cancel' ? $.toast('已取消跳转百度网盘') : ''
      }
    })
  }
}



