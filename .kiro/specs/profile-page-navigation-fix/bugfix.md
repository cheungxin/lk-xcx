# Bugfix Requirements Document

## Introduction

Profile 页面（我的页面）存在多个导航跳转问题，导致用户无法访问已存在的功能页面。具体问题包括：

1. **学习服务菜单跳转失败**：练习记录、错题本、收藏夹、刷题报告、刷题日历等按钮点击后仅显示 toast 提示"即将开放"，但实际对应的页面已经存在于 `subpackages/my` 目录下
2. **设置页面跳转失败**：设置按钮点击后显示"即将开放"，但设置页面已存在
3. **练习数据统计跳转失败**：练习数据卡片中的"查看全部"按钮点击后显示"即将开放"，但统计页面已存在
4. **登录功能数据不完整**：登录成功后缺少学生信息（studentInfos）的模拟数据，导致用户信息展示不完整

这些问题严重影响了用户体验，使得已开发的功能无法被用户访问和使用。

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户点击"练习记录"菜单项 THEN 系统仅显示 toast 提示"练习记录即将开放"，不进行页面跳转

1.2 WHEN 用户点击"错题本"菜单项 THEN 系统仅显示 toast 提示"错题本即将开放"，不进行页面跳转

1.3 WHEN 用户点击"收藏夹"菜单项 THEN 系统仅显示 toast 提示"收藏夹即将开放"，不进行页面跳转

1.4 WHEN 用户点击"刷题报告"菜单项 THEN 系统仅显示 toast 提示"刷题报告即将开放"，不进行页面跳转

1.5 WHEN 用户点击"刷题日历"菜单项 THEN 系统仅显示 toast 提示"学习日历即将开放"，不进行页面跳转

1.6 WHEN 用户点击"设置"菜单项 THEN 系统仅显示 toast 提示"设置页即将开放"，不进行页面跳转

1.7 WHEN 用户点击练习数据卡片中的"查看全部"按钮 THEN 系统仅显示 toast 提示"学习数据详情即将开放"，不进行页面跳转

1.8 WHEN 用户登录成功后 THEN 系统仅保存基础 userInfo（nickname, avatarUrl），缺少 studentInfos（userName, userAvatar, className, projectName）等完整模拟数据，导致用户信息展示为默认值"考生用户"和默认头像

### Expected Behavior (Correct)

2.1 WHEN 用户点击"练习记录"菜单项 THEN 系统 SHALL 跳转到 `/subpackages/my/record/record` 页面

2.2 WHEN 用户点击"错题本"菜单项 THEN 系统 SHALL 跳转到 `/subpackages/my/wrong/wrong` 页面

2.3 WHEN 用户点击"收藏夹"菜单项 THEN 系统 SHALL 跳转到 `/subpackages/my/favorite/favorite` 页面

2.4 WHEN 用户点击"刷题报告"菜单项 THEN 系统 SHALL 跳转到 `/subpackages/my/review/review` 页面

2.5 WHEN 用户点击"刷题日历"菜单项 THEN 系统 SHALL 跳转到 `/subpackages/my/stats/stats` 页面

2.6 WHEN 用户点击"设置"菜单项 THEN 系统 SHALL 跳转到 `/subpackages/my/settings/settings` 页面

2.7 WHEN 用户点击练习数据卡片中的"查看全部"按钮 THEN 系统 SHALL 跳转到 `/subpackages/my/stats/stats` 页面

2.8 WHEN 用户登录成功后 THEN 系统 SHALL 保存完整的模拟用户数据，包括：
   - userInfo: { openId, phone, nickname, avatarUrl }
   - studentInfos: { userName（学生姓名）, userAvatar（学生头像 URL）, className（班级名称）, projectName（项目名称）}
   - 模拟数据应使用真实的微信头像 URL 格式和合理的中文姓名、班级信息

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户点击"帮助与反馈"菜单项 THEN 系统 SHALL CONTINUE TO 显示反馈弹窗对话框

3.2 WHEN 用户点击"关于我们"菜单项 THEN 系统 SHALL CONTINUE TO 显示关于我们的模态对话框

3.3 WHEN 用户未登录时点击需要登录的菜单项 THEN 系统 SHALL CONTINUE TO 显示"请先登录"提示并引导用户登录

3.4 WHEN 用户点击用户信息卡片且未登录 THEN 系统 SHALL CONTINUE TO 触发登录流程

3.5 WHEN 用户点击编辑按钮且未登录 THEN 系统 SHALL CONTINUE TO 触发登录流程

3.6 WHEN 用户已登录时 THEN 系统 SHALL CONTINUE TO 正确显示用户头像、昵称、描述信息和练习数据统计

3.7 WHEN 用户提交反馈时 THEN 系统 SHALL CONTINUE TO 验证反馈内容不为空并显示提交成功提示

3.8 WHEN 用户退出登录时 THEN 系统 SHALL CONTINUE TO 清除所有登录相关的本地存储数据
