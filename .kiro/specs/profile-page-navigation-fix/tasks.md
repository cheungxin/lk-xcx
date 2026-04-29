# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - 菜单按钮和统计按钮仅显示 toast 不跳转
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that clicking 6 menu buttons (练习记录、错题本、收藏夹、刷题报告、刷题日历、设置) only calls `tool.toast` without calling `wx.navigateTo`
  - Test that clicking "查看全部" button only calls `tool.toast` without calling `wx.navigateTo`
  - Test that login success only saves userInfo without saving studentInfos to local storage
  - The test assertions should match the Expected Behavior Properties from design:
    - 练习记录 → should navigate to `/subpackages/my/record/record`
    - 错题本 → should navigate to `/subpackages/my/wrong/wrong`
    - 收藏夹 → should navigate to `/subpackages/my/favorite/favorite`
    - 刷题报告 → should navigate to `/subpackages/my/review/review`
    - 刷题日历 → should navigate to `/subpackages/my/stats/stats`
    - 设置 → should navigate to `/subpackages/my/settings/settings`
    - 查看全部 → should navigate to `/subpackages/my/stats/stats`
    - Login → should save both userInfo and studentInfos
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - 非导航按钮行为保持不变
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - "帮助与反馈" button shows feedback dialog (not page navigation)
    - "关于我们" button shows about modal (not page navigation)
    - Unauthenticated users clicking menu items show "请先登录" prompt
    - User info card click triggers login flow when not logged in
    - Edit button click triggers login flow when not logged in
    - Logged-in users see correct avatar, nickname, description and stats
    - Feedback form validates non-empty content and shows success message
    - Logout clears all local storage data
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 3. Fix for Profile 页面导航跳转问题

  - [ ] 3.1 修复 6 个菜单按钮的页面跳转
    - 修改 `01 源代码/miniprogram/pages/profile/profile.js` 中的 `onMenuTap` 方法
    - 将 `case 'record'` 中的 `tool.toast('练习记录即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/record/record' })`
    - 将 `case 'wrong'` 中的 `tool.toast('错题本即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/wrong/wrong' })`
    - 将 `case 'favorite'` 中的 `tool.toast('收藏夹即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/favorite/favorite' })`
    - 将 `case 'report'` 中的 `tool.toast('刷题报告即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/review/review' })`
    - 将 `case 'calendar'` 中的 `tool.toast('学习日历即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/stats/stats' })`
    - 将 `case 'settings'` 中的 `tool.toast('设置页即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/settings/settings' })`
    - _Bug_Condition: isBugCondition(input) where input.action === 'menuTap' AND input.type IN ['record', 'wrong', 'favorite', 'report', 'calendar', 'settings']_
    - _Expected_Behavior: wx.navigateTo called with correct page path for each menu type_
    - _Preservation: "帮助与反馈" and "关于我们" buttons continue to show dialogs, not navigate_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 3.2 修复统计数据"查看全部"按钮的页面跳转
    - 修改 `01 源代码/miniprogram/pages/profile/profile.js` 中的 `onStatsMore` 方法
    - 将 `tool.toast('学习数据详情即将开放')` 替换为 `wx.navigateTo({ url: '/subpackages/my/stats/stats' })`
    - _Bug_Condition: isBugCondition(input) where input.action === 'statsMore'_
    - _Expected_Behavior: wx.navigateTo called with '/subpackages/my/stats/stats'_
    - _Requirements: 2.7_

  - [ ] 3.3 完善登录模拟数据，添加 studentInfos
    - 修改 `01 源代码/miniprogram/utils/wxlogin.js` 中的 `wxLogin` 方法
    - 在保存 mockUserInfo 后，添加保存 studentInfos 的逻辑：
      ```javascript
      const mockStudentInfos = {
        userName: '张三',
        userAvatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        className: '2024年国考冲刺班',
        projectName: '行测专项突破'
      }
      wx.setStorageSync('studentInfos', mockStudentInfos)
      ```
    - 修改 `phoneLogin` 方法，添加相同的 studentInfos 保存逻辑
    - 更新 mockUserInfo 结构，添加 openId 字段：
      ```javascript
      const mockUserInfo = {
        openId: 'mock_openid_' + Date.now(),
        phone: '138****8888',
        nickname: '张三',
        avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'
      }
      ```
    - _Bug_Condition: isBugCondition(input) where login succeeds but studentInfos not saved_
    - _Expected_Behavior: Both userInfo and studentInfos saved to local storage with complete fields_
    - _Preservation: Existing login flow, validation, and error handling remain unchanged_
    - _Requirements: 2.8_

  - [ ] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 菜单按钮和统计按钮正确跳转到对应页面
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - 非导航按钮行为保持不变
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
