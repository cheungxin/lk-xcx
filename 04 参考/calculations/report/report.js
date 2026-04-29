/*页面引用*/
import $ from '../../toolbox/tool'
import router from '../../router/index'
/*云开发*/
import Model from '../../model/index';
const model = new Model()

/*页面全局变量*/
const app = getApp()
const { statusBarHeight, titleBarHeight, navigationBarHeight } = app.globalData;
const static_url = 'https://wqianc.com/dashujiaoyu/upload/xcx/report/'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight, titleBarHeight, navigationBarHeight,
    static_url,
    examName: '刷题测验情况',
    userName: '用户昵称',
    user_head_url: 'https://wqianc.com/dashujiaoyu/upload/img/xcx/my/headPicture.jpg',
    exceed: '00.00%',
    correctRate: 20,
    questionAllNum: 0,
    correctNum: 0,
    userRank: 0,
    userCounts: 0,
    answerTime: '2023-01-01 17:00:53',
    answerUseTime: '00:00:00',
    lastPage: 'index'
  },
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
    const $this = this
    try {
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('userReport', function (data) {
        const { answerStatus, answerTime, examName, examSortName, questionAllNum, correctNum ,answerUseTime} = data.answerData
        let correctRate = ((correctNum / questionAllNum) * 100).toFixed(2);
        $this.setData({ answerStatus, answerTime, examName, examSortName, correctRate, questionAllNum, correctNum, answerData: data.answerData,answerUseTime})
        const {
          firstSerial,
          firstSort,
          secondSerial,
          secondSort,
          questionLists,
          functionType,
        } = data 
        $this.setData({ firstSerial, firstSort, secondSerial, secondSort, questionLists, functionType })
        if (data.page) { $this.setData({ lastPage: data.page }) }
      })
    } catch (error) { console.log(error) }
  },
  formatTime(time) {
    const minute = Math.floor((time % 3600) / 60)
    const second = time % 60
    return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
  },
  goAnalysis() { },
  async onClickLeft() {
    const $this = this
    const { lastPage } = $this.data
    if (lastPage === 'calculate_exam') {
      let res = await $.modal('', '是否返回首页')
      if (res === '确认') {
        router.redirectTo('calculations')
      } else $.toast('已取消') //取消选择
    } else router.backTo();
  },
  //获取答题详情
  async getAnswerDetailList(answerId, type, userPhone) { },
  //全部错题 && 答题情况
  async getExamSituation(e) {
    const $this = this
    const { firstSerial, firstSort, secondSerial, secondSort, functionType, questionLists } = $this.data
    let examData = {
      firstSerial,
      firstSort,
      secondSerial,
      secondSort,
      functionType
    }
    if (e.currentTarget.dataset.type === 'wrongs') {
      examData.questionLists = questionLists.filter(item => !item.isCorrect)
    } else {
      examData.questionLists = questionLists
    }
    router.push('calculate_analysis', {}, res => {
      res.eventChannel.emit('calculate_analysis', {
        examData
      })
    })
  },
  //调用函数
  async getQuestionList(questionNumbers, examId) { },   /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() { },
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