/**
 * 题目处理工具
 * 提供题目检查、统计、分组等功能
 */
export default {
  checkAnswer(userAnswer, correctAnswer) {
    if (Array.isArray(correctAnswer)) {
      return JSON.stringify(userAnswer?.sort()) === JSON.stringify(correctAnswer.sort())
    }
    return userAnswer === correctAnswer
  },

  calculateAccuracy(answers) {
    const correct = answers.filter(item => item.isCorrect).length
    return ((correct / answers.length) * 100).toFixed(1)
  },

  getStatistics(answers) {
    return {
      total: answers.length,
      answered: answers.filter(item => item.userAnswer).length,
      correct: answers.filter(item => item.isCorrect).length,
      wrong: answers.filter(item => !item.isCorrect && item.userAnswer).length,
      unmarked: answers.filter(item => !item.userAnswer).length,
      marked: answers.filter(item => item.isMarked).length
    }
  },

  groupByCategory(questions) {
    return questions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = []
      }
      acc[q.category].push(q)
      return acc
    }, {})
  },

  groupByDifficulty(questions) {
    return questions.reduce((acc, q) => {
      const difficulty = q.difficulty || 'medium'
      if (!acc[difficulty]) {
        acc[difficulty] = []
      }
      acc[difficulty].push(q)
      return acc
    }, {})
  },

  shuffleQuestions(questions) {
    const shuffled = [...questions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

  getRandomQuestions(questions, count) {
    const shuffled = this.shuffleQuestions(questions)
    return shuffled.slice(0, count)
  },

  getQuestionTypes() {
    return [
      { id: 'single', name: '单选题' },
      { id: 'multi', name: '多选题' },
      { id: 'judge', name: '判断题' }
    ]
  },

  getDifficultyLevels() {
    return [
      { id: 'easy', name: '简单', color: '#00A870' },
      { id: 'medium', name: '中等', color: '#FF9800' },
      { id: 'hard', name: '困难', color: '#E34D59' }
    ]
  },

  formatQuestionContent(content) {
    if (!content) return ''
    return content.replace(/\n/g, '<br>')
  },

  getOptionLabel(index) {
    return String.fromCharCode(65 + index)
  }
}
