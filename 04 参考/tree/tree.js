import router from "../../../router/index"
import Api from "../../../interface/request"
import $ from '../../../toolbox/tool'

//获取小程序全局
const app = getApp()
//简道云表单ID
const app_id = '632eba7e35faf20008ef9e45'
const question_entry_id = '6406b53542490b00078a5b81'     //组题明细题目ID
const questionbank_entry_id = '63f31de7a7d95b000873d000'   //题库ID

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    treeNodes: {
      type: Array,
      value: []
    },
    expandAll: {    //是否展开全部节点
      type: Boolean,
      value: false
    },
    page: {
      type: String,
      value: ''
    },
    exam_name: {
      type: String,
      value: ''
    },
    exam_id: {
      type: String,
      value: ''
    },
    data_id: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    }
  },
  options: {
    styleIsolation: 'shared',
  },
  observers: {
    'treeNodes': function (params) {
      params.forEach(item => {
        item.open = this.properties.expandAll // 是否展开
      })
      this.setData({
        tree: params
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    tree: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    isOpen(e) {
      const open = 'tree[' + e.currentTarget.dataset.index + '].open'
      this.setData({
        [open]: !this.data.tree[e.currentTarget.dataset.index].open
      })
    },
    //调用函数
    async getQuestionList(page, question_numbers, exam_id) {
      const $this = this
      // 页面中使用的字段
      const fields = [
        "class_name",
        "plan_name",
        "stage_name",
        "exam_name",
        "question_index",
        "question_number",
        "exam_point",
        "question_difficulty",
        "question_source",
        "question_content",
        "question_image",
        "correct_answer",
        "question_score",
        "question_id",
        "question_img_link",
        "exam_id",
        "is_material",
        "question_parse",
        "question_parse_img",
        "material_content",
        "material_image",
        "testpoint_1st",
        "testpoint_2nd",
        "testpoint_3rd",
        "testpoint_4th",
        "testpoint_5th",
        "exam_type",
        "option_lists"
      ]
      let data = {}
      let entry_id = ''
      if (page === 'report') {
        entry_id = question_entry_id
        data = {
          "limit": 2000,
          fields,
          "filter": {
            "rel": "and",
            "cond": [
              {
                "field": "exam_id",
                "type": "text",
                "method": "eq",
                "value": exam_id
              }, {
                "field": "question_number",
                "type": "text",
                "method": "in",
                "value": question_numbers
              }]

          }
        }
      } else {
        entry_id = questionbank_entry_id  //  避免重复
        data = {
          "limit": 2000,
          fields,
          "filter": {
            "rel": "and",
            "cond": [{
              "field": "question_number",
              "type": "text",
              "method": "in",
              "value": question_numbers
            }]

          }
        }
      }
      let res_data = await Api('list', app_id, entry_id, '', data)
      if (res_data.statusCode == 200) {
        let question_lists = res_data.data.data;
        question_lists.sort((a, b) => a.question_index - b.question_index); // 按照后台设置序号排序
        return question_lists
      } else {
        $.toast('题目请求失败，请重试');
      }
    },
    creatWrongsAnswer(arr) {
      let answer_lists = []
      arr.forEach(e => {
        answer_lists.push({
          _id: e._id,
          question_number: e.question_number, // question_id 为空暂时不加入
          question_score: e.question_score,  // 每一题的分值
          question_option: e.user_option,
          is_correct: '错误',
          correct_answer: e.correct_answer,
          testpoint_1st: e.testpoint_1st,
          testpoint_2nd: e.testpoint_2nd,
          testpoint_3rd: e.testpoint_3rd,
          testpoint_4th: e.testpoint_4th,
          testpoint_5th: e.testpoint_5th,
          exam_point: e.exam_point
        })
      });
      return answer_lists
    },
    async analysis(e) {
      const $this = this
      let questions = e.currentTarget.dataset.questions
      let question_numbers = questions.map(item => item = item.question_number)
      let exam_name = $this.data.exam_name
      let exam_id = $this.data.exam_id
      let page = $this.data.page
      let title = $this.data.title
      let data_id = $this.data.data_id
      let question_lists = await $this.getQuestionList(page, question_numbers, exam_id)
      let pushPage = 'details'
      let answer_lists = $this.creatWrongsAnswer(questions)
      if (page === 'report') {
        pushPage = 'analysis'
      } else if (page === 'wrongs') {
        if (title === '看解析') {
          pushPage = 'details'
        } else {
          pushPage = 'brusherrors'  //刷错题模式
        }
      }
      //题目原始ID
      let original_ids = questions.map(item => {
        return { _id: item._id, question_number: item.question_number }
      }
      )
      //如果请求失败即终止跳转      
      if (question_lists.length === 0) { return $.toast('题目请求失败') }
      //跳转至详情页
      router.push(pushPage, {}, res => {
        res.eventChannel.emit('userAnswer', {
          exam_name,
          question_lists,
          answer_lists,
          original_ids,
          exam_id,
          title,
          data_id,
          page
        })
      })
    },
  }
})
