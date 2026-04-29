Component({
  /**
   * 组件的属性列表
   */
  properties: {
    numberString: {
      type: String,
      value: '0',  // 默认值
    }, 
  },
  /**
   * 组件的初始数据
   */
  data: {
    hasDot: false, // 防止用户多次输入小数点
    isPad:false,
  },
  options: {
    addGlobalClass: true,
  },
  lifetimes: {
    attached: function () {
      const systemInfo = wx.getSystemInfoSync();
      // 获取设备机型
      const model = systemInfo.model;
      // 判断机型
      if (model.includes('Pad')) {
         this.setData({ isPad: true })
      } 
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    tapKey: function (e) {
      var keyNumber = e.currentTarget.dataset.key;
      let tempNumber = this.data.numberString
      // 处理小数点的逻辑
      if (keyNumber === '.') {
        if (this.data.hasDot) return;
        this.setData({ hasDot: true });
      }
      // 更新数字显示，处理输入数字
      let newNumberString = tempNumber === '0' ? (keyNumber === '.' ? '0.' : keyNumber) : tempNumber + keyNumber
      this.setData({
        numberString: newNumberString
      });
      // 触发事件，向父组件发送转换后的数字数据
      this.triggerEvent('tapKey', { numberString: newNumberString });
    },
    tapDel: function () {
      let tempNumber = this.data.numberString
      if (tempNumber === '0') {
        return this.setData({
          numberString: '',
          hasDot: false
        })
      };
      if (tempNumber[tempNumber.length - 1] == '.') {
        this.setData({
          hasDot: false
        })
      }
      let newNumberString = tempNumber.length == 1 ? '' : tempNumber.substring(0, tempNumber.length - 1)
      this.setData({
        numberString: newNumberString
      });
      // 触发事件，向父组件发送转换后的数字数据
      this.triggerEvent('tapKey', {
        numberString: newNumberString // 将字符串转为浮点数或整数
      });
    },
    tapClear: function () {
      this.setData({
        numberString: '0',
        hasDot: false
      })
      // 触发事件，向父组件发送数据  
      this.triggerEvent('tapKey', {
        numberString: ''
      });
    },
    tapNext: function () {
      // 触发事件，向父组件发送数据  
      this.triggerEvent('tapNext');
    },
    tapSubmit: function () {
      // 触发事件，向父组件发送数据  
      this.triggerEvent('tapSubmit');
    }
  }
})