var data = [
    {
      serial: "一、",
      firstsort: '加减计算',
      items: [
        { uniqueId:"addandsubtract01",serial: "（一）", secondsort: '两个两位数相加', functionType: "addOne" },
        { uniqueId:"addandsubtract02",serial: "（二）", secondsort: '三个两位数相加', functionType: "addTwo" },
        { uniqueId:"addandsubtract03",serial: "（三）", secondsort: '两个三位数相减', functionType: "addThree" },
        { uniqueId:"addandsubtract04",serial: "（四）", secondsort: '四个两位数相加', functionType: "addFour" },
        { uniqueId:"addandsubtract05",serial: "（五）", secondsort: '两个三位数相加', functionType: "addFive" },
        { uniqueId:"addandsubtract06",serial: "（六）", secondsort: '三个三位数相加', functionType: "addSix" }]
    },
    {
      serial: "二、",
      firstsort: '除法口算',
      items: [
        { uniqueId:"division01",serial: "（一）", secondsort: '试商首位有效数字', functionType: "divisionOne" },
        { uniqueId:"division02",serial: "（二）", secondsort: '试商前两位有效数字', functionType: "divisionTwo"},
        { uniqueId:"division03",serial: "（三）", secondsort: '(A1+A2)/(B1+B2)', functionType: "divisionThree"},
        { uniqueId:"division04",serial: "（四）", secondsort: '五个两位数加和相除', functionType: "divisionFour"}]
    },
    {
      serial: "三、",
      firstsort: '乘法口算',
      items: [
        { uniqueId:"multiplication01",serial: "（一）", secondsort: '乘数是11', functionType: "multiplicationOne"},
        { uniqueId:"multiplication02",serial: "（二）", secondsort: '尾数是5×偶数', functionType: "multiplicationTwo"},
        { uniqueId:"multiplication03",serial: "（三）", secondsort: '头同尾和相乘', functionType: "multiplicationThree"},
        { uniqueId:"multiplication04",serial: "（四）", secondsort: '1x乘1x',  functionType: "multiplicationFour"}]
    },
    {
      serial: "四、",
      firstsort: '特殊分数',
      items: [
        { uniqueId:"fraction01",serial: "（一）",  secondsort: '特殊分数记忆',  functionType: "specialFractionOne"},
        { uniqueId:"fraction02",serial: "（二）", secondsort: '算增长量',  functionType: "specialFractionTwo"},
        { uniqueId:"fraction03",serial: "（三）",  secondsort: '口算除法A/B',  functionType: "specialFractionThree"},
        { uniqueId:"fraction04",serial: "（四）",  secondsort: '口算乘法A*B',  functionType: "specialFractionFour"}]
    }
  ]

 export default data 