import request from '../../interface/request-v2'
import $ from '../../toolbox/tool'
import time from '../../toolbox/time'
import router from '../../router/index'
import mockData from './mockData.js'
/*云开发*/
import Model from '../../model/index';
const model = new Model()
//获取小程序全局
const app = getApp() 

let timerId // 定时器 ID
let answerUseSecond = 0 // 记录答题时间（秒）
let timeStr = '00:00:00' // 显示在页面上的计时器格式字符串

const{ statusBarHeight,navigationBarHeight,clientHeight,screenHeight } = app.globalData

Page({
    data: {
        skecleton:['100%','40%','10%','100%','40%','90%','100%','60%','30%','100%','100%','50%','80%','100%','20%','100%','70%','100%','100%','70%','100%','50%','80%','100%'],
        questionLists: [], // 问题列表
        nowQuestionIndex: 0, // 当前问题编号 默认是swiper的index
        answerTime: '00:00:00', // 答题时间
        timer: null, // 定时器
        showSheet: false, // 是否展示答题卡
        sheetLists: [], //
        statusBarHeight,
        collapsed:true,
        navigationBarHeight,
        loading: true,
        screenHeight,
        clientHeight, 
        mode:'', 
        textSize:2,
        isMore:false,
        isSubmitting: false, // 是否正在提交答案
        gotOptionCount:0, //默认起始值  监听页面 nowQuestionIndex 根据nowQuestionIndex 做响应选项数据
        examName:'答题卡',
        swiperHeight: 0, // swiper高度
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
                    "text": "交卷",
                    "icon": "icon-submit"
                },
                {
                    "text": "更多",
                    "icon": "icon-apps-o"
                }
            ]
        },

    },
    
    // 防止重复点击的标志
    isSelecting: false,
    isSwitching: false,
    examInfo: {},
    renderTimestamp: 0, // 条件渲染时间戳，用于触发重新渲染
    
    // 更新屏幕信息
     updateScreenInfo() {
         const $this = this;
         try {
             const windowInfo = wx.getWindowInfo();
             const { windowHeight, windowWidth } = windowInfo; 
             // 重新计算屏幕高度
             $this.setData({
                 screenHeight: windowHeight,
                 clientHeight: windowHeight
             });  
         } catch (error) {
             console.error('获取屏幕信息失败:', error);
         }
     },
    
    // 监听页面尺寸变化
    onResize(res) { 
        const $this = this; 
        // 延迟更新，确保DOM渲染完成
        setTimeout(() => {
            $this.updateScreenInfo(); 
            // 如果数据已加载完成，重新触发swiper渲染
            if (!$this.data.loading && $this.data.questionLists.length > 0) {
                $this.setData({
                    mode: '', // 临时切换模式
                    loading: true,
                }); 
                setTimeout(() => {
                    $this.setData({
                        loading: false,
                        mode: 'A' // 恢复正常模式
                    });
                }, 100);
            }
        }, 200);
    }, 
    //调用函数
    async getExamList(examId) {
        const $this = this
        // 页面中使用的字段 
        let data = {    examId  }
        try {
            let resData = await request('POST', '/questSet/getQuestSetDetailList',data) 
            if (resData.data.code == 200) {
                let questionLists = resData.data.data;
        $this.setData({ 
            questionLists,
            questionCount: questionLists[0].questionCount,
            examName: questionLists[0].examName 
        }); 
        setTimeout(()=>{
            $this.setData({
                loading: false, // 数据加载完成后关闭骨架屏
                mode:"A"})
        },500)
        $this.creatAnswerSheet(questionLists);
            } else {
                $.toast('题目请求失败，请重试');
            }
        } catch (error) {
            console.error('获取题目列表失败:', error);
            $.toast('网络请求失败，请重试');
        }
    },  
     async getMockExamList() {
        const $this = this
        // 页面中使用的字段  
       let questionLists = mockData.data
        $this.setData({ 
            questionLists,
            questionCount: questionLists[0].questionCount,
            examName: questionLists[0].examName 
        }); 
        setTimeout(()=>{
            $this.setData({
                loading: false, // 数据加载完成后关闭骨架屏
                mode:"A"})
        },500)
        $this.creatAnswerSheet(questionLists);
    },  
    /*遍历查询值返回新数组*/
    replaceObjectInArray(inputArray, newObj) {
        let outputArray = [];
        inputArray.forEach((obj) => {
            if (obj["questionNumber"] === newObj["questionNumber"]) {
                outputArray.push(newObj);
            } else {
                outputArray.push(obj);
            }
        });
        return outputArray;
    }, 
    async selectOption(e) { 
        const $this = this 
        const {nowQuestionIndex,sheetLists,questionCount} = $this.data;
        
        // 防止重复点击和快速点击
        if ($this.isSelecting) {
            return;
        }
        $this.isSelecting = true;
        
        const { sequenceNumber, questionNumber,questionId,isCorrect, questionOption,score,correctAnswer,examPoint,
            testpoint1st,
        testpoint2nd,
        testpoint3rd,
        testpoint4th,
        testpoint5th,
        questionChoiceType} = e.currentTarget.dataset;    
        
        // 验证sequenceNumber是否在有效范围内
        if (sequenceNumber < 1 || sequenceNumber > questionCount) {
            $this.isSelecting = false;
            return;
        }
        
        // 按题型分流：多选和不定项仅记录，不自动跳题；单选/判断沿用自动跳题
        if (questionChoiceType === 2 || questionChoiceType === 4) {
            $this.handleMultipleChoice({ sequenceNumber, questionNumber, questionId, questionOption, score, correctAnswer, examPoint,
                testpoint1st, testpoint2nd, testpoint3rd, testpoint4th, testpoint5th, questionChoiceType });
            // 重置点击锁，允许继续多选
            $this.isSelecting = false;
        } else { 
            $this.handleSingleOrJudge({ sequenceNumber, questionNumber, questionId, isCorrect, questionOption, score, correctAnswer, examPoint,
                testpoint1st, testpoint2nd, testpoint3rd, testpoint4th, testpoint5th, questionChoiceType });
            // 单选/判断：选择后自动跳下一题，并重置点击锁
            setTimeout(() => {
                let nextIndex = nowQuestionIndex + 1
                if (nextIndex < questionCount) {
                    $this.setData({ nowQuestionIndex: nextIndex })
                }
                $this.isSelecting = false;
            }, 300);
        }
    }, 

    // 单选/判断：直接记录 'A' 或 'B'，判分沿用 opIsCorrect
    handleSingleOrJudge(dataset) {
        const $this = this;
        const {sheetLists} = $this.data;
        const { sequenceNumber, questionNumber,questionId,isCorrect, questionOption,score,correctAnswer,examPoint,
            testpoint1st,
        testpoint2nd,
        testpoint3rd,
        testpoint4th,
        testpoint5th,
        questionChoiceType} = dataset; 
        
        let newSheetList = $this.replaceObjectInArray(sheetLists, { 
            sequenceNumber, questionNumber,questionId,score,
            userAnswerOption:questionOption, 
            isCorrect,correctAnswer,examPoint,testpoint1st,
            testpoint2nd,
            testpoint3rd,
            testpoint4th,
            testpoint5th,
            questionChoiceType}); 
        $this.setData({ sheetLists:newSheetList});
    },

    // 多选：切换选中、排序存储为 'A,B,C'、顺序无关判分
    handleMultipleChoice(dataset) {
        const $this = this;
        const {sheetLists} = $this.data;
        const { sequenceNumber, questionNumber,questionId, questionOption,score,correctAnswer,examPoint,
            testpoint1st,
        testpoint2nd,
        testpoint3rd,
        testpoint4th,
        testpoint5th,
        questionChoiceType} = dataset;
        
        // 找到当前题目的答案记录
        let current = null;
        for (let i = 0; i < sheetLists.length; i++) {
            if (sheetLists[i].questionNumber === questionNumber) { current = sheetLists[i]; break; }
        }
        
        // 当前已选集合
        let selected = [];
        if (current && typeof current.userAnswerOption === 'string' && current.userAnswerOption.length > 0) {
            selected = current.userAnswerOption.split(',');
        }
        
        // 切换选中（去重）
        const set = new Set(selected);
        if (set.has(questionOption)) set.delete(questionOption);
        else set.add(questionOption);
        selected = Array.from(set);
        
        // 排序并存为 'A,B,C'
        const userAnswerString = selected.sort().join(',');
        
        // 顺序无关判分：空为 -1；匹配为 1；不匹配为 0
        let isCorrectVal = -1;
        if (selected.length > 0) {
            const correctArr = (correctAnswer || '').split(',').map(s => s.trim()).filter(Boolean).sort();
            const userArr = selected.slice().sort();
            isCorrectVal = (correctArr.join(',') === userArr.join(',')) ? 1 : 0;
        }
        
        let newSheetList = $this.replaceObjectInArray(sheetLists, { 
            sequenceNumber, questionNumber,questionId,score,
            userAnswerOption: userAnswerString, 
            isCorrect: isCorrectVal, correctAnswer,examPoint,testpoint1st,
            testpoint2nd,
            testpoint3rd,
            testpoint4th,
            testpoint5th,
            questionChoiceType});
        
        $this.setData({ sheetLists:newSheetList});
    },

    creatAnswerSheet(arr) {
        let sheetLists = []
        const $this = this  
        arr.forEach(e => {  
            sheetLists.push({
                sequenceNumber: e.sequenceNumber,
                questionNumber: e.questionNumber,  
                questionId: e.questionId,
                questionOption: e.questionOption,
                score:e.score,  // 每一题的分值 
                userAnswerOption: '',
                isCorrect: -1, // 1 正确 0 错误 -1 未选择
                correctAnswer:e.correctAnswer,
                testpoint1st:e.testpoint1st,
                testpoint2nd:e.testpoint2nd,
                testpoint3rd:e.testpoint3rd,
                testpoint4th:e.testpoint4th,
                testpoint5th:e.testpoint5th,
                examPoint:e.examPoint,
                questionChoiceType:e.questionChoiceType      
            })
        });
        $this.setData({ sheetLists })
    },
    async getQuestion(e){
        const $this = this
        let nowQuestionIndex = e.detail 
        //  await $this.watchQuesues( nowQuestionIndex )
        $this.setData({ nowQuestionIndex,showSheet:!$this.data.showSheet })
    }, 
    goQuestionSerial(e){
        const $this = this 
        const nowQuestionIndex = e.currentTarget.dataset.sequenceNumber 
        $this.setData({ nowQuestionIndex,mode:'A'})
    },   
    timer(operate) {
        const $this = this
        function formatTime(time) {
            const hour = Math.floor(time / 3600)
            const minute = Math.floor((time % 3600) / 60)
            const second = time % 60
            return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
        }
        switch (operate) {
          case '开始':
            answerUseSecond = 0
            timeStr = '00:00:00'
            timerId = setInterval(() => {
              answerUseSecond++
              timeStr = formatTime(answerUseSecond)
              // 更新页面
              $this.setData({answerTime:timeStr})  
            }, 1000)
            break
          case '暂停':
            clearInterval(timerId)
            break
          case '结束':
            clearInterval(timerId)
            // 这里可以将答题时间 answerTime 发送到服务器
            break
          default:
            console.log('请输入有效操作')
        }
    },
      
    async onLoad(options) { 
        const $this = this
        //获取题目数据及显示题目数据    
        try { 
            const $this = this;
            let examInfo = null; 
            // 方式1：尝试从 EventChannel 获取数据
            const eventChannel = this.getOpenerEventChannel();
            if (eventChannel && typeof eventChannel.on === 'function') {
                eventChannel.on('examData', async function (data) {  
                    console.log('从 EventChannel 获取 examData:', data);
                    examInfo = data.examInfo;
                    $this.setData({examInfo}); 
                    if (examInfo && examInfo.examId) {
                        await $this.getExamList(examInfo.examId); 
                        $this.timer('开始');
                    }
                });
            } else {
                console.log(options)
                // 方式2：从 URL 参数获取
                const examId = options.scene;
                if (examId) { 
                    await $this.getExamList(examId);  
                    $this.timer('开始');
                } else {
                    console.error('无法获取考试信息'); 
                    $.toast('页面初始化错误');
                     router.backTo(1);
                }
            }
        } catch (error) {
            console.error('页面初始化错误:', error);
            // 最后的降级处理
            const examId = options.scene;
            if (examId) {
                await this.getExamList(examId);
                 $this.timer('开始');
            }else {
                $.toast('页面初始化错误');
                router.backTo(1);
            }  
        }
    },  
    //底部导航栏切换
    async switchTab(e){
            const $this = this 
            const tabtxt = e.currentTarget.dataset.text; 
            let {nowQuestionIndex,questionCount,showSheet,isMore} = $this.data 
            
            // 防止快速点击导航按钮
            if ($this.isSwitching) {
                return;
            }
            $this.isSwitching = true;
            
            switch (tabtxt) {
                case '上一题':
                    if(nowQuestionIndex > 0) {
                        $this.setData({nowQuestionIndex:nowQuestionIndex-1});
                    } else {
                        $.toast('已经是第一题了');
                    }
                    break;
                case '下一题':
                    if(nowQuestionIndex < questionCount-1) {
                        $this.setData({nowQuestionIndex:nowQuestionIndex+1})
                    } else {
                        let userChoose = await $.modal('','没有题了是否提交');  
                        if(userChoose==='确认')
                        $this.submitAnwser()
                    }  
                    break;
                case '答题卡': 
                $this.setData({showSheet:!showSheet}) 
                    break;
                case '交卷':
                $this.submitAnwser()     
                    break;
                case '更多':    
                $this.setData({isMore:!isMore})    
                    break;
            }
            
            // 延迟重置防重复点击标志
            setTimeout(() => {
                $this.isSwitching = false;
            }, 300);
     }, 
     //切换下一题（优化版本，支持条件渲染）
    switchNext(e) {  
        const $this = this
       // const currentQuestion = $this.data.questions[$this.data.nowQuestionIndex]
        console.log('切换下一题', e.detail.current)
        console.log('当前题目索引', $this.data.nowQuestionIndex)
        if ($this.data.nowQuestionIndex !== e.detail.current) { 
            $this.setData({
                 nowQuestionIndex: e.detail.current,
                 // 触发页面重新渲染，更新条件渲染范围
                 renderTimestamp: Date.now()
             })
        }
    },
    countOptions(questions) {
        let emptyOptionsCount = 0;
        let correctAnswersCount = 0;
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.userAnswerOption) {
            emptyOptionsCount++;
          }
          if (q.isCorrect === 1) { // 1=正确，0=错误，-1=未作答
            correctAnswersCount++;
          }
        } 
        return {emptyOptionsCount, correctAnswersCount};
    }, 
    //答题得分计算
    scoreCalculation(questions){
          let examScore = 0;
          let userScores = 0;  
          questions.forEach(item => { 
              const s = item.score ? Number(item.score) : 0;
              if (item.isCorrect === 1) {
                userScores += s;
              }
              examScore += s; 
          });
          userScores = parseFloat(userScores.toFixed(2)); 
          examScore = parseFloat(examScore.toFixed(2)); 
          return {examScore,userScores}
      },
    //提交答案
   async submitAnwser(){
      const $this = this 
      
      // 防抖：如果正在提交，提示用户并返回
      if ($this.data.isSubmitting) {
          $.toast('已经提交了，系统正在处理...请稍后')
          return
      }
      
      const {sheetLists} = $this.data
      const isLogin =  wx.getStorageSync('isLogin') 
      if (isLogin) {
      // 设置提交状态
      $this.setData({ isSubmitting: true })
      //提交的数据信息
      const {examId,examName} = $this.data.questionLists[0] 
      const {planName,stageName} = $this.data.examInfo? $this.data.examInfo : {}  //考试信息 
      //用户信息
      const { userName,userPhone,className,projectName } =  wx.getStorageSync('studentInfos')  
      if(!className){ return $.toast('您的班级信息缺失 请联系管理员') }  //防止非班级学生提交答案 
      let wxOpenid =  wx.getStorageSync('userInfo').openId   || wx.getStorageSync('userInfo')._openid
      //防止用户_openid丢失
      if(!wxOpenid){  
        const { data: info } = await model.getUserInfo()
          wxOpenid = info[0]._openid
       } 
      let remainingCounts = $this.countOptions(sheetLists).emptyOptionsCount  //剩余答题数
      let correctNum = $this.countOptions(sheetLists).correctAnswersCount
      let questionAllNum =  $this.data.questionCount	
      let correctRate = ((correctNum / questionAllNum) * 100).toFixed(2); 
      let answerUseTime = $this.data.answerTime
      let answerTime = time.getCurrentTime(); // 使用工具方法获取当前时间
      let questAnswerKcDetailList = sheetLists.map(e => {
      let correctStatus  = e.isCorrect==-1?0:e.isCorrect;        //简道云后端数据统计 未作答状态为0
        return {
            ...e,
            correctStatus:correctStatus,
            questionIndex:e.sequenceNumber,
            questionOptionUser:e.userAnswerOption,
            testpointMin:e.examPoint // 最小考点数据
        };
    });    
    const  answerType=  1
    const  answerStatus = 1
    const  wrongNum = questionAllNum - correctNum 
     const {examScore,userScores} = $this.scoreCalculation(sheetLists)    
      let answerData = {
        answerStatus,
        answerTime,
        answerType,
        answerUseSecond,
        answerUseTime,
        className,
        correctNum,
        correctRate,
        examId,
        examName,
        finalScore:examScore,
        planName:planName?planName:'无',
        projectName,
        questAnswerKcDetailList,
        questionAllNum,
        stageName,
        userName,
        userPhone,
        userScores,
        wrongNum,
        wxOpenid
      }   
      //答题数据
        if (remainingCounts!=0) {
            let userChoose = await $.modal('','还有'+remainingCounts+'道题未做，是否提交所有答案！');   
            if(userChoose==='确认'){  
              await  $this.commitData(answerData);  
            } else {
              // 用户取消提交，重置状态
              $this.setData({ isSubmitting: false })
            }
        } else {
              await $this.commitData(answerData) 
        }  
      } else {
        // 未登录，重置提交状态
        $this.setData({ isSubmitting: false })
        $.toast('该页面功能需登录后才能使用...') 
        setTimeout(()=>{ router.pushParam('login','?page=exam')},2000)  
      }
    },
    //提交答题数据至数据后台
    async commitData(answerData){ 
        const $this = this; 
        let  data =  answerData
        try {
            let resData = await request('POST','/answerKc/addKcQuestAnswer',data) 
            if (resData.data.code == 200) {
                $.toast('提交成功！') 
                $this.timer('结束')   
                // 跳转结果页 - 使用redirectTo防止用户返回已提交页面
                const responseData = resData.data.data;
                if (responseData && responseData.examId) {
                    const reportParams = `?examId=${responseData.examId}&examName=${encodeURIComponent(responseData.examName || '')}&stageName=${encodeURIComponent(responseData.stageName || '')}&page=exam`;
                    router.redirectTo('report', reportParams);
                } else {
                    $.toast('数据异常，请重试');
                }
            }else  if (resData.data.code == -1) {
                $.toast(resData.data.msg)
                $this.setData({ isSubmitting: false }) // 重置状态允许重新提交
            }
            else {
                $.toast('提交出错，请重试:'+resData.data.msg)
                $this.setData({ isSubmitting: false }) // 重置状态允许重新提交
            }
        } catch (error) {
            console.error('提交答案失败:', error);
            $.toast('网络异常，请重试');
            $this.setData({ isSubmitting: false }) // 重置状态允许重新提交
        }
    },    
    //模式切换
    modelSwitch(e){
        const $this = this 
        const mode = e.currentTarget.dataset.mode; 
        $this.setData({ mode })
    },   
    //收藏
    async collect(e){
        const $this = this 
        const { questionLists, examName } = $this.data
        const {examId} = $this.data.examInfo
        const index = e.currentTarget.dataset.index
        const currentQuestion = questionLists[index]
        
        if(currentQuestion.isCollected){ 
            let resData = await request('post', '/questCollectKc/deleteQuestCollect', { collectId: currentQuestion.collectId } )  
            if(resData.data.code===200){
                $.toast('取消收藏成功')
                let newQuestionLists = [...questionLists]
                newQuestionLists[index].isCollected = false 
                newQuestionLists[index].collectId = null
                $this.setData({ questionLists: newQuestionLists })
            }else{
                $.toast('取消收藏失败：'+resData.data.msg)
            }
        }else{
            const { questionNumber, questionId, examPoint, testpoint1st, testpoint2nd, testpoint3rd, testpoint4th, testpoint5th } = currentQuestion 
            // 题型兜底：优先从题目列表取，缺失则从答题卡匹配
            let { questionChoiceType } = currentQuestion
            if (typeof questionChoiceType === 'undefined') {
                const fromSheet = ($this.data.sheetLists || []).find(s => s.questionNumber === questionNumber)
                if (fromSheet && typeof fromSheet.questionChoiceType !== 'undefined') {
                    questionChoiceType = fromSheet.questionChoiceType
                }
            }
            const testpointMin = examPoint
            const collectTime = time.getCurrentTime()    
            const wxOpenid = wx.getStorageSync('userInfo')._openid
            const {className, userName, userPhone} = wx.getStorageSync('studentInfos')  
            let data = {
                className,
                collectTime,
                examId,
                examName,
                "examType": "公职类",
                "examTypeId": "gwy",
                questionId,
                questionNumber,
                questionChoiceType,
                testpoint1st,
                testpoint2nd,
                testpoint3rd,
                testpoint4th,
                testpoint5th,
                testpointMin,
                userName, 
                userPhone,
                wxOpenid
            }
            let resData = await request('post', '/questCollectKc/addQuestCollect', data )   
            if(resData.data.code===200){
                $.toast('收藏成功')
                let newQuestionLists = [...questionLists]
                newQuestionLists[index].isCollected = true
                newQuestionLists[index].collectId = resData.data.data.collectId
                $this.setData({ questionLists: newQuestionLists })
            }else{
                $.toast('取消收藏失败：'+resData.data.msg)
            }
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
    toggleCollapse(event) {
        this.setData({
            collapsed: !this.data.collapsed
          });
    },
    onClickLeft() {
        router.reLaunch('index')
    },
    previewImage(e) { 
        const imageUrl = e.currentTarget.dataset.url
         wx.previewImage({
           urls: [imageUrl], // 图片地址列表
           current: imageUrl // 当前显示图片的链接
         })
     },
     async login(exam_id){
        const $this = this;
        const isLogin =  wx.getStorageSync('isLogin')  
        if(!isLogin){ 
          $.toast('您还未登录 需登录后使用')
          setTimeout(()=>{
              router.pushParam('login','?page=exam')
          },1000)
          return 
       }
     },
    //载入准备工作    
    onReady(options) {
        // 监听屏幕变化
        this.updateScreenInfo();
    }, 
    onShow() {
        // 页面显示时重新计算屏幕信息
        this.updateScreenInfo();
    }, 
    onHide() { 
        // const $this = this 
        // $this.timer('结束')
    }, 
    onUnload() {
        const $this = this 
        $this.timer('结束')   
     }, 
    onPullDownRefresh() { }, 
    onPageScroll: function (e) {
        //   (e.scrollTop >= this.data.navigationBarHeight)?this.setData({bgColor:'#d40005',title:'考试'}):this.setData({bgColor:'none',title:''})   
    },
    onReachBottom() { }, 
    //分享按钮
    onShareAppMessage: function () { 
        return {
            title: "我在考试，你也来试试吧！",
            path: '/page/index/index', //答题页为专属使用
        }
    }
})