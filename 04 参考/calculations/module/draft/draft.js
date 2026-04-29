const {screenWidth,windowWidth} =  wx.getSystemInfoSync() 
const rpx = windowWidth / 750; // 设备像素比
const thickness = [2 * rpx, 4 * rpx, 7 * rpx, 10 * rpx, 20 * rpx, 30 * rpx, 40 * rpx,50 * rpx]; // 画笔粗细
const penColor = ['#4B4B5F', '#848C8E', '#000000', '#323233', '#00C667', '#FAAB0C', '#FF4E45', '#FFFFFF']; // 画笔颜色 
let context = null; // 使用 wx.createContext 获取绘图上下文 context
let isButtonDown = false; // 是否触摸
let arrx = []; // 存储触摸x坐标
let arry = []; // 存储触摸y坐标
//获取小程序全局
const app = getApp() 

const{ statusBarHeight,navigationBarHeight,clientHeight,screenHeight } = app.globalData

const canvasW = screenWidth; // 画布宽
const canvasH = clientHeight -300 ; // 画布高



Component({ 
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    // 组件的属性，例如传入的参数等
    isDraft: {
      type: Boolean,
      value: true
    },
    isClearDraft: {
      type: Boolean,
      value: false,
      observer: function(newVal) { 
        if (newVal === true) {
          this.cleardraw();
          this.setData({
            isClearDraft: false
          });
        }
      }
    },
  },
  data: {
    navigationBarHeight,
    clientHeight,
    canvasSize: { width: null, height: null },
    thickness: 0, // 笔尺寸下标
    colorIndex: 0, // 颜色下标
    drawLineArr: [], // 绘画路径
    selectErase: false, // 选中擦除
    eraseClass: '', // 选中擦除的样式
    penColor: penColor,
    canvasHeight:clientHeight-220-navigationBarHeight,
  },
  lifetimes: {
    attached() {
      const  $this = this
      $this.setCanvasSize();
      context = wx.createCanvasContext('canvas', $this); // 使用 wx.createCanvasContext 获取绘图上下文
      context.setLineCap('round');
      context.setLineJoin('round');
      //系统信息
      const systemInfo = wx.getSystemInfoSync();
      // 获取设备机型
      const model = systemInfo.model;
      // 判断机型
      if (model.includes('Pad')) {
         $this.setData({ 
          canvasHeight:clientHeight/2 + 120
        })   
      } 
    }
  },
  methods: {
    setCanvasSize() {
      this.setData({
        canvasSize: { width: canvasW, height: canvasH }
      });
    },
    selectPen(e) {
      this.setData({
        thickness: e.currentTarget.dataset.index
      });
    },
    selectColor(e) {
      this.setData({
        selectErase: 0,
        colorIndex: e.currentTarget.dataset.index,
        selectErase: false,
        eraseClass: ''
      });
    },
    canvasStart(event) {
      isButtonDown = true;
      arrx.push(event.changedTouches[0].x);
      arry.push(event.changedTouches[0].y);
      context.beginPath();
      context.setStrokeStyle(this.data.penColor[this.data.colorIndex]);
      context.setLineWidth(thickness[this.data.thickness]);
      context.moveTo(arrx[arrx.length - 1], arry[arry.length - 1]);
      context.arc(event.changedTouches[0].x, event.changedTouches[0].y, thickness[this.data.thickness] / 2, 0, 2 * Math.PI);
      context.setFillStyle(this.data.penColor[this.data.colorIndex]);
      context.fill();
      context.draw(true);
    },
    canvasMove(event) {
      if (isButtonDown) {
        let arrxLen = arrx.length;
        let arryLen = arrx.length;
        let sx = arrx[arrxLen - 1], sy = arry[arryLen - 1]; // 开始坐标
        let ex = event.changedTouches[0].x, ey = event.changedTouches[0].y; // 结束坐标

        context.moveTo(sx, sy);
        let cx = (ex - sx) / 2 + sx,
          cy = (ey - sy) / 2 + sy; // 中间点坐标
        let lcx = (cx - sx) / 2 + sx, lcy = (cy - sy) / 2 + sy; // 1/4坐标

        let rcx = (ex - cx) / 2 + cx, rcy = (ey - cy) / 2 + cy; // 3/4坐标
        arrx.push(...[lcx, cx, rcx, ex]); // 记录路径以便回退
        arry.push(...[lcy, cy, rcy, ey]);
        context.lineTo(lcx, lcy);
        context.lineTo(cx, cy);
        context.lineTo(rcx, rcy);
        context.lineTo(ex, ey);
        context.stroke();
        context.draw(true);
      }
    },
    canvasEnd(event) {
      isButtonDown = false;
      this.data.drawLineArr.push({ arrx: arrx, arry: arry, thickness: thickness[this.data.thickness], color: this.data.penColor[this.data.colorIndex] });
      arrx = [];
      arry = [];
    },
    cleardraw() {
      arrx = [];
      arry = [];
      this.setData({
        drawLineArr: [],
        colorIndex: 0,
        selectErase: false,
        eraseClass: ''
      });
      context.setFillStyle('rgba(255, 255, 255, 0.5)');
      context.clearRect(0, 0, canvasW, canvasH);
      context.fillRect(0, 0, canvasW, canvasH);
      context.draw(true);
    },
    eraseDraw() {
      if (this.data.selectErase === false) {
        this.setData({
          selectErase: this.data.colorIndex,
          colorIndex: 7, // 白色色块下标，
          eraseClass: 'select-erase'
        });
      } else {
        let colorIndex = this.data.selectErase;
        this.setData({
          selectErase: false,
          colorIndex: colorIndex, // 取消后返回之前的颜色
          eraseClass: ''
        });
      }
    },
    closeDraft(){ 
      this.setData({
        isDraft: !this.data.isDraft
      });
    },
    backDraw() {
      context.clearRect(0, 0, canvasW, canvasH);
      let drawObj = this.data.drawLineArr[this.data.drawLineArr.length - 1];
      if (drawObj) {
        this.data.drawLineArr.pop();
        this.data.drawLineArr.forEach(obj => {
          context.beginPath();
          context.setStrokeStyle(obj.color);
          context.setLineWidth(obj.thickness);
          context.moveTo(obj.arrx[0], obj.arry[0]);
          obj.arrx.forEach((item, index) => {
            context.lineTo(item, obj.arry[index]);
          });
          context.stroke();
          context.closePath();
        });
      } else {
        context.setFillStyle('rgba(255, 255, 255, 0.5)');
        context.clearRect(0, 0, canvasW, canvasH);
        context.fillRect(0, 0, canvasW, canvasH);
      }
      context.draw();
    }
  }
});
