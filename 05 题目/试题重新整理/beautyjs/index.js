const fs = require('fs');
const input = require('./input.json'); 

function getRandomDifficulty() {
    const difficulties = ['容易', '适中', '困难'];
    const randomIndex = Math.floor(Math.random() * difficulties.length);
    return difficulties[randomIndex];
}

const orgin_id = 'gwy0'
const orgin_num = '445'

const output = input.content.map((item,index) => {
  const { id, createTime, realId, level, subjectDo } = item;
  const { type, typeId, correctAnswer,material, content, optList,singleRight,analysis,typeName,labelText,labelsArray_text,examPointName} = subjectDo;
  return {
    exam_type:'公职类',
    exam_subtype:'公职类行测',
    question_source:'2021年贵州省公务员录用考试《行测》题', 
    question_difficulty:getRandomDifficulty(),
    question_type:labelText?labelText:'未分类',
    exam_point:examPointName?examPointName:'未分类',
    question_index:index+1,
    question_id: orgin_id + Number(Number(orgin_num)+Number(index+1)), 
    type_name:typeName,
    level,
    type,
    type_id:typeId, 
    question_score:2,  
    question_material:material,
    question_content:content,
    correct_answer:singleRight,
    question_options: optList.map(opt => ({ label: opt.label, content: opt.content })),
    question_parse:analysis
  };
});

// 将 json 数组转换成字符串
let str = '';
for (const item of output) {
  // 必须使用 \n 换行区别每个记录
  str += JSON.stringify(item) + "\n";
}

fs.writeFile('./2021年贵州省公务员录用考试《行测》题.json', str, err => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File has been created');
});
