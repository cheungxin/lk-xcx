/*页面引用*/
import request  from '../../interface/request-v2'   
import $ from '../../toolbox/tool'
import router from '../../router/index' 

/*页面全局变量*/
const app = getApp()
const { statusBarHeight, titleBarHeight, navigationBarHeight,clientWidth,clientHeight } = app.globalData;
const static_url = 'https://wqianc.com/static/wqcxcx/index/'
  
/*页面*/
Page({
  /*页面的初始数据 */
  data: {
    static_url, statusBarHeight, titleBarHeight, navigationBarHeight,
    nickname: '我是公考小树',
    avatarUrl: `${static_url}avatar.png`,
    className: null,
    class_rank: '',
    school_rank: '',
    nav_current: 0,
    // 添加tab切换和缓存相关字段
    currentTab: 'incomplete', // 当前选中的tab
    hasLoadedIncomplete: false, // 是否已加载未完成数据
    hasLoadedComplete: false, // 是否已加载已完成数据
    /*导航按钮布局*/
    nowPlateType: '行测', 
    plateLists:['行测','申论', '综D'],
    navbar_list: [],
    aat_list: [{
      data: [
        {
          app_url: "wrongs",
          app_img: `${static_url}icon_wrong.png`,
          app_text: "我的错题"
        }, 
        {
          app_url: "calculations",
          app_img: `${static_url}icon_calculation.png`,
          app_text: "数资速算"
        }, {
          app_url: "exercise_theory",
          app_img: `${static_url}icon_exercise.png`,
          app_text: "政治理论练习"
        }, {
          app_url: "report_index",
          app_img: `${static_url}icon_report.png`,
          app_text: "行测刷题报告"
        }
      ]
    }
    ,{
      data: [
        {
              app_url: "idiom",
          app_img: `${static_url}icon_idiom.png`,
          app_text: "成语积累"
        },
        {
          app_url: "favorites",
          app_img: `${static_url}icon_favorite.png`,
          app_text: "我的收藏"
        }, {
          app_url: "exercise",
          app_img: `${static_url}icon_exercise.png`,
          app_text: "我的刷题"
        },{}
      ]
    }
  ],
  essay_list: [{
    data: [ 
      {
        app_url: "essay",
        app_img: `${static_url}icon_history.png`,
        app_text: "实战模考"
      },
      {
        app_url: "essay_exercise",
        app_img: `${static_url}icon_exercise.png`,
        app_text: "课堂练习"
      },
      {},
      {}
    ]
  } 
],
  zongd_list: [{
    data: [ 
      {
        app_url: "dability",
        app_img: `${static_url}icon_history.png`,
        app_text: "实战模考"
      },
      {
        app_url: "dability_exercise",
        app_img: `${static_url}icon_exercise.png`,
        app_text: "课堂练习"
      },
      {},
      {}
    ]
  } 
],
plateBtnBg:`${static_url}palte-btn-aat.png`,
    dailyData: {
      clockContinueDays: 0,
      clockLatestTime: 0,
      isClock: 0,
      clockTotalDays: 0
    },
    theoryPosLeft:10,
    theoryPosTop:clientHeight-320,
    loadingTaskLists:true,
    skecleton:['100%','100%','40%','10%','100%','40%','90%','100%','60%','30%','100%','100%','50%','80%','100%','20%','100%','70%','100%','100%','70%','100%','50%','80%','100%'],
  },
  goPage(e) {''
    let url = e.currentTarget.dataset.url;
    router.push(url);
  }, 
  async changePlate(e){''
    const $this = this;
    let { plateLists } = this.data;
    let index = e.currentTarget.dataset.index
    $this.setData({navbar_list:[],nav_current:0})
    if(index==0){
      $this.setData({plateBtnBg:`${static_url}palte-btn-aat.png`})
      $this.setData({navbar_list:$this.data.aat_list})
    }
    else if(index==1){
      $this.setData({plateBtnBg:`${static_url}palte-btn-essay.png`})
      $this.setData({navbar_list:$this.data.essay_list})
    }
    else if(index==2){
        $this.setData({plateBtnBg:''}) // Use CSS background
        $this.setData({navbar_list:$this.data.zongd_list})
    }
    const nowPlateType = plateLists[index];
    $this.setData({nowPlateType});  
  },
  //通过手机号获取用户班级信息
  async getMyClass() {
    const $this = this;
    const { phone } = wx.getStorageSync('userInfo') 
    const res = await request('POST', `/questMaUser/getUserClassListByPhone`, {userPhone:phone}) 
    if (res?.data?.code === 200) {
      $.toast('班级数据获取成功！') 
      const classData = res.data.data  
      // 设置班级信息（如果存在）
      if (classData?.length > 0) {
        wx.setStorageSync('userClassInfos', classData)
        wx.setStorageSync('studentInfos', classData[0])
        //更新页面班级信息
        let className = classData[0]?.className
        let userAvatar = classData[0]?.userAvatar
        let userName  = classData[0]?.userName
          // 非班级用户展示昵称
        if (className) {
            $this.setData({ userName: userName, className: className });
        } else {
            $this.setData({ nickname: nickname });
        }  
        //头像处理
        if (userAvatar) {
            $this.setData({ avatarUrl: userAvatar });
        }  
      }else{
        wx.setStorageSync('userClassInfos', [])
        wx.setStorageSync('studentInfos', [])
        return $.toast('班级信息获取失败，请联系班主任添加！')
      }
    } else {
      $.toast('您的手机号未加入班级用户') 
      throw new Error(`登录失败: ${res?.data?.message || '未知错误'}`)
    } 
  },
  initClassInfomations(userClassInfos) { 
    const $this = this; 
    // 提取所有班级的名称并放入一个 Set 中，它会自动去重
    const classNamesSet = new Set();
    userClassInfos.forEach(item => {
      if (item.className) {
        classNamesSet.add({ className: item.className, projectName: item.projectName });
      }
    });
    // 将 Set 转换为数组，然后设置页面班级信息
    const classNamesArray = [...classNamesSet];
    $this.setData({ classInfos: classNamesArray, userClassInfos })
  },
  onChangeCollapse(e) {
    const activeMyPlan = e.detail
    this.setData({ activeMyPlan })
  },
  // 处理tab切换事件
  onTabChange(e) {
    const $this = this;
    const tabName = e.detail.name;
    const { className, hasLoadedIncomplete, hasLoadedComplete } = $this.data;
    
    $this.setData({ currentTab: tabName }); 
    
    // 检查登录状态，未登录则不请求数据
    const isLogin = wx.getStorageSync('isLogin');
    if (!isLogin) {
      return;
    }
    
    const userInfo = wx.getStorageSync('userInfo');
    const { phone } = userInfo; 
    
    // 根据tab名称和缓存状态决定是否需要加载数据
    if (tabName === 'incomplete' && !hasLoadedIncomplete) {
      // 未完成tab，且未加载过数据
      $this.getPlans(className, phone).then(() => {
        $this.setData({ hasLoadedIncomplete: true });
      });
    } else if (tabName === 'complete' && !hasLoadedComplete) {
      // 已完成tab，且未加载过数据
      $this.getCompletions(className, phone).then(() => {
        $this.setData({ hasLoadedComplete: true });
      });
    }
    // 如果已经加载过数据，直接显示缓存的数据，不再请求
  },
  //点击班级切换
  async bindPickerChange(e) {
    const $this = this;
    const { classInfos, userClassInfos } = $this.data
    const { className, projectName } = classInfos[e.detail.value]
    const userInfo = wx.getStorageSync('userInfo')
    const { phone } = userInfo
    $this.setData({
      className: className,
      projectName: projectName,
      // 重置缓存状态，确保切换班级时重新加载数据
      hasLoadedIncomplete: false, 
      hasLoadedComplete: false
    }) 
    //获取未完成列表
    await $this.getPlans(className,phone)
    // 标记数据已加载
    $this.setData({
      hasLoadedIncomplete: true
    })
    //更新小程序端页面缓存的班级记录
    const studentInfos = userClassInfos[e.detail.value] 
    $this.setData({
      className, userName: studentInfos.userName,
      projectName: studentInfos.projectName,
      avatarUrl: studentInfos.userAvatar?studentInfos.userAvatar:$this.data.defaultAvatarUrl, 
    })
    wx.setStorageSync('studentInfos', studentInfos) 
  },
  //获取未完成列表
  async getPlans(className,userPhone) {
    let $this = this
    //如果没有班级信息，则不执行请求操作
    if (!className) {
      return 
    }
    //页面中使用的字段
    let data = {
      className,
      queryType: 0,
      userPhone
  }
  let resData = await request('POST', '/questSet/getQuestSetProgressList', data) 
    if (resData.data.code == 200) {
      let myplans = resData.data.data; 
      $this.setData({ myplans }); 
    }
    else $.toast('未完成列表获取失败，请重试') 
  },
  //获取完成列表
  async getCompletions(className, userPhone) {
    let $this = this 
      //如果没有班级信息，则不执行请求操作
    if (!className) {
      return 
    }
    let data = {
        className,
        queryType: 1,
        userPhone
    }
    let resData = await request('POST', '/questSet/getQuestSetProgressList', data) 
    if (resData.data.code == 200) {
      let completions = resData.data.data; 
      $this.setData({ completions  });
    }
    else $.toast('未完成列表获取失败，请重试')
  },
  async getReport(e) {
    const $this = this
    try {
      const item = e.currentTarget.dataset.item; 
      if (!item || !item.examId) {
        $.toast('数据异常，请重试');
        return;
      }
      //跳转结果页 - 使用URL参数方式传递数据
      const reportParams = `?examId=${item.examId}&examName=${encodeURIComponent(item.examName || '')}&stageName=${encodeURIComponent(item.stageName || '')}&page=index`;
      router.pushParam('report', reportParams);
    } catch (error) {
      console.error('跳转报告页面失败:', error);
      $.toast('跳转失败，请重试');
    }
  },
  goExamPage(e) {
    const examId = e.currentTarget.dataset.examId; 
    // 使用 flatMap 和 find 组合
    const examInfo = this.data.myplans
        .flatMap(plan => plan.examList)
        .find(item => item.examId === examId); 
    if (examInfo) {
        router.push('exam', {}, res => {
            res.eventChannel.emit('examData', {
                examInfo,
                page: 'index'
            })
        })
    }
},
  goDaily() {
    const { dailyData } = this.data
    //跳转结果页
    router.push('daily', {}, res => {
      res.eventChannel.emit('dailyData', {
        dailyData,
        page: 'index'
      })
    })
  },
  /*生命周期-页面加载 */
  async onLoad(options) {  },
  async initPageData(){
    const $this = this;
    // 用户信息
    const userInfo = wx.getStorageSync('userInfo'); 
    // 确保userInfo存在且有phone字段 
    if (!userInfo || !userInfo.phone) {  
      return;
    } 
    const { nickname, phone } = userInfo; 
    // 初始化页面数据 - 根据当前板块类型设置导航列表 
    $this.initPlateType() 
    // 班级信息 
    if (phone) {
        // 获取班级信息
        const userClassInfos = wx.getStorageSync('userClassInfos'); 
        if (userClassInfos) { 
            $this.initClassInfomations(userClassInfos);
        } 
        // 学员信息 - 优先使用缓存，没有则从userClassInfos取第一个
        let studentInfos = wx.getStorageSync('studentInfos');
        if (!studentInfos && userClassInfos && userClassInfos.length > 0) {
            studentInfos = userClassInfos[0];
            wx.setStorageSync('studentInfos', studentInfos);
        }  
        const { userName, className, userPhone ,userAvatar } = studentInfos || {}; 
        // 验证班级学员信息，有本地缓存数据不请求简道云
        if (!userName || !userPhone) {
            $this.getMyClass();
        }
        // 非班级用户展示昵称
        if (className) {
            $this.setData({ userName: userName, className: className });
        } else {
            $this.setData({ nickname: nickname });
        }  
        //头像处理
        if (userAvatar) {
            $this.setData({ avatarUrl: userAvatar });
        }  
        // 先执行 getDailyData，但不等待它完成
        $this.getDailyData().catch(error => {
            // 如果 getDailyData 失败，可以在这里处理错误，但不影响后续操作
            console.error('每日打卡接口获取:', error);
        }); 
        // 初始化时只加载未完成数据（默认显示的tab）
        $this.getPlans(className, phone).then(() => {
            $this.setData({ 
                loadingTaskLists: false,
                hasLoadedIncomplete: true 
            });
        }).catch(error => {
            console.error('获取行测未完成列表失败:', error);
            $this.setData({ loadingTaskLists: false });
        });
    } else {
        $this.setData({ loadingTaskLists: false });
    }
  },
  initPlateType (){ 
       const $this = this;
       // 从本地存储获取上次选择的板块类型
       const savedPlateType =  $this.data.nowPlateType;
       if (savedPlateType === '行测') {
         $this.setData({ 
           navbar_list: $this.data.aat_list,
         });
       } else if (savedPlateType === '申论') {
         $this.setData({ 
           navbar_list: $this.data.essay_list,
         });
       } else if (savedPlateType === '综D') {
         $this.setData({ 
            navbar_list: $this.data.zongd_list,
          });
       }
  }, 
  //功能区切换
  swiperChange: function (e) {
    const $this = this;
    if (e.detail.source == 'touch') {
      $this.setData({
        nav_current: e.detail.current,
      })
    }
  },
  //登陆
  async login() {
    const $this = this;
    const isLogin = wx.getStorageSync('isLogin')
    if (isLogin) {
      const app = getApp()
      if (app.globalData && app.globalData.authReady) {
        await app.globalData.authReady
      }
      await $this.getMyClass()
      await $this.initPageData()
    } else {
      // 先尝试静默登录，节省 getPhoneNumber 调用次数
      wx.showLoading({ title: '正在登录...', mask: true })
      
      try {
        const wxlogin = require('../../utils/wxlogin').default
        const result = await wxlogin.trySilentLogin()
        console.log('静默登录结果:', result)
        wx.hideLoading()
        
        if (result.success) {
          // 静默登录成功，老用户无需授权手机号
          $.toast('欢迎回来！')
          await $this.getMyClass()
          await $this.initPageData()
          return
        }
        
        if (result.needAuth) {
          // 新用户，需要跳转授权页
          $.toast('请授权手机号完成登录')
          setTimeout(() => {
            router.pushParam('login', '?page=index')
          }, 1500)
          return
        }
        
        // 其他错误
        $.toast(result.message || '登录失败，请重试')
      } catch (e) {
        wx.hideLoading()
        console.error('静默登录异常:', e)
        $.toast('网络异常，请重试')
      }
    }
  },
  async getDailyData() {
    const $this = this;
    let url = '/user/getQuestUserByUserPhone'
    let method = 'POST'
    const userPhone = wx.getStorageSync('userInfo').phone
    let data = { userPhone }
    let result = await request(method,url,data)
    if (result.data.code === 200) {
      let dailyData = result.data.data
      $this.setData({ dailyData })
    } else {
      $.toast('打卡数据发生错误 请重试')
    }
  },
  /*生命周期-页面初次渲染完成*/
  onReady() { },
  /*生命周期-监听页面显示*/
  async onShow() { 
    const $this = this;  
    
    // 检查登录状态，未登录则不请求数据
    const isLogin = wx.getStorageSync('isLogin');
    if (!isLogin) {
      $this.setData({ loadingTaskLists: false });
      $this.initPlateType();
      return;
    }
    
    // 初始化页面数据
    $this.initPageData();
   },
  /*生命周期-页面隐藏*/
  onHide() { },
  /*生命周期-页面卸载*/
  onUnload() { },
  dragCart(event) { 
    // 更新位置
    let newLeft = parseInt(event.touches[0].clientX)  
    const newBottom = parseInt( event.touches[0].clientY)  
    if(newLeft>clientWidth-20){
      newLeft = clientWidth-20
    }
    this.setData({
      theoryPosLeft: newLeft,
      theoryPosTop: newBottom, 
    });
},
  /*页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh() {
    // Json 中已禁止下拉刷新列表  "enablePullDownRefresh": true 
    this.onLoad()
  },
  /*页面上拉触底事件的处理函数*/
  onReachBottom() { },
  /*页面滚动*/
  onPageScroll: function (e) {
    const $this = this;
    if (e.scrollTop >= $this.data.navigationBarHeight) {
      $this.setData({ show_navigationbar: true })
    } else {
      $this.setData({ show_navigationbar: false })
    }
  },
  /*用户点击右上角分享*/
  onShareAppMessage() { },  
})
