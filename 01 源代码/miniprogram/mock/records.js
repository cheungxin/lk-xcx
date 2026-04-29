const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMockPracticeRecords() {
  const today = new Date('2026-03-26')
  const yesterday = new Date(today)
  const twoDaysAgo = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  twoDaysAgo.setDate(today.getDate() - 2)

  return [
    {
      id: 'r001',
      type: '快练',
      title: '言语理解专项快练',
      questions: 10,
      correct: 8,
      accuracy: 80,
      time: '12:30',
      duration: '8分钟',
      date: formatDate(today),
    },
    {
      id: 'r002',
      type: '专项练习',
      title: '判断推理 > 图形推理',
      questions: 15,
      correct: 11,
      accuracy: 73,
      time: '10:15',
      duration: '18分钟',
      date: formatDate(today),
    },
    {
      id: 'r003',
      type: '模拟刷题',
      title: '2026国考行测模拟卷（一）',
      questions: 20,
      correct: 13,
      accuracy: 65,
      time: '08:00',
      duration: '35分钟',
      date: formatDate(today),
    },
    {
      id: 'r004',
      type: '每日一练',
      title: `行测每日一练 ${formatDate(yesterday)}`,
      questions: 5,
      correct: 4,
      accuracy: 80,
      time: '21:00',
      duration: '9分钟',
      date: formatDate(yesterday),
    },
    {
      id: 'r005',
      type: '专项练习',
      title: '数量关系 > 数学运算',
      questions: 10,
      correct: 5,
      accuracy: 50,
      time: '15:30',
      duration: '16分钟',
      date: formatDate(yesterday),
    },
    {
      id: 'r006',
      type: '模拟刷题',
      title: '省考行测全真模拟',
      questions: 20,
      correct: 14,
      accuracy: 70,
      time: '09:00',
      duration: '32分钟',
      date: formatDate(twoDaysAgo),
    },
  ]
}
