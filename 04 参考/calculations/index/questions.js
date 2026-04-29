//两个两位数相加
function getAdditionOfTens(numberOfQuestions) {
    const quiz = [];
    const usedPairs = new Set();
    for (let i = 0; i < numberOfQuestions; i++) {
        let pairFound = false;
        let num1, num2;
        while (!pairFound) {
            num1 = Math.floor(Math.random() * 90) + 10;
            num2 = Math.floor(Math.random() * 90) + 10;
            [num1, num2] = [Math.min(num1, num2), Math.max(num1, num2)];
            const pairKey = `${num1},${num2}`;
            if (!usedPairs.has(pairKey)) {
                pairFound = true;
                usedPairs.add(pairKey);
            }
        }
        quiz.push({
            question: `${num1} + ${num2} =`,
            isNormal:true,
            correctAnswer: num1 + num2
        });
    }

    return quiz;
}
//三个两位数相加
function getThreeNumberAdditionQuiz(numberOfQuestions) {
    const quiz = [];
    const usedCombinations = new Set();
    const possibleNumbers = Array.from({ length: 90 }, (_, i) => i + 10); // 10 to 99
    while (quiz.length < numberOfQuestions) {
        let [num1, num2, num3] = Array.from({ length: 3 }, () =>
            possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)]
        ).sort((a, b) => a - b);

        const combinationKey = `${num1},${num2},${num3}`;

        if (!usedCombinations.has(combinationKey)) {
            usedCombinations.add(combinationKey);
            const answer = num1 + num2 + num3;
            quiz.push({
                question: `${num1} + ${num2} + ${num3} =`,
                isNormal:true,
                correctAnswer: answer
            });
        }
    }
    return quiz;
}

//两个三位数相减
function getSubtractionOfThreeDigits(numberOfQuestions) {
    const quiz = [];
    const usedPairs = new Set();
    for (let i = 0; i < numberOfQuestions; i++) {
        let pairFound = false;
        let num1, num2;
        while (!pairFound) {
            num1 = Math.floor(Math.random() * 900) + 100;
            num2 = Math.floor(Math.random() * 900) + 100;
            [num1, num2] = [Math.max(num1, num2), Math.min(num1, num2)]; // 确保 num1 >= num2
            const pairKey = `${num1},${num2}`;
            if (!usedPairs.has(pairKey)) {
                pairFound = true;
                usedPairs.add(pairKey);
            }
        }
        quiz.push({
            question: `${num1} - ${num2} =`,
            isNormal:true,
            correctAnswer: num1 - num2
        });
    }

    return quiz;
}

//四个两位数相加
function getAdditionOfFourTens(numberOfQuestions) {
    const quiz = [];
    for (let i = 0; i < numberOfQuestions; i++) {
        const num1 = Math.floor(Math.random() * 90) + 10;
        const num2 = Math.floor(Math.random() * 90) + 10;
        const num3 = Math.floor(Math.random() * 90) + 10;
        const num4 = Math.floor(Math.random() * 90) + 10;
        quiz.push({
            question: `${num1} + ${num2} + ${num3} + ${num4} =`,
            isNormal:true,
            correctAnswer: num1 + num2 + num3 + num4
        });
    }

    return quiz;
}

//两个三位数相加
function getAdditionOfTwoThreeDigits(numberOfQuestions) {
    const quiz = [];
    const usedPairs = new Set();
    for (let i = 0; i < numberOfQuestions; i++) {
        let pairFound = false;
        let num1, num2;
        while (!pairFound) {
            num1 = Math.floor(Math.random() * 900) + 100;
            num2 = Math.floor(Math.random() * 900) + 100;
            const pairKey = `${num1},${num2}`;
            if (!usedPairs.has(pairKey)) {
                pairFound = true;
                usedPairs.add(pairKey);
            }
        }
        quiz.push({
            question: `${num1} + ${num2} =`,
            isNormal:true,
            correctAnswer: num1 + num2
        });
    }

    return quiz;
}

//三个三位数相加
function getAdditionOfThreeThreeDigits(numberOfQuestions) {
    const quiz = [];
    for (let i = 0; i < numberOfQuestions; i++) {
        const num1 = Math.floor(Math.random() * 900) + 100;
        const num2 = Math.floor(Math.random() * 900) + 100;
        const num3 = Math.floor(Math.random() * 900) + 100;
        quiz.push({
            question: `${num1} + ${num2} + ${num3} =`,
            isNormal:true,
            correctAnswer: num1 + num2 + num3
        });
    }

    return quiz;
}

//试商首位有效数字代码实现
function generateSignificantDigitDivision(numberOfQuestions) {
    // 生成大于1的三位数或带小数点的三位有效数字  
    function generateRandomNumber() {
        const formatType = Math.random(); // 随机决定生成整数或小数
    
        if (formatType < 0.5) {
            // 生成100到999之间的整数
            return Math.floor(Math.random() * 900) + 100; // 100到999之间
        } else {
            // 生成带小数的数，确保有效数字总数为3
            const integerPart = Math.floor(Math.random() * 9) + 1; // 生成1到9的整数作为整数部分
            const decimalPart = Math.floor(Math.random() * 90) + 10; // 生成10到99的整数作为小数部分
    
            // 返回格式为 x.y 的数，其中x是1到9，y是10到99
            return parseFloat(`${integerPart}.${decimalPart}`);
        }
    }
    

    // 提取首位和次位有效数字的函数  
    function extractValidSignificantDigits(number) {   
        const absNumber = Math.abs(number);
        if (absNumber === 0) return [0];
    
        const strNumber = absNumber.toString().replace('.', '');
        let significantDigits = '';
        let count = 0;
    
         // 提取前两位非零数字 
         for (let i = 0; i < strNumber.length; i++) {
            if (strNumber[i] === '.') { 
                continue;
            }
            if (strNumber[i] !== '0') {
                significantDigits += strNumber[i];
                count++;
            } else if (count > 0) { // 非零数字后可以有零
                significantDigits += strNumber[i];
            }
            if (count === 2) break; // 只需要前两位有效数字
        }
    
        if (significantDigits.length < 2) return [parseInt(significantDigits, 10)];
    
        const firstDigit = parseInt(significantDigits[0], 10);
        const secondDigit = parseInt(significantDigits[1], 10);
    
        const validAnswers = [firstDigit];
        if (secondDigit >= 8) {
            validAnswers.push(firstDigit + 1);
        }
    
        return validAnswers;
    }

    const quiz = [];
    for (let i = 0; i < numberOfQuestions; i++) {
        const num1 = generateRandomNumber();
        const num2 = generateRandomNumber();
        const result = num1 / num2;
        const correctAnswers = extractValidSignificantDigits(result);
        quiz.push({
            question: `${num1} ÷ ${num2} =`,
            numerator: `${num1}`, // 返回的分子
            denominator: `${num2}`,  
            fractional:true,
            anotherLine:true,  
            isNormal:false,
            multipleAnswers: true, // 允许选择多个答案
            auxiliaryText:'首位有效数字为',
            correctAnswer: correctAnswers
        });
    }
    return quiz;
}

//试商前两位有效数字
function generateValidSignificantDigitQuizzes(numberOfQuestions) {
    // 生成三位数有效数字的函数
    function generateRandomNumber() {
        // 50%的概率生成带小数点的数或者整数，大于1的数
        return (Math.random() < 0.5
            ? Math.floor(Math.random() * 900) + 100  // 生成整数
            : parseFloat((Math.random() * 9 + 1).toFixed(2))); // 生成带小数的数
    }

    // 提取前三位有效数字的函数
    function extractValidSignificantDigits(number) {
        const absNumber = Math.abs(number);
        if (absNumber === 0) return [0];
    
        const strNumber = absNumber.toString();
        let significantDigits = '';
        let count = 0;
        let decimalFound = false;
    
        // 遍历数字字符串，提取有效数字
        for (let i = 0; i < strNumber.length; i++) {
            if (strNumber[i] === '.') {
                decimalFound = true;
                continue;
            }
            if (strNumber[i] !== '0') {
                significantDigits += strNumber[i];
                count++;
            } else if (count > 0) { // 非零数字后可以有零
                significantDigits += strNumber[i];
            }
            if (count === 3) break;
        }
    
        // 如果有效数字少于3位，直接返回
        if (significantDigits.length < 3) {
            return [parseInt(significantDigits, 10)];
        }
    
        // 提取前两位和第三位数字
        const firstTwoDigits = parseInt(significantDigits.slice(0, 2), 10);
        const thirdDigit = parseInt(significantDigits[2], 10);
    
        const validAnswers = [firstTwoDigits];
        if (thirdDigit >= 8) {
            validAnswers.push(firstTwoDigits + 1);
        }
    
        return validAnswers;
    }

    const quiz = [];

    for (let i = 0; i < numberOfQuestions; i++) {
        // 随机生成两个三位数有效数字或者带小数点的数
        const num1 = generateRandomNumber();
        const num2 = generateRandomNumber();

        // 计算除法结果
        const result = num1 / num2;

        // 提取前三位有效数字，并考虑第三位的进位情况
        const correctAnswers = extractValidSignificantDigits(result);

        // 创建题目
        quiz.push({
            question: `${num1} ÷ ${num2} =`,
            numerator: `${num1}`, // 返回的分子
            denominator: `${num2}`,  
            anotherLine:true,  
            fractional:true,
            isNormal:false,
            auxiliaryText:'前两位有效数字为',
            multipleAnswers: true, // 允许选择多个答案
            correctAnswer: correctAnswers // 返回的正确答案是两位有效数字的数组，可能有两个值
        });
    }

    return quiz;
}

//(A1+A2)/(B1+B2)型
function generateSignificantDigitAdditionDivisionQuiz(numberOfQuestions) {
    // 生成两位数到三位数的随机数
    function generateRandomNumber() {
        return Math.floor(Math.random() * 900) + 10; // 生成[10, 999]之间的随机数
    }

    // 提取前两位有效数字的函数
    function extractValidSignificantDigits(number) {   
        const absNumber = Math.abs(number);
        if (absNumber === 0) return [0];
    
        const strNumber = absNumber.toString().replace('.', '');
        let significantDigits = '';
        let count = 0;
    
        for (let i = 0; i < strNumber.length; i++) {
            if (strNumber[i] === '.') { 
                continue;
            }
            if (strNumber[i] !== '0') {
                significantDigits += strNumber[i];
                count++;
            } else if (count > 0) { // 非零数字后可以有零
                significantDigits += strNumber[i];
            }
            if (count === 2) break; // 只需要前两位有效数字
        }
    
        if (significantDigits.length < 2) return [parseInt(significantDigits, 10)];
    
        const firstDigit = parseInt(significantDigits[0], 10);
        const secondDigit = parseInt(significantDigits[1], 10);
    
        const validAnswers = [firstDigit];
        if (secondDigit >= 8) {
            validAnswers.push(firstDigit + 1);
        }
    
        return validAnswers;
    }

    // 四舍五入取前三位数
    function roundToThreeDigits(number) {
        return Math.round(number * 1000) / 1000;
    }

    const quiz = [];

    for (let i = 0; i < numberOfQuestions; i++) {
        // 随机生成A1, A2, B1, B2
        const A1 = generateRandomNumber();
        const A2 = generateRandomNumber();
        const B1 = generateRandomNumber();
        const B2 = generateRandomNumber();

        // 计算分子和分母
        const numerator = A1 + A2;
        let denominator = B1 + B2;

        // 如果分母超过三位数，则进行四舍五入处理
        if (denominator >= 1000) {
            denominator = roundToThreeDigits(denominator);
        }

        // 计算结果
        const result = numerator / denominator;

        // 提取首位有效数字
        const correctAnswers = extractValidSignificantDigits(result);

        // 创建题目
        quiz.push({
            question: `(${A1} + ${A2}) ÷ (${B1} + ${B2}) =`,
            numerator: `${A1} + ${A2}`, // 返回的分子
            denominator: `${B1} + ${B2}`,   
            fractional:true,
            anotherLine:true,  
            isNormal:false,
            multipleAnswers: true, // 允许选择多个答案
            auxiliaryText:'试商首位有效数字为',
            correctAnswer: correctAnswers // 返回的正确答案是一个数组，可能包含两个值
        });
    }

    return quiz;
}

//五个两位数加和除以五个两位数加和
function generateFractionQuizzes(numberOfQuestions) {
    // 生成1~2位数的函数，并确保至少有一个是两位数
    function generateRandomNumbers() {
        const numbers = [];
        let hasTwoDigit = false;

        for (let i = 0; i < 5; i++) {
            let num = Math.floor(Math.random() * 90) + 1; // 生成1到99的随机数
            if (num >= 10) hasTwoDigit = true; // 检查是否为两位数
            numbers.push(num);
        }

        // 如果五个数里没有两位数，则强制将第一个数变成两位数
        if (!hasTwoDigit) {
            numbers[0] = Math.floor(Math.random() * 90) + 10; // 确保第一个数为两位数
        }

        return numbers;
    }

    // 提取前两位有效数字的函数
    function extractValidSignificantDigits(number) {   
        const absNumber = Math.abs(number);
        if (absNumber === 0) return [0];
    
        const strNumber = absNumber.toString().replace('.', '');
        let significantDigits = '';
        let count = 0;
    
        for (let i = 0; i < strNumber.length; i++) {
            if (strNumber[i] === '.') { 
                continue;
            }
            if (strNumber[i] !== '0') {
                significantDigits += strNumber[i];
                count++;
            } else if (count > 0) { // 非零数字后可以有零
                significantDigits += strNumber[i];
            }
            if (count === 2) break; // 只需要前两位有效数字
        }
    
        if (significantDigits.length < 2) return [parseInt(significantDigits, 10)];
    
        const firstDigit = parseInt(significantDigits[0], 10);
        const secondDigit = parseInt(significantDigits[1], 10);
    
        const validAnswers = [firstDigit];
        if (secondDigit >= 8) {
            validAnswers.push(firstDigit + 1);
        }
    
        return validAnswers;
    }

    const quiz = [];

    for (let i = 0; i < numberOfQuestions; i++) {
        // 随机生成两个1~2位数的列表，确保至少有一个是两位数
        const numeratorNumbers = generateRandomNumbers();
        const denominatorNumbers = generateRandomNumbers();

        // 计算分子和分母的和
        const numeratorSum = numeratorNumbers.reduce((sum, num) => sum + num, 0);
        const denominatorSum = denominatorNumbers.reduce((sum, num) => sum + num, 0);

        // 计算分子除以分母的结果
        const result = numeratorSum / denominatorSum;

        // 提取前两位有效数字，并根据第三位进行四舍五入
        const correctAnswers = extractValidSignificantDigits(result);

        // 创建题目
        quiz.push({
            question: `(${numeratorNumbers.join(' + ')}) ÷ (${denominatorNumbers.join(' + ')}) =`,
            numerator: `${numeratorNumbers.join(' + ')}`, // 返回的分子
            denominator: `${denominatorNumbers.join(' + ')}`,   
            fractional:true,
            anotherLine:true,
            isNormal:false,  
            multipleAnswers: true, // 允许选择多个答案
            auxiliaryText:'试商首位有效数字为',
            correctAnswer: correctAnswers // 返回的正确答案是一个数组，可能包含两个值
        });
    }

    return quiz;
}

//有一个乘数是11
function generateMultiplicationQuiz(numberOfQuestions) {
    // 生成一个随机的两位数，确保个位不是0
    function generateRandomTwoDigitNumber() {
        let num;
        do {
            const tenDigit = Math.floor(Math.random() * 9) + 1; // 十位：1到9
            const oneDigit = Math.floor(Math.random() * 9) + 1; // 个位：1到9，避免0
            num = tenDigit * 10 + oneDigit; // 组合成两位数
        } while (num % 10 === 0); // 确保个位不是0
        return num;
    }

    const quiz = [];

    for (let i = 0; i < numberOfQuestions; i++) {
        const num = generateRandomTwoDigitNumber(); // 生成两位数
        const result = num * 11; // 计算两位数乘以11的结果

        // 创建题目
        quiz.push({
            question: `${num} × 11 =`, // 两位数乘以11的题目
            isNormal: true,
            correctAnswer: result // 精确答案
        });
    }

    return quiz;
}
  
//尾数是5×偶数
function generateEvenNumberMultiplicationQuiz(numberOfQuestions) {
    // 生成随机偶数（2到30之间，排除尾数为0的偶数）
    function generateRandomEvenNumber() {
        const evenNumbers = [];
        for (let i = 2; i <= 30; i += 2) {
            if (i % 10 !== 0) { // 排除尾数为0的偶数
                evenNumbers.push(i);
            }
        }
        return evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
    }

    // 生成以5结尾的随机数（5, 15, 25, 35,...）
    function generateRandomMultipleOf5(previous) {
        const multiplesOf5 = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
        const filteredMultiples = multiplesOf5.filter(num => num !== previous);
        return filteredMultiples[Math.floor(Math.random() * filteredMultiples.length)];
    }

    const generatedResults = new Set();
    const quiz = [];
    let lastMultipleOf5 = null;

    function generateUniqueQuestion() {
        const evenNumber = generateRandomEvenNumber();
        const multipleOf5 = generateRandomMultipleOf5(lastMultipleOf5);
        const result = evenNumber * multipleOf5;
        
        if (!generatedResults.has(result)) {
            generatedResults.add(result);
            lastMultipleOf5 = multipleOf5; // 更新最后使用的倍数5
            return {
                question: `${evenNumber} × ${multipleOf5} =`,
                isNormal: true,
                correctAnswer: result
            };
        } else {
            return generateUniqueQuestion();
        }
    }

    while (quiz.length < numberOfQuestions) {
        quiz.push(generateUniqueQuestion());
    }

    return quiz;
}
 
//头同尾和乘
function generateUniqueHeadTailSumMultiplicationQuiz(numberOfQuestions) {
    // 生成满足条件的乘法题目
    function generateValidNumbers() {
        const validPairs = [];
        // 遍历首位数字
        for (let head = 1; head <= 9; head++) {
            // 遍历尾部数字
            for (let tail1 = 1; tail1 <= 9; tail1++) { // 从1开始，避免尾数为0
                const tail2 = 10 - tail1; // 计算另一个尾部数字
                if (tail2 >= 1 && tail2 <= 9) { // 确保tail2是一个合法的数字，且不为0
                    const num1 = head * 10 + tail1; // 生成第一个两位数
                    const num2 = head * 10 + tail2; // 生成第二个两位数
                    validPairs.push([num1, num2]); // 存储有效的数字对
                }
            }
        }
        return validPairs;
    }

    const quiz = [];
    const validNumbers = generateValidNumbers(); // 生成有效的数字对
    const usedPairs = new Set(); // 用于存储已使用的题目对

    while (quiz.length < numberOfQuestions && validNumbers.length > 0) {
        // 随机选择一对数字
        const randomIndex = Math.floor(Math.random() * validNumbers.length);
        const [num1, num2] = validNumbers[randomIndex];

        // 生成题目的唯一字符串
        const questionKey = `${num1}×${num2}`;
        if (!usedPairs.has(questionKey)) {
            usedPairs.add(questionKey); // 记录已使用的题目对
            const result = num1 * num2; // 计算结果

            // 创建题目
            quiz.push({
                question: `${num1} × ${num2} =`, // 题目
                isNormal: true,
                correctAnswer: result // 精确答案
            });
        }

        // 从有效数字对中移除已使用的对
        validNumbers.splice(randomIndex, 1);
    }

    return quiz;
}
 //1x乘1x
function generateUniqueOneHeadMultiplicationQuiz(numberOfQuestions) {
    // 生成满足条件的乘法题目
    function generateValidNumbers() {
        const validPairs = [];

        // 遍历尾部数字
        for (let tail1 = 0; tail1 <= 9; tail1++) {
            for (let tail2 = 0; tail2 <= 9; tail2++) {
                const num1 = 10 + tail1; // 生成以1开头的两位数
                const num2 = 10 + tail2; // 生成以1开头的两位数
                // 排除尾数为0的情况
                if (tail1 !== 0 && tail2 !== 0) {
                    validPairs.push([num1, num2]); // 存储有效的数字对
                }
            }
        }
        return validPairs;
    }

    const quiz = [];
    const validNumbers = generateValidNumbers(); // 生成有效的数字对
    const usedPairs = new Set(); // 用于存储已使用的题目对

    while (quiz.length < numberOfQuestions && validNumbers.length > 0) {
        // 随机选择一对数字
        const randomIndex = Math.floor(Math.random() * validNumbers.length);
        const [num1, num2] = validNumbers[randomIndex]; 
        // 生成题目的唯一字符串
        const questionKey = `${num1}×${num2}`;
        if (!usedPairs.has(questionKey)) {
            usedPairs.add(questionKey); // 记录已使用的题目对
            const result = num1 * num2; // 计算结果

            // 创建题目
            quiz.push({
                question: `${num1} × ${num2} =`, // 题目
                isNormal: true,
                correctAnswer: result // 精确答案
            });
        } 
        // 从有效数字对中移除已使用的对
        validNumbers.splice(randomIndex, 1);
    } 
    return quiz;
}

//口算除法：A/B为两位数，B为特殊分数附近的数
function generateSpecialFractionDivisionQuiz(numberOfQuestions) { 
    // 定义特殊分数的范围和对应的倍数
    const specialRanges = [
        { range: [110, 113], multiplier: 9 },
        { range: [123, 127], multiplier: 8 },
        { range: [141, 145], multiplier: 7 },
        { range: [164, 169], multiplier: 6 },
        { range: [247, 253], multiplier: 4 },
        { range: [330, 336], multiplier: 3 },
        { range: [490, 510], multiplier: 2 }
    ];

    const quiz = [];
    const usedQuestions = new Set(); 
    while (quiz.length < numberOfQuestions) {
        const BRangeIndex = Math.floor(Math.random() * specialRanges.length);
        const { range, multiplier } = specialRanges[BRangeIndex];
        const B = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]; // 在指定范围内生成B
        const A = Math.floor(Math.random() * 9) + 1; // A为一位数 (1~9)
        
        // 计算除法结果并将其看作乘法
        const result = multiplier*A  //原始值A / B; 

        // 生成题目的唯一字符串，确保不重复
        const questionKey = `${A} ÷ ${B}`;
        if (!usedQuestions.has(questionKey)) {
            usedQuestions.add(questionKey); // 记录已使用的题目对

            // 创建题目
            quiz.push({
                question: `${A} ÷ ${B} =`, // 题目
                numerator: `${A}`, // 返回的分子
                denominator: `${B}`,
                isNormal: false,
                fractional: true,
                anotherLine: true,
                auxiliaryText: '看成特殊分数后计算结果的有效数字',
                correctAnswer: result // 有效数字
            });
        }
    }

    return quiz;
}

//特殊分数：计算增长率
function generateGrowthCalculationQuiz(numberOfQuestions) {
    const quiz = [];
    const fractions = [
        { percent: 50, fraction: "1/2", denominator: 2 },
        { percent: 33.3, fraction: "1/3", denominator: 3 },
        { percent: 25, fraction: "1/4", denominator: 4 },
        { percent: 20, fraction: "1/5", denominator: 5 },
        { percent: 16.7, fraction: "1/6", denominator: 6 },
        { percent: 14.3, fraction: "1/7", denominator: 7 },
        { percent: 12.5, fraction: "1/8", denominator: 8 },
        { percent: 11.1, fraction: "1/9", denominator: 9 },
        { percent: 10, fraction: "1/10", denominator: 10 },
        { percent: 9.1, fraction: "1/11", denominator: 11 },
        { percent: 8.3, fraction: "1/12", denominator: 12 },
        { percent: 7.7, fraction: "1/13", denominator: 13 },
        { percent: 7.1, fraction: "1/14", denominator: 14 },
        { percent: 6.7, fraction: "1/15", denominator: 15 },
        { percent: 6.25, fraction: "1/16", denominator: 16 },
        { percent: 5.9, fraction: "1/17", denominator: 17 },
        { percent: 5.6, fraction: "1/18", denominator: 18 },
        { percent: 5.3, fraction: "1/19", denominator: 19 },
        { percent: 5, fraction: "1/20", denominator: 20 },
        { percent: 4, fraction: "1/25", denominator: 25 }
    ];

    // 根据 xPercent 寻找最接近的特殊分数
    function getClosestFraction(xPercent) {
        let closest = fractions[0];
        let minDiff = Math.abs(xPercent - closest.percent);

        for (let i = 1; i < fractions.length; i++) {
            const diff = Math.abs(xPercent - fractions[i].percent);
            if (diff < minDiff) {
                closest = fractions[i];
                minDiff = diff;
            }
        }
        return closest;
    }

    // 提取前三位有效数字
    function extractValidSignificantDigits(number) {
        const absNumber = Math.abs(number);
        if (absNumber === 0) return [0];
    
        const strNumber = absNumber.toString();
        let significantDigits = '';
        let count = 0;
        let decimalFound = false;
    
        // 遍历数字字符串，提取有效数字
        for (let i = 0; i < strNumber.length; i++) {
            if (strNumber[i] === '.') {
                decimalFound = true;
                continue;
            }
            if (strNumber[i] !== '0') {
                significantDigits += strNumber[i];
                count++;
            } else if (count > 0) { // 非零数字后可以有零
                significantDigits += strNumber[i];
            }
            if (count === 3) break;
        }
    
        // 如果有效数字少于3位，直接返回
        if (significantDigits.length < 3) {
            return [parseInt(significantDigits, 10)];
        }
    
        // 提取前两位和第三位数字
        const firstTwoDigits = parseInt(significantDigits.slice(0, 2), 10);
        const thirdDigit = parseInt(significantDigits[2], 10);
    
        const validAnswers = [firstTwoDigits];
        if (thirdDigit >= 8) {
            validAnswers.push(firstTwoDigits + 1);
        }
    
        return validAnswers;
    }

    // 根据 A 和 xPercent 计算结果
    function calculateResult(A, xPercent, addFraction) {
        const closestFraction = getClosestFraction(xPercent);
        const denominator = closestFraction.denominator;
        let result;

        if (addFraction) {
            result = A / (denominator + 1);
        } else {
            result = A / (denominator - 1);
        }
        return extractValidSignificantDigits(result);
    }

    const usedQuestions = new Set();

    for (let i = 0; i < numberOfQuestions; i++) {
        let questionGenerated = false;
        while (!questionGenerated) {
            const A =  Math.floor(Math.random() * 900) + 100;
            const randomIndex = Math.floor(Math.random() * fractions.length);
            const basePercent = fractions[randomIndex].percent;
            
            const xPercent = basePercent + (Math.random() * 0.2 - 0.1); // ±0.1% 范围内生成 x%

            const addFraction = Math.random() < 0.5;
            const correctAnswer = calculateResult(A, xPercent, addFraction);
            const operation = addFraction ? `(1 + ${xPercent.toFixed(1)}%)` : `(1 - ${xPercent.toFixed(1)}%)`;

            const question = `${A} / ${operation} * ${xPercent.toFixed(1)}%`;

            if (!usedQuestions.has(question)) {
                quiz.push({
                    question: question, // 题目
                    numerator: `${A}`, // 返回的分子
                    denominator: `${operation}`, 
                    isNormal:false,
                    fractional:true,
                    multiplyingTerm:`${xPercent.toFixed(1)}%`, 
                    anotherLine:true,  
                    auxiliaryText:'看成特殊分数后结果前两位有效数字为',
                    multipleAnswers:true, //多个答案
                    correctAnswer: correctAnswer, 
                });
                usedQuestions.add(question);
                questionGenerated = true;
            }
        }
    }

    return quiz;
}

 
//口算乘法：计算A×B，A为三位数，B为特殊分数附近的数
function generateSpecialFractionMultiplicationQuiz(numberOfQuestions) { 
    // 提取前两位有效数字的函数
    function extractSignificantDigits(number) {
        const absNumber = Math.abs(number).toFixed(8); // 保留8位小数防止精度问题
        const strNumber = absNumber.toString().replace('.', '');
        let significantDigits = '';
        let count = 0;  
        // 提取前两位非零数字 
        for (let i = 0; i < strNumber.length; i++) {
            if (strNumber[i] === '.') { 
                continue;
            }
            if (strNumber[i] !== '0') {
                significantDigits += strNumber[i];
                count++;
            } else if (count > 0) { // 非零数字后可以有零
                significantDigits += strNumber[i];
            }
            if (count === 2) break; // 只需要前两位有效数字
        }
        // 确保至少返回两位有效数字
        if (significantDigits.length < 2) {
            return [parseInt(significantDigits, 10)];
        } 
        let validDigits = [];
        const firstDigit = parseInt(significantDigits[0], 10);
         validDigits.push(firstDigit); 
        return validDigits;
    }

    // 定义特殊分数的范围和对应的倍数
    const specialRanges = [
        { range: [110, 113], multiplier: 9 },
        { range: [123, 127], multiplier: 8 },
        { range: [141, 145], multiplier: 7 },
        { range: [164, 169], multiplier: 6 },
        { range: [247, 253], multiplier: 4 },
        { range: [330, 336], multiplier: 3 },
        { range: [490, 510], multiplier: 2 }
    ];

    const quiz = [];
    const usedQuestions = new Set();

    while (quiz.length < numberOfQuestions) {
        const A = Math.floor(Math.random() * 900) + 100; // 生成三位数A
        const rangeIndex = Math.floor(Math.random() * specialRanges.length);
        const { range, multiplier } = specialRanges[rangeIndex];
        const B = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]; // 在指定范围内生成B

        const result = A / multiplier; // 计算A乘特殊分数（相当于A除以multiplier）

        // 提取前两位有效数字
        const validDigits = extractSignificantDigits(result);

        // 生成题目的唯一字符串，确保不重复
        const questionKey = `${A} × ${B}`;
        if (!usedQuestions.has(questionKey)) {
            usedQuestions.add(questionKey); // 记录已使用的题目对

            // 创建题目
            quiz.push({
                question: `${A} × ${B} =`, // 题目
                isAuxiliary: true,  
                auxiliaryText: '看成特殊分数后结果首位有效数字为',
                correctAnswer: validDigits // 前两位有效数字
            });
        }
    }

    return quiz;
}

//特殊分数：特殊分数记忆
function getFractionQuiz(numberOfQuestions) {
    const quiz = [];
    const fractions = [
        { percent: 50, fraction: "1/2",denominator:2 },
        { percent: 33.3, fraction: "1/3",denominator:3 },
        { percent: 25, fraction: "1/4",denominator:4 },
        { percent: 20, fraction: "1/5" ,denominator:5},
        { percent: 16.7, fraction: "1/6",denominator:6 },
        { percent: 14.3, fraction: "1/7",denominator:7 },
        { percent: 12.5, fraction: "1/8",denominator:8 },
        { percent: 11.1, fraction: "1/9" ,denominator:9},
        { percent: 10, fraction: "1/10" ,denominator:10},
        { percent: 9.1, fraction: "1/11",denominator:11},
        { percent: 8.3, fraction: "1/12",denominator:12 },
        { percent: 7.7, fraction: "1/13" ,denominator:13},
        { percent: 7.1, fraction: "1/14" ,denominator:14},
        { percent: 6.7, fraction: "1/15" ,denominator:15},
        { percent: 6.25, fraction: "1/16" ,denominator:16},
        { percent: 5.9, fraction: "1/17" ,denominator:17},
        { percent: 5.6, fraction: "1/18",denominator:18 },
        { percent: 5.3, fraction: "1/19" ,denominator:19},
        { percent: 5, fraction: "1/20" ,denominator:20}, 
        { percent: 4, fraction: "1/25",denominator:25 }
    ];
    const usedQuestions = new Set();

    for (let i = 0; i < numberOfQuestions; i++) {
        let questionGenerated = false;
        while (!questionGenerated) {
            let randomIndex = Math.floor(Math.random() * fractions.length);
            let question = `${fractions[randomIndex].percent}% =`;
            if (!usedQuestions.has(question)) {
                quiz.push({
                    question: question,
                    isSpecialFraction: true,
                    isNormal:false,
                    correctAnswer: fractions[randomIndex].denominator
                });
                usedQuestions.add(question);
                questionGenerated = true;
            }
        }
    }
    return quiz;
}
 

export const getQuestion = {
    //加减法运算
    addOne: getAdditionOfTens,
    addTwo: getThreeNumberAdditionQuiz,
    addThree: getSubtractionOfThreeDigits,
    addFour: getAdditionOfFourTens,
    addFive: getAdditionOfTwoThreeDigits,
    addSix: getAdditionOfThreeThreeDigits,
    //除法运算
    divisionOne: generateSignificantDigitDivision,
    divisionTwo: generateValidSignificantDigitQuizzes,
    divisionThree: generateSignificantDigitAdditionDivisionQuiz,
    divisionFour: generateFractionQuizzes,
    //乘法运算
    multiplicationOne: generateMultiplicationQuiz,
    multiplicationTwo: generateEvenNumberMultiplicationQuiz,
    multiplicationThree: generateUniqueHeadTailSumMultiplicationQuiz,
    multiplicationFour:generateUniqueOneHeadMultiplicationQuiz,
    //特殊分数
    specialFractionOne: getFractionQuiz,
    specialFractionTwo: generateGrowthCalculationQuiz,
    specialFractionThree: generateSpecialFractionDivisionQuiz,
    specialFractionFour: generateSpecialFractionMultiplicationQuiz,
};


export default getQuestion 