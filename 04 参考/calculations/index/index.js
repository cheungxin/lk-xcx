/*页面引用*/
import $ from '../../toolbox/tool'
import router from '../../router/index'
import getQuestion from './questions' 
import directorys from './directorys'

/*页面全局变量*/
const app = getApp()
const { statusBarHeight, titleBarHeight, navigationBarHeight,clientWidth,clientHeight } = app.globalData;
const static_url = 'https://wqianc.com/dashujiaoyu/upload/xcx/index/'
 
Page({
  data: {
    static_url, statusBarHeight, titleBarHeight, navigationBarHeight, clientWidth,
    isSetNumber:false,
    numberList: [5, 10, 15, 20], 
    problemsNumber: 0,
    //历史按钮位置
    historyPosLeft: -5,
    historyPosTop: clientHeight-170, //距离底部120px的位置
  }, 
  onLoad(options){    
    const  { problemsNumber } = wx.getStorageSync('calculation')
    //获取分类列表
    this.setData({ directorys,problemsNumber })
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  },
  goCalculatePage(e) {
    const {firstSerial,firstSort,secondSerial,secondSort, functionType,uniqueId} = e.currentTarget.dataset 
    const { problemsNumber } = this.data 
    if (!getQuestion[functionType]) { return $.toast('题库补充中 敬请期待') }
    let questionLists = getQuestion[functionType](problemsNumber?problemsNumber:10) //默认10道题
    let examData = {
      uniqueId,
      firstSerial,firstSort,secondSerial,secondSort, functionType, 
      questionLists
    }   
    //避免路由跳转后 页面数据丢失 
    router.push('calculate_exam', {}, res => {
        res.eventChannel.emit('calculate_exam', { 
          examData
        })
      }) 
  },
  onConfirm(event) {
    this.setData({
      show: false,
      date: this.formatDate(event.detail),
    });
  },
  getPopup(){
    this.setData({
      isSetNumber:!this.data.isSetNumber
    })
  },
  onClosePopup(){
    this.setData({
      isSetNumber:false
    })
  },
  selectNumber(e) {
    let idx = e.currentTarget.dataset.idx
    let  problemsNumber =  this.data.numberList[idx]
    this.setData({ problemsNumber })
    wx.setStorageSync('calculation', {problemsNumber})
  },
  goHistory(){
     router.push('calculate_history')
  }, 
dragCart(event) { 
    // 更新位置
    let newLeft = parseInt(event.touches[0].clientX)  
    const newBottom = parseInt( event.touches[0].clientY)  
    if(newLeft>clientWidth-20){
      newLeft = clientWidth-20
    }
    this.setData({ 
      historyPosTop: newBottom, 
    });
},
});
