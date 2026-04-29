import request from '../../interface/request-v2'
import $ from '../../toolbox/tool'
import router from '../../router/index'
import time from '../../toolbox/time'
//获取小程序全局
const app = getApp()
  
const{ navigationBarHeight,clientHeight,screenHeight } = app.globalData

Page({ 
    data: {
        showSituation:false, 
        navigationBarHeight,
        clientHeight, 
        screenHeight,
        nowQuestionIndex:0,
        textSize:2,
        title:'解析',
        isMore:false,
        tabBar: {
            list: [
                {
                    "text": "上一题",
                    "icon": "icon-arrow-left"
                },
                {
                    "text": "下一题",
                    "icon": "icon-arrow"
                },
                {
                    "text": "答题卡",
                    "icon": "icon-sheets"
                }, 
                {
                    "text": "更多",
                    "icon": "icon-apps-o"
                }
            ]
        }
    },
    //调用函数 
    //底部导航栏切换
    async switchTab(e){
        const $this = this 
        const tabtxt = e.currentTarget.dataset.text; 
        let {nowQuestionIndex,questionAllNum,showSituation,isMore,analysisLists} = $this.data  
        switch (tabtxt) {
            case '上一题':
                nowQuestionIndex>0?$this.setData({nowQuestionIndex:nowQuestionIndex-1}):$.toast('已经是第一题了');
                break;
            case '下一题':
                (nowQuestionIndex<questionAllNum-1)?$this.setData({nowQuestionIndex:nowQuestionIndex+1}):$.toast('没有题目了'); 
                break;
            case '答题卡': 
            $this.setData({showSituation:!showSituation}) 
                break;
            case '交卷':
            $this.submitAnwser()     
                break;
          case '更多':    
          $this.setData({isMore:!isMore})    
                break;    
            }  
   },         
    async onLoad(options) {
        const $this = this
        const phone =  wx.getStorageSync('userInfo').phone 
        const className =  wx.getStorageSync('studentInfos').className 
        if(!options.scene){ 
            try {
            let answers = []
            const eventChannel = $this.getOpenerEventChannel() 
            eventChannel.on('userAnswer', async function(data) { 
              const { 
                analysisLists,
                examId,
                examName,
                planName,
                stageName,  
                page
               } = data  
                if(page==='report'){
                    
                }else{
                    
                }  
                $this.setData({ 
                 analysisLists,   
                 examId,
                 planName,
                 examName,
                 stageName, 
                 questionAllNum:analysisLists.length,  
              })
            })
            } catch (error) {
                console.log(error)
            } 
        }else{    
            
        } 
    },
    //获取用户选中项 
     //切换下一题
     switchNext(e) {  
        const $this = this
        if ($this.data.nowQuestionIndex !== e.detail.current) {
            $this.setData({
                nowQuestionIndex: e.detail.current
            })
        }
        // 获取swiper-item高度
        wx.createSelectorQuery().selectAll('.item-box').boundingClientRect(res => {
        const swiperHeight = Math.max(...res.map(item => item.height))
        this.setData({ swiperHeight })
      }).exec()
    },
    getQuestion(e){
        const $this = this
        let nowQuestionIndex = e.detail 
        $this.setData({ nowQuestionIndex,showSituation:false})
    }, 
     //载入准备工作    
    onReady() {  
       const isLogin =  wx.getStorageSync('isLogin') 
       if(!isLogin){ 
        $.toast('该页面需登录后才能使用') 
        router.push('login');
      }
    }, 
    //更多
    onClose(){
        const $this = this 
        const { isMore } = $this.data
        $this.setData({ isMore:!isMore })
    },
    onChangeText(e) { 
        const $this = this  
        $this.setData({ textSize:e.detail })
    },
    //收藏状态判断 
    //收藏
    async collect(e){
        const $this = this 
        const { analysisLists,examName,stageName,examId,planName } = $this.data
        const index = e.currentTarget.dataset.index
        const currentQuestion = analysisLists[index]
        if(currentQuestion.isCollected){ 
            let resData = await request('post', '/questCollectKc/deleteQuestCollect', { collectId:analysisLists[index].collectId } )  
            if(resData.data.code===200){
                $.toast('取消收藏成功')
                analysisLists[index].isCollected = false 
                $this.setData({ analysisLists })
            }else{
                 $.toast('取消收藏失败：'+resData.data.msg)
            }
        }else{
            const { questionNumber, questionId,examPoint,testpoint1st,testpoint2nd,testpoint3rd,testpoint4th,testpoint5th,} = analysisLists[index] 
            // 题型：优先从当前题获取，如缺失则保持为 undefined（后端自处理或前端后续完善）
            const questionChoiceType = currentQuestion.questionChoiceType
            const testpointMin = examPoint
            const collectTime = time.getCurrentTime()    
           const wxOpenid =  wx.getStorageSync('userInfo')._openid
           const {className,userName,userPhone} = wx.getStorageSync('studentInfos')  
            let data = {
                className,
                collectTime,
                examId,
                examName,
                "examType": "公职类",
                "examTypeId": "gwy",
                planName,
                questionId,
                questionNumber,
                stageName,
                questionChoiceType,
                testpoint1st,
                testpoint2nd,
                testpoint3rd,
                testpoint4th,
                testpoint5th,
                testpointMin,
                userName,userPhone,
                wxOpenid
              }
            let resData = await request('post', '/questCollectKc/addQuestCollect', data )   
            if(resData.data.code===200){
                $.toast('收藏成功')
                analysisLists[index].isCollected = true
                analysisLists[index].collectId =  resData.data.data.collectId
                $this.setData({ analysisLists })
            }else{
                $.toast('收藏失败')
            }
        } 
    },  
    onClickLeft(){
      router.backTo();
    },
    previewImage(e) {
        console.log(e)
        const imageUrl = e.currentTarget.dataset.url
         wx.previewImage({
           urls: [imageUrl], // 图片地址列表
           current: imageUrl // 当前显示图片的链接
         })
     },
     toggleCollapse(event) {
        this.setData({
            collapsed: !this.data.collapsed
          });
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
    onUnload() {  }, 
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {  }, 
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {  }, 
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})