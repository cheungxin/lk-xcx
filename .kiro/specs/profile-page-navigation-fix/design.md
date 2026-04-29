# Profile 页面导航跳转修复设计

## Overview

Profile 页面（我的页面）存在导航跳转逻辑缺陷，导致用户无法访问已存在的功能页面。具体问题包括：6个学习服务和设置菜单按钮点击后仅显示 toast 提示"即将开放"，但实际对应的页面已经存在于 `subpackages/my` 目录下；练习数据统计卡片的"查看全部"按钮也存在同样问题；登录功能缺少完整的学生信息模拟数据。

本次修复将：
1. 修改 `onMenuTap` 方法，将 toast 提示替换为 `wx.navigateTo` 页面跳转
2. 修改 `onStatsMore` 方法，实现跳转到统计页面
3. 完善登录模拟数据，添加 studentInfos 结构
4. 确保不影响"帮助与反馈"和"关于我们"的现有功能

## Glossary

- **Bug_Condition (C)**: 用户点击 6 个菜单按钮（练习记录、错题本、收藏夹、刷题报告、刷题日历、设置）或"查看全部"按钮时，系统仅显示 toast 而不跳转
- **Property (P)**: 点击这些按钮时，系统应执行 `wx.navigateTo` 跳转到对应的已存在页面
- **Preservation**: "帮助与反馈"弹窗、"关于我们"模态框、登录验证逻辑、用户信息展示等现有功能必须保持不变
- **onMenuTap**: `profile.js` 中的菜单点击处理函数，当前使用 `tool.toast` 显示提示
- **onStatsMore**: `profile.js` 中的统计数据"查看全部"按钮处理函数
- **studentInfos**: 存储在本地的学生详细信息对象，包含 userName、userAvatar、className、projectName 等字段

## Bug Details

### Bug Condition

该 bug 在用户点击 Profile 页面的特定按钮时触发。`onMenuTap` 函数和 `onStatsMore` 函数当前仅调用 `tool.toast` 显示"即将开放"提示，但实际上对应的页面文件已经存在于 `subpackages/my` 目录下，应该执行页面跳转。

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { action: string, type?: string }
  OUTPUT: boolean
  
  RETURN (input.action === 'menuTap' AND input.type IN ['record', 'wrong', 'favorite', 'report', 'calendar', 'settings'])
         OR (input.action === 'statsMore')
         AND correspondingPageExists(input.type || 'stats')
         AND NOT pageNavigationTriggered(input)
END FUNCTION
```

### Examples

- **练习记录按钮**: 用户点击"练习记录"菜单项 → 系统显示 toast "练习记录即将开放" → 预期应跳转到 `/subpackages/my/record/record`
- **错题本按钮**: 用户点击"错题本"菜单项 → 系统显示 toast "错题本即将开放" → 预期应跳转到 `/subpackages/my/wrong/wrong`
- **收藏夹按钮**: 用户点击"收藏夹"菜单项 → 系统显示 toast "收藏夹即将开放" → 预期应跳转到 `/subpackages/my/favorite/favorite`
- **刷题报告按钮**: 用户点击"刷题报告"菜单项 → 系统显示 toast "刷题报告即将开放" → 预期应跳转到 `/subpackages/my/review/review`
- **刷题日历按钮**: 用户点击"刷题日历"菜单项 → 系统显示 toast "学习日历即将开放" → 预期应跳转到 `/subpackages/my/stats/stats`
- **设置按钮**: 用户点击"设置"菜单项 → 系统显示 toast "设置页即将开放" → 预期应跳转到 `/subpackages/my/settings/settings`
- **查看全部按钮**: 用户点击练习数据卡片的"查看全部" → 系统显示 toast "学习数据详情即将开放" → 预期应跳转到 `/subpackages/my/stats/stats`
- **登录数据不完整**: 用户登录成功后 → 系统仅保存基础 userInfo → 预期应同时保存 studentInfos 包含 userName、className 等完整信息

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- "帮助与反馈"按钮点击后必须继续显示反馈弹窗对话框（不是页面跳转）
- "关于我们"按钮点击后必须继续显示关于我们的模态对话框（不是页面跳转）
- 未登录用户点击需要登录的菜单项时，必须继续显示"请先登录"提示并引导登录
- 用户信息卡片点击、编辑按钮点击的登录验证逻辑必须保持不变
- 已登录用户的头像、昵称、描述信息和练习数据统计展示必须保持不变
- 反馈弹窗的表单验证和提交逻辑必须保持不变
- 退出登录时清除本地存储的逻辑必须保持不变

**Scope:**
所有不涉及以下操作的输入应完全不受影响：
- 点击"练习记录"、"错题本"、"收藏夹"、"刷题报告"、"刷题日历"、"设置"菜单项
- 点击练习数据卡片的"查看全部"按钮
- 登录成功后的数据保存逻辑

## Hypothesized Root Cause

基于 bug 描述和代码分析，最可能的问题原因是：

1. **开发阶段遗留的占位代码**: `onMenuTap` 函数中的 switch 语句使用了 `tool.toast` 作为占位实现，表示功能"即将开放"，但实际上对应的页面已经开发完成并存在于 `subpackages/my` 目录下，只是忘记更新跳转逻辑

2. **统计页面跳转未实现**: `onStatsMore` 函数同样使用了占位 toast，但统计页面 `/subpackages/my/stats/stats` 已经存在

3. **登录模拟数据不完整**: `wxlogin.js` 中的 `wxLogin` 和 `phoneLogin` 方法仅创建了基础的 mockUserInfo（nickname, avatarUrl），但 `profile.js` 的 `loadUserData` 方法期望从本地存储读取 studentInfos（userName, userAvatar, className, projectName），导致登录后用户信息展示为默认值

4. **页面路径映射错误**: 可能存在菜单类型（type）与实际页面路径不一致的情况，例如 'calendar' 类型对应的是 'stats' 页面，'report' 类型对应的是 'review' 页面

## Correctness Properties

Property 1: Bug Condition - 菜单按钮和统计按钮触发页面跳转

_For any_ 用户点击操作，当点击的是"练习记录"、"错题本"、"收藏夹"、"刷题报告"、"刷题日历"、"设置"菜单项或练习数据卡片的"查看全部"按钮时，修复后的函数 SHALL 调用 `wx.navigateTo` 跳转到对应的已存在页面，而不是仅显示 toast 提示。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

Property 2: Preservation - 非导航按钮行为保持不变

_For any_ 用户点击操作，当点击的不是上述 7 个需要修复的按钮（即点击"帮助与反馈"、"关于我们"或其他交互元素）时，修复后的代码 SHALL 产生与原始代码完全相同的行为，保持反馈弹窗、模态对话框、登录验证等现有功能不变。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

Property 3: Bug Condition - 登录后保存完整用户数据

_For any_ 登录操作（静默登录或手机号授权登录），修复后的登录函数 SHALL 同时保存 userInfo 和 studentInfos 到本地存储，其中 studentInfos 包含 userName、userAvatar、className、projectName 等完整字段，确保用户信息能够正确展示。

**Validates: Requirements 2.8**

## Fix Implementation

### Changes Required

假设我们的根因分析正确：

**File**: `01 源代码/miniprogram/pages/profile/profile.js`

**Function**: `onMenuTap`

**Specific Changes**:
1. **替换练习记录跳转逻辑**: 将 `case 'record'` 中的 `tool.toast('练习记录即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/record/record' })`

2. **替换错题本跳转逻辑**: 将 `case 'wrong'` 中的 `tool.toast('错题本即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/wrong/wrong' })`

3. **替换收藏夹跳转逻辑**: 将 `case 'favorite'` 中的 `tool.toast('收藏夹即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/favorite/favorite' })`

4. **替换刷题报告跳转逻辑**: 将 `case 'report'` 中的 `tool.toast('刷题报告即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/review/review' })`

5. **替换刷题日历跳转逻辑**: 将 `case 'calendar'` 中的 `tool.toast('学习日历即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/stats/stats' })`

6. **替换设置页跳转逻辑**: 将 `case 'settings'` 中的 `tool.toast('设置页即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/settings/settings' })`

**Function**: `onStatsMore`

**Specific Changes**:
7. **替换统计数据跳转逻辑**: 将 `tool.toast('学习数据详情即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/stats/stats' })`

**File**: `01 源代码/miniprogram/utils/wxlogin.js`

**Function**: `wxLogin`

**Specific Changes**:
8. **完善静默登录模拟数据**: 在保存 mockUserInfo 后，添加保存 studentInfos 的逻辑：
   ```javascript
   const mockStudentInfos = {
     userName: '张三',
     userAvatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
     className: '2024年国考冲刺班',
     projectName: '行测专项突破'
   }
   wx.setStorageSync('studentInfos', mockStudentInfos)
   ```

**Function**: `phoneLogin`

**Specific Changes**:
9. **完善手机号登录模拟数据**: 在保存 mockUserInfo 后，添加保存 studentInfos 的逻辑（同上）

10. **更新 mockUserInfo 结构**: 添加 openId 字段到 mockUserInfo：
    ```javascript
    const mockUserInfo = {
      openId: 'mock_openid_' + Date.now(),
      phone: '138****8888',
      nickname: '张三',
      avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'
    }
    ```

## Testing Strategy

### Validation Approach

测试策略采用两阶段方法：首先在未修复的代码上运行探索性测试，观察 bug 的具体表现并确认根因分析；然后在修复后的代码上验证跳转功能正常工作，并确保现有功能（反馈弹窗、模态框、登录验证）保持不变。

### Exploratory Bug Condition Checking

**Goal**: 在实施修复之前，在未修复的代码上演示 bug。确认或反驳根因分析。如果反驳，需要重新假设根因。

**Test Plan**: 编写测试用例模拟用户点击各个菜单按钮和"查看全部"按钮，断言当前代码仅调用 `tool.toast` 而不调用 `wx.navigateTo`。在未修复的代码上运行这些测试，观察失败情况并理解根本原因。同时检查登录后本地存储中是否缺少 studentInfos 数据。

**Test Cases**:
1. **练习记录按钮测试**: 模拟点击"练习记录"菜单项，断言调用了 `tool.toast('练习记录即将开放')` 而不是 `wx.navigateTo` (在未修复代码上会失败)
2. **错题本按钮测试**: 模拟点击"错题本"菜单项，断言调用了 `tool.toast('错题本即将开放')` 而不是 `wx.navigateTo` (在未修复代码上会失败)
3. **收藏夹按钮测试**: 模拟点击"收藏夹"菜单项，断言调用了 `tool.toast('收藏夹即将开放')` 而不是 `wx.navigateTo` (在未修复代码上会失败)
4. **刷题报告按钮测试**: 模拟点击"刷题报告"菜单项，断言调用了 `tool.toast('刷题报告即将开放')` 而不是 `wx.navigateTo` (在未修复代码上会失败)
5. **刷题日历按钮测试**: 模拟点击"刷题日历"菜单项，断言调用了 `tool.toast('学习日历即将开放')` 而不是 `wx.navigateTo` (在未修复代码上会失败)
6. **设置按钮测试**: 模拟点击"设置"菜单项，断言调用了 `tool.toast('设置页即将开放')` 而不是 `wx.navigateTo` (在未修复代码上会失败)
7. **查看全部按钮测试**: 模拟点击"查看全部"按钮，断言调用了 `tool.toast('学习数据详情即将开放')` 而不是 `wx.navigateTo` (在未修复代码上会失败)
8. **登录数据完整性测试**: 模拟登录成功，检查本地存储中是否存在 studentInfos，断言当前缺少该数据 (在未修复代码上会失败)

**Expected Counterexamples**:
- 点击 7 个按钮时，仅调用 `tool.toast` 显示提示，不执行页面跳转
- 登录成功后，本地存储中仅有 userInfo，缺少 studentInfos
- 可能的原因：占位代码未更新、登录模拟数据不完整

### Fix Checking

**Goal**: 验证对于所有触发 bug 条件的输入，修复后的函数产生预期行为。

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedFunction(input)
  ASSERT expectedBehavior(result)
END FOR
```

**具体验证**:
- 点击"练习记录"按钮 → 断言调用 `wx.navigateTo({ url: '/subpackages/my/record/record' })`
- 点击"错题本"按钮 → 断言调用 `wx.navigateTo({ url: '/subpackages/my/wrong/wrong' })`
- 点击"收藏夹"按钮 → 断言调用 `wx.navigateTo({ url: '/subpackages/my/favorite/favorite' })`
- 点击"刷题报告"按钮 → 断言调用 `wx.navigateTo({ url: '/subpackages/my/review/review' })`
- 点击"刷题日历"按钮 → 断言调用 `wx.navigateTo({ url: '/subpackages/my/stats/stats' })`
- 点击"设置"按钮 → 断言调用 `wx.navigateTo({ url: '/subpackages/my/settings/settings' })`
- 点击"查看全部"按钮 → 断言调用 `wx.navigateTo({ url: '/subpackages/my/stats/stats' })`
- 登录成功 → 断言本地存储中同时存在 userInfo 和 studentInfos，且 studentInfos 包含 userName、userAvatar、className、projectName 字段

### Preservation Checking

**Goal**: 验证对于所有不触发 bug 条件的输入，修复后的函数产生与原始函数相同的结果。

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Testing Approach**: 推荐使用基于属性的测试进行保留检查，因为：
- 它自动生成大量测试用例覆盖输入域
- 它能捕获手动单元测试可能遗漏的边缘情况
- 它为所有非 bug 输入提供强有力的行为不变保证

**Test Plan**: 首先在未修复的代码上观察"帮助与反馈"、"关于我们"等交互的行为，然后编写基于属性的测试捕获这些行为。

**Test Cases**:
1. **帮助与反馈保留测试**: 在未修复代码上观察点击"帮助与反馈"显示弹窗，编写测试验证修复后继续显示弹窗而不是页面跳转
2. **关于我们保留测试**: 在未修复代码上观察点击"关于我们"显示模态框，编写测试验证修复后继续显示模态框
3. **登录验证保留测试**: 在未修复代码上观察未登录用户点击需登录菜单项时的提示，编写测试验证修复后继续显示"请先登录"提示
4. **用户信息展示保留测试**: 验证修复后已登录用户的头像、昵称、描述信息和统计数据展示逻辑保持不变
5. **反馈表单保留测试**: 验证修复后反馈弹窗的表单验证和提交逻辑保持不变
6. **退出登录保留测试**: 验证修复后退出登录时清除本地存储的逻辑保持不变

### Unit Tests

- 测试 `onMenuTap` 函数对每个菜单类型的处理逻辑
- 测试 `onStatsMore` 函数的跳转逻辑
- 测试登录函数保存完整用户数据（userInfo + studentInfos）
- 测试边缘情况：未登录用户点击需登录菜单项、点击不存在的菜单类型
- 测试"帮助与反馈"和"关于我们"按钮继续触发弹窗/模态框

### Property-Based Tests

- 生成随机的菜单点击事件，验证 7 个需修复的按钮正确跳转
- 生成随机的用户登录状态，验证登录验证逻辑在各种场景下正常工作
- 生成随机的用户数据，验证登录后数据保存和展示的完整性
- 测试所有非导航按钮（帮助与反馈、关于我们）在多种场景下继续保持原有行为

### Integration Tests

- 测试完整的用户流程：从未登录状态点击菜单项 → 提示登录 → 登录成功 → 再次点击菜单项 → 成功跳转
- 测试登录后的完整数据流：登录 → 保存 userInfo 和 studentInfos → Profile 页面加载 → 正确展示用户信息和统计数据
- 测试所有 7 个按钮的跳转 → 验证目标页面能够正常加载
- 测试"帮助与反馈"完整流程：点击按钮 → 显示弹窗 → 填写表单 → 提交反馈 → 关闭弹窗
- 测试"关于我们"完整流程：点击按钮 → 显示模态框 → 关闭模态框
