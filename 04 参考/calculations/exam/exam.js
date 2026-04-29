/*页面引用*/
import Api from '../../interface/query'
import $ from '../../toolbox/tool'
import router from '../../router/index'
import time from '../../toolbox/time'
/*云开发*/
import Model from '../../model/index';
const model = new Model()

//插入数据
import directorys from '../index/directorys'

let timeStr = '00:00' // 显示在页面上的计时器格式字符串

/*页面全局变量*/
const app = getApp()
const { capsule, statusBarHeight, titleBarHeight, navigationBarHeight, screenWidth,screenHeight } = app.globalData;
const static_url = 'https://wqianc.com/dashujiaoyu/upload/xcx/index/' 
//简道云表单ID
const app_id = '632eba7e35faf20008ef9e45'
const entry_id = '66f0d1c8a181902173539a63'

Page({
    data: {
        capsule,
        statusBarHeight, titleBarHeight, navigationBarHeight, screenHeight,
        navigationWidth: screenWidth -  capsule.width - 10,
        questionLists: [{ userAnswer: '' }, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 问题列表
        questionAllNum: 0,
        nowQuestionIndex: 0, // 当前问题编号 默认是swiper的index
        answerTime: '00:00', // 答题时间
        timerNumber: 0, // 计时器数值
        timer: null, // 定时器 
        timers: {}, // 用于存储每个题目的计时器ID 
        statusBarHeight,
        collapsed: true,
        navigationBarHeight,
        textSize: 2,
        isDraft: true,
        nowUserAnswer: '',
        examName: '数资速算',
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
                    "text": "提交",
                    "icon": "icon-submit"
                }
            ]
        },  
    },
    //阻止提交答案后通过手势或按钮返回本页面
    blockReturn() {
        if (app.globalData.isSubmitAnswers) {
            setTimeout(() => {
                app.globalData.isSubmitAnswers = false; // 页面重置便于下次进入时判断
                return router.redirectTo('calculations');
            }, 100);
            // 延迟100毫秒进行跳转，给予页面足够的时间完成其他可能的渲染或动画
        }
    },
    /**
  * 生命周期函数--监听页面加载
  */
    async onLoad(options) {
        const $this = this
        try {
            const eventChannel = $this.getOpenerEventChannel()
            eventChannel.on('calculate_exam', async function (data) {
                const {
                    uniqueId,
                    firstSerial,
                    firstSort,
                    secondSerial,
                    secondSort,
                    questionLists,
                    functionType
                } = data.examData
                let newQuestionLists = questionLists.map(item => {
                    item.userAnswer = ''
                    item.isCorrect = 0
                    item.takeTime = 0
                    return item
                })
                $this.setData({
                    uniqueId,
                    firstSerial,
                    firstSort,
                    secondSerial,
                    secondSort,
                    firstSortName: firstSerial + firstSort,
                    secondSortName: secondSerial + secondSort,
                    examName: time.getCurrentTime() + ' 数资速算',
                    examSortName: `${firstSerial}${firstSort} > ${secondSerial}${secondSort}`,
                    questionLists: newQuestionLists,
                    functionType,
                    questionAllNum: questionLists.length,
                })
                $this.setData({ loading: false });  //骨架隐藏
                $this.timer('开始')
                $this.startItemTimer(0); // 启动新题目的计时器
            })
        } catch (error) { console.log(error) }
    },
    makeDraft() {
        const { isDraft } = this.data
        this.setData({ isDraft: !isDraft })
    },
    checkElementExists(array, element) {
        let num = Number(element)
        if (array.includes(num)) {
            return 1;
        } else {
            return 0;
        }
    },
    inputAnswer(e) {
        const $this = this
        let inputAnswer = e.detail.numberString
        const { nowQuestionIndex, questionLists } = this.data
        let rightAnswer = questionLists[nowQuestionIndex].correctAnswer
        let isCorrect;
        let multipleAnswers = questionLists[nowQuestionIndex].multipleAnswers
        //多个答案判断
        if (multipleAnswers) {
            isCorrect = $this.checkElementExists(rightAnswer, inputAnswer)
        } else {
            isCorrect = rightAnswer == inputAnswer ? 1 : 0
        }
        questionLists[nowQuestionIndex].userAnswer = inputAnswer
        questionLists[nowQuestionIndex].isCorrect = isCorrect
        $this.setData({ questionLists })
    },
    //底部导航栏切换
    async keyboardNext() {
        const $this = this
        let { nowQuestionIndex, questionAllNum } = $this.data
        if (nowQuestionIndex < questionAllNum - 1) {
            $this.stopItemTimer(); // 停止当前题目的计时器 
            $this.setData({ nowQuestionIndex: nowQuestionIndex + 1, nowUserAnswer: '',isClearDraft: true })
            $this.startItemTimer(nowQuestionIndex + 1); // 启动新题目的计时器
        } else {
            let user_choose = await $.modal('', '没有题了是否提交');
            if (user_choose === '确认')
                $this.submitAnwser()
        }
    },
    //切换下一题
    switchNext(e) {
        const $this = this
        if ($this.data.nowQuestionIndex !== e.detail.current) {
            $this.stopItemTimer(); // 停止当前题目的计时器  
            $this.setData({
                nowQuestionIndex: e.detail.current, nowUserAnswer: '',isClearDraft: true
            })
            $this.startItemTimer(e.detail.current); // 启动新题目的计时器
        }
    },
    //每一道题用时多少秒 停止当前题目的计时器  
    stopItemTimer() {
        const $this = this;
        const currentTimer = $this.data.nowItemTimer;
        if (currentTimer) {
            clearInterval(currentTimer);
        }
    },  // 启动新题目的计时器  
    startItemTimer(currentIdx) {
        const $this = this;
        let questionLists = $this.data.questionLists;
        let itemTimerId = setInterval(() => {
            let newTakeTime = questionLists[currentIdx].takeTime || 0; // 确保takeTime已初始化  
            newTakeTime++;
            questionLists[currentIdx].takeTime = newTakeTime;
            $this.setData({ questionLists });
        }, 1000);
        $this.setData({
            nowItemTimer: itemTimerId // 添加或更新当前题目的计时器ID   
        })
    },
    timer(operate) {
        const $this = this
        function formatTime(time) {
            const minute = Math.floor((time % 3600) / 60)
            const second = time % 60
            return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
        }
        let timerNumber = $this.data.timerNumber
        let timerId = $this.data.timerId
        switch (operate) {
            case '开始':
                timeStr = '00:00'
                timerId = setInterval(() => {
                    timerNumber++
                    timeStr = formatTime(timerNumber)
                    // 更新页面
                    $this.setData({ answerTime: timeStr, timerNumber })
                }, 1000)
                break
            case '暂停':
                clearInterval(timerId)
                break
            case '继续':
                // 如果计时器已经暂停，则继续计时   
                timerId = setInterval(() => {
                    timerNumber++;
                    timeStr = formatTime(timerNumber);
                    $this.setData({ answerTime: timeStr, timerNumber });
                }, 1000);
                break;
            case '结束':
                clearInterval(timerId)
                // 这里可以将答题时间 answerTime 发送到服务器
                break
            default:
                $.toast('计时器执行失败 请重试！')
        }
    },
    //提交答题
    submitAnwser() {
        const $this = this
        const { answerTime, questionLists, examName, timerNumber, examSortName,
            uniqueId,
            firstSerial,
            firstSort,
            secondSerial,
            secondSort,
            nowQuestionIndex,
            functionType } = $this.data
        let correctNum = questionLists.filter(item => item.isCorrect === 1).length
        let answerUseTime = answerTime
        let nowtime = time.getCurrentTime();
        let answerStatus = '已完成'
        let questionAllNum = questionLists.length
        let actualTime = questionLists.reduce((acc, cur) => acc + Number(cur.takeTime), 0);  //实际上每一题的时间 
        // 把相差的值给到最后提交
        let differSeconds = timerNumber - actualTime;
        questionLists[nowQuestionIndex].takeTime = questionLists[nowQuestionIndex].takeTime + differSeconds
        let answerData = { answerStatus, answerTime: nowtime, examName, questionAllNum, correctNum, answerUseTime, answerUseSeconds: timerNumber, examSortName }
        app.globalData.isSubmitAnswers = true //页面已经成提交作答至数据库
        //停止当前题目的计时器 
        $this.stopItemTimer();
        $this.timer('结束')
        // 更新简道云用户作答数据
        let pushParam = { 
            first_serial:firstSerial,
            first_sort: firstSort, 
            second_serial: secondSerial, 
            second_sort: secondSort,  
            unique_id: uniqueId,
            answer_number: questionAllNum,  
            correct_number:correctNum,  
            answer_use_time: timerNumber  
         }
        $this.updataUserJdyData(pushParam)
        // 跳转结果页
        router.push('calculate_report', {}, res => {
            res.eventChannel.emit('userReport', {
                firstSerial,
                firstSort,
                secondSerial,
                secondSort,
                questionLists,
                answerData,
                functionType,
                page: 'calculate_exam'
            })
        })
    },
    countOptions(sheetLists) {
        let emptyOptionsCount = 0;
        let correctAnswersCount = 0;
        for (let i = 0; i < sheetLists.length; i++) {
            if (!sheetLists[i].userOption) {
                emptyOptionsCount++;
            }
            if (sheetLists[i].isCorrect === 1) {
                correctAnswersCount++;
            }
        }
        return { emptyOptionsCount, correctAnswersCount };
    },
    async getBack() {
        const $this = this;
        const { questionLists } = $this.data;
        //已经做完是否提交
        let remainingCounts = $this.countOptions(questionLists).emptyOptionsCount  //剩余答题数 
        if (remainingCounts === 0) {
            let res = await $.modal('已经做完是否提交', '取消为退出页面，确定为提交作答内容')
            if (res === '确认') {
                //提交作答
                $this.submitAnwser()
            } else {
                setTimeout(() => {
                    router.redirectTo('calculations')
                }, 1000)
            }
        } else {
            let remainingCounts = $this.countOptions(questionLists).emptyOptionsCount  //剩余答题数 
            let res = await $.modal('退出提示', '还有' + remainingCounts + '道题未做，是否返回？')
            if (res === '确认') {
                setTimeout(() => {
                    router.redirectTo('calculations')
                }, 1000)
            }
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {  },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        const $this = this
        $this.blockReturn();
    },
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
    //查询简道云数据
    async updataUserJdyData(answerData) {
        const $this = this 
        const studentInfos = wx.getStorageSync('studentInfos')
        const {className}  =studentInfos
        if (!className){ return console.log('非班级学生') }
        const { phone } = wx.getStorageSync('userInfo')
        let fields = ["user_name","user_phone","project_name","exam_name","wx_openid","total_answer_number","total_correct_number","data_report"]
        let data = {
            "limit": 10,
            fields,
            "filter": {
                "rel": "and",
                "cond": [{
                    "field": "class_name",
                    "type": "text",
                    "method": "eq",
                    "value": className
                },{
                    "field": "user_phone",
                    "type": "text",
                    "method": "eq",
                    "value": phone
                }]
            }
        }
        let res_data = await Api('list', app_id, entry_id, '', data)  //从班级用户获取用户数据
        if (res_data.statusCode == 200) {
            let resUserData = res_data.data.data 
            if (resUserData.length === 0) {
                let initOriginalData = $this.initReportData();
                let totalAnswers = {total_answer_number:answerData.answer_number,total_correct_number:answerData.correct_number} 
                let newOriginalData = $this.replaceItemInArray(initOriginalData,answerData.unique_id,answerData) 
               //新增创建
               $this.setSyncDataToJdy(studentInfos,'create','data_id',newOriginalData,totalAnswers)
            } else {
                let totalAnswers = {
                    total_answer_number:resUserData[0].total_answer_number+answerData.answer_number,
                    total_correct_number:resUserData[0].total_correct_number+answerData.correct_number
                } 
                let data_id = resUserData[0]._id 
                let newOriginalData = $this.syncItemInArray( resUserData[0].data_report,answerData.unique_id,answerData)   
              //更新数据
              $this.setSyncDataToJdy(studentInfos,'update',data_id,newOriginalData,totalAnswers)
            }
        }
    },
    initReportData(){
        let transformedArray = [];   
        directorys.forEach(category => {  
            category.items.forEach(item => {  
                transformedArray.push({  
                    first_serial:category.serial,
                    first_sort: category.firstsort, 
                    second_serial:item.serial, 
                    second_sort: item.secondsort,  
                    unique_id: item.uniqueId,
                    answer_number: 0,  
                    correct_number: 0,  
                    answer_use_time: 0  
                });  
            });  
        }); 
       return transformedArray;    
    },
    replaceItemInArray(arr, targetName, newObject) { 
        return arr.map(item => {
            if (item.unique_id === targetName) {
                return {...newObject };
            } else {
                return item;
            }
        });
    },
    syncItemInArray(arr, targetName, newObject) { 
        return arr.map(item => {
            if (item.unique_id === targetName) {
                let temObj = {...item} 
                temObj.answer_number = item.answer_number  + newObject.answer_number
                temObj.correct_number =  item.correct_number  + newObject.correct_number
                temObj.answer_use_time =  item.answer_use_time  + newObject.answer_use_time
                return temObj;
            } else {
                return item;
            }
        });
    },
    //数据更新至简道云
    async setSyncDataToJdy(studentInfos,action,data_id,newOriginalData,totalAnswers) {  
        const $this = this 
        const { userName,userPhone,className,projectName} = studentInfos
        const {_openid } = wx.getStorageSync('userInfo')
        const {total_answer_number,total_correct_number} = totalAnswers  
        let premierData = {
            user_name:userName,
            user_phone:userPhone,
            project_name:projectName,
            wx_openid:_openid,
            class_name:className,
            total_answer_number,
            total_correct_number, 
        }  
        //数据整理
        let syncData = $.transformValueObject(premierData); 
        let newReports= { 
            value:newOriginalData.map(item =>  $.transformValueObject(item)) 
        }
        syncData.data_report = newReports
        let psuhData  = {
            "transaction_id": data_id, 
            "data":syncData,  
        }  
       //数据更新至简道云
        let res = await Api(action, app_id, entry_id, data_id,psuhData);      
        if (res.statusCode == 200) {
            console.log('数据提交、更新成功')
        }else{
            console.log('数据提交失败')
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() { }
});
