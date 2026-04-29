# 首页与训练分包交付说明

## 首页交付
- 首页主态、考试类型弹窗、显示设置、刷题设置、出题设置已保留在主包。
- 历年试卷与考点结构继续由主包二级页承载。
- 5 Tab 全局外壳已经对齐：`首页 / 估分 / 快练 / 背诵 / 我的`

## 快练结构调整
- 主包 `快练` 现在只保留入口页：
  - [quick.js](/D:/其他/lk-xcx/01 源代码/miniprogram/subpackages/training/quick/quick.js)
- 训练分包承载真实刷题流程：
  - [practice.js](/D:/其他/lk-xcx/01 源代码/miniprogram/subpackages/training/pages/practice/practice.js)
  - [answer-card.js](/D:/其他/lk-xcx/01 源代码/miniprogram/subpackages/training/pages/answer-card/answer-card.js)
  - [analysis.js](/D:/其他/lk-xcx/01 源代码/miniprogram/subpackages/training/pages/analysis/analysis.js)

## 结果
- 主包不再承载旧的 `pages/practice/practice` 和 `pages/answer/answer`
- `practice / answer-card / analysis` 已全部转入训练分包
- 首页和 Tab 跳转仍然可继续工作，主包只负责业务入口
