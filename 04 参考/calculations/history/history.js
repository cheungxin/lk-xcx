 /*页面引用*/
import $ from '../../toolbox/tool'
import router from '../../router/index'
import Api from '../../interface/request'
/*页面全局变量*/
const app = getApp()
const { statusBarHeight, titleBarHeight, navigationBarHeight } = app.globalData;
const static_url = 'https://wqianc.com/dashujiaoyu/upload/xcx/index/'

//简道云表单ID
const app_id = '632eba7e35faf20008ef9e45'
const entry_id = '66f0d1c8a181902173539a63'

import * as echarts from '../module/ec-canvas/echarts';

Page({ 
    /**
     * 页面的初始数据
     */
    data: {
        statusBarHeight, titleBarHeight, navigationBarHeight,
        total_answer_number:0,
        total_correct_number:0,
        total_correct_rate:0, 
        canvasOptions: { lazyLoad: true },
     }, 
    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) { 
      const $this = this
      let reportData = await $this.getUserReport()    
      if (!reportData) { return $.toast('暂无数据') }
      let useTimeData = reportData.map(item=>{
        let temp_average_time = (item.answer_use_time / item.answer_number).toFixed(1);
        let average_time = isNaN(temp_average_time) ? '无数据' : temp_average_time+'秒';
        return { ...item, 
          average_time
        }
      })
      $this.setData({
        useTimeData
      })
      $this.getIndividuleRightRata(reportData)
    },
    async getUserReport(){
        const $this = this
        const studentInfos = wx.getStorageSync('studentInfos')
        const {className}  =studentInfos
        if (!className){ return $.toast('暂无班级信息') }
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
        let reportData = []
        let res_data = await Api('list', app_id, entry_id, '', data)  //从班级用户获取用户数据
        if (res_data.statusCode == 200) {
            let resUserData = res_data.data.data 
            if (resUserData.length === 0) {  
                $.toast('暂无数据')
                return reportData
            } else {
                let total_answer_number =  resUserData[0].total_answer_number
                let total_correct_number = resUserData[0].total_correct_number
                let total_correct_rate = ((total_correct_number / total_answer_number) * 100).toFixed(2);
               $this.setData({
                total_answer_number,total_correct_number,total_correct_rate, 
               })
               return reportData = resUserData[0].data_report
            }
        }
    }, 
    getIndividuleRightRata(data){
        const $this = this
        //数据图表格式化
        let yDatas  = data.map(item=>item.second_sort)  
        let xDatas = data.map(item=>
              {  
                return { 
                sort:item.second_sort, 
                correctNumber:item.correct_number,
                answerNumber:item.answer_number,
                correctRate:((item.correct_number / item.answer_number) * 100).toFixed(2), 
                }
              }
            ) 
        let xNumbers = xDatas.map(item => {
              const rate = item.correctRate? item.correctRate : 0;
              return isNaN(rate)? 0 : rate;
         }); 
        $this.selectComponent('#individual-correct-rate').init((canvas, width, height, dpr) => { 
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          });
          canvas.setChart(chart);
          const option = {
            title: {
              text: '分类得分率',
              show:true,
              textStyle: {
                color: '#323233',
                fontWeight:'normal',
                height:0,
                fontSize: 16
              }, 
              left: '10',
              top: '20' 
            },
            color:'#00C667',
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            legend: {},
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: [
              {
                 
                type: 'value',
                name: '正答率',
                boundaryGap: ['0%', '0.01%'],
                axisLabel: {
                  formatter:'{value}%',  // 例如将值格式化为带有百分号的形式
                  show: true,  // 确保标签显示
                  textStyle: {  // 设置标题的样式
                    fontSize: 12,  // 字体大小
                    color: '#333'  // 字体颜色
                  }
                }
              },
            ],
            yAxis: [
              {
                type: 'category',
                //升序
                inverse: true,
                data: yDatas
              }
            ],
            series: [
              {
                type: 'bar',
                label: {
                  show: true,
                  offset:[100,0],
                  formatter:(params)=>{ 
                    const { correctNumber,answerNumber}   =  xDatas[params.dataIndex] 
                    let str = params.value + '%' + "( " + correctNumber + "/" + answerNumber + " )"; 
                     return str
                  }
                },
                showBackground: false,
                backgroundStyle: { }, 
                data:xNumbers
              },
            ] 
          };
          chart.setOption(option);
          return chart;
        })
      },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() { }, 
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {  }, 
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {  }, 
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