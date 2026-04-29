/*页面引用*/
import Api from '../../interface/request'
import request from '../../interface/request-v2';
import $ from '../../toolbox/tool'
import router from '../../router/index'
/*云开发*/
import Model from '../../model/index';
const model = new Model()

/*页面全局变量*/
const app = getApp()
const { statusBarHeight, titleBarHeight, navigationBarHeight } = app.globalData;
const staticUrl = 'https://wqianc.com/dashujiaoyu/upload/xcx/report/'

//简道云表单ID
const app_id = '632eba7e35faf20008ef9e45'
const testpoints_id = '63f31a71acea4d0008294091'    //考点管理ID 
const history_entry_id = '640ec4643efbd100081ce498'  //历史答题记录ID
const question_entry_id = '6406b53542490b00078a5b81'     //组题明细题目ID

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight, titleBarHeight, navigationBarHeight,
    staticUrl,
    title: '答题报告',
    report_title: '刷题测验情况',
    userName: '用户昵称',
    user_head_url: 'https://wqianc.com/dashujiaoyu/upload/img/xcx/my/headPicture.jpg',
    exceed: '00.00%',
    correctRate: 0,
    userScores: 0,
    finalScore: 0,
    questionAllNum: 0,
    correctNum: 0,
    currentRanking: '0/0', 
    answerTime: '2023-01-01 17:00:53',
    answerUseTime: '00:00:00',
    lastPage: 'index'
  },
  /**
   * 生命周期函数--监听页面加载
   */ 
  // 数组转换为树形结构数据
 
  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  },
  async onLoad(options) {
    try {
      // 优先处理URL参数
      if (options && options.examId) {
        // 通过URL参数接收数据
        const reportData = {
          examId: options.examId,
          examName: decodeURIComponent(options.examName || ''),
          stageName: decodeURIComponent(options.stageName || ''),
          planName: decodeURIComponent(options.planName || ''),
          page: options.page || ''
        };
        console.log('通过URL参数接收报告数据:', reportData);
        await this.initPage(reportData.examId);
        this.setData({ 
          examName: reportData.examName, 
          stageName: reportData.stageName,
          planName: reportData.planName,
          examId: reportData.examId,
          lastPage: reportData.page
        });
      } else {
        // 兼容eventChannel方式
        const eventChannel = this.getOpenerEventChannel();
        if (eventChannel && typeof eventChannel.on === 'function') {
          eventChannel.on('userReport', async (data) => {
            console.log('通过eventChannel接收报告数据:', data);
            if (data && data.examId) {
              await this.initPage(data.examId);
              this.setData({ 
                examName: data.examName, 
                stageName: data.stageName,
                planName: data.planName,
                examId: data.examId,
                lastPage: data.page
              });
            } else {
              console.error('eventChannel数据格式错误:', data);
              this.showErrorAndGoBack('数据格式错误');
            }
          });
        } else {
          console.error('无法获取报告数据，缺少URL参数和eventChannel');
          this.showErrorAndGoBack('数据获取失败');
        }
      }
    } catch (error) {
      console.error('页面加载失败:', error);
      this.showErrorAndGoBack('页面加载异常');
    }
  },

  // 显示错误信息并返回上一页
  showErrorAndGoBack: function(message) {
    $.toast(message);
    setTimeout(() => {
      router.backTo();
    }, 1000);
  },
  async initPage(examId){
    const $this = this   
    const reportData =  await   $this.getUserReport(examId) 
    let treeNodes = reportData.treeNodes
     $this.setData({ treeNodes })
       const {answerUseTime,correctNum,answerTime,finalScore,questionAllNum,currentRanking,userScores,correctRate} = reportData 
     $this.setData({   
        examId,
        questionAllNum,
        correctRate, 
        correctNum, 
        answerUseTime, 
        answerTime,
        userScores, 
        finalScore,  
        currentRanking, 
         treeNodes 
     }) 
  },
  async getUserReport(examId) { 
    const {className, userPhone } = wx.getStorageSync('studentInfos') 
    const data = {
      "className": className,
      "examId": examId,
      "userPhone": userPhone
    } 
    const resData = await  request('POST', '/answerKc/getAnswerReport', data ) 
    if(resData.data.code === 200) {
      return resData.data.data
    }else { return $.toast('获取报告数据失败') }
  },
  async goAnalysis(e) { 
    console.log(e)
     const $this = this
     const { examLevel, examPoint } = e.detail
     console.log(examLevel, examPoint)
     const { examId,examName,
      planName,
      stageName } = $this.data
     const userPhone = wx.getStorageSync('studentInfos').userPhone  
     let data = {
      examId,
      examLevel,
      examPoint,
      userPhone
     }
     const resData = await request('POST', '/answerKc/getQuestAnswerExamPointDetail', data)
    if (resData.data.code === 200) {  
      let analysisLists = resData.data.data;
      let page = 'report'
      router.push('analysis', {}, res => {
        res.eventChannel.emit('userAnswer', {
          analysisLists,
          examId,
          examName,
          planName,
          stageName, 
          title:"答题明细",
          page
         })
      })
    }else { return $.toast('获取考点详情失败') }  
  },
  async onClickLeft() {
    const $this = this
    const { lastPage } = $this.data
    if (lastPage === 'exam') {
      let res = await $.modal('', '是否返回首页')
      if (res === '确认') {
        router.reLaunch('index')
      } else $.toast('已取消') //取消选择
    } else router.backTo();
  },
  //全部错题 && 答题情况
  async getExamSituation(e) {
    const $this = this
    const { examId,examName,stageName,planName} = $this.data
    const { userPhone } = wx.getStorageSync('studentInfos') 
    let queryType ; 
    const chooseType = e.currentTarget.dataset.type
    if (chooseType === 'all') {    queryType = 0 }
    else if (chooseType === 'wrongs') {  queryType = 1 }  
    let  analysisLists = await $this.getAnalysisList(examId,queryType,userPhone)  
    if ( analysisLists.length === 0) { return $.toast('题目请求失败') }
    let page = 'report'
    router.push('analysis', {}, res => {
      res.eventChannel.emit('userAnswer', { 
        analysisLists,
        examId,
        examName,
        planName,
        stageName, 
        title: chooseType === 'all' ? '答题明细' : '全部错题',
        page
      })
    })
  },
  //调用函数 
  async getAnalysisList(examId,queryType,userPhone) { 
    // 页面中使用的字段 
    let data = {  examId,queryType,userPhone  }
    let resData = await request('POST', '/answerKc/getQuestAnswerDetail',data) 
    if (resData.data.code == 200) {
        let questionLists = resData.data.data;    
        return questionLists;
      } else {
        $.toast('题目请求失败，请重试');
      }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {  
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() { },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() { },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() { },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() { },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() { },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() { }
})