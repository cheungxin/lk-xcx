# Implementation Plan: Homepage Tree Structure Rebuild

## Overview

This implementation plan converts the homepage tree structure rebuild design into actionable coding tasks. The plan focuses on creating reusable tree components (tree and tree-node), integrating them into the index page to replace the flat practice categories list, implementing expand/collapse functionality, and maintaining all existing homepage features. The implementation uses JavaScript for WeChat miniprogram development with recursive component patterns.

## Tasks

- [x] 1. Create tree-node component structure
  - Create component directory at `01 源代码/miniprogram/components/tree-node/`
  - Create tree-node.js, tree-node.json, tree-node.wxml, tree-node.wxss files
  - Define component properties: treeNodes (Array), expandAll (Boolean), page (String)
  - Set component options: styleIsolation to 'shared' for CSS inheritance
  - _Requirements: 3.1, 3.2, 3.3, 12.6_

- [ ] 2. Implement tree-node component logic
  - [x] 2.1 Implement tree-node data initialization and observers
    - Add data property: tree (Array) to store processed node data
    - Implement observers for treeNodes property to initialize open state based on expandAll
    - Set item.open property for each node according to expandAll value
    - _Requirements: 3.2, 3.3, 12.1, 12.2, 12.3_

  - [x] 2.2 Implement expand/collapse toggle functionality
    - Write isOpen method to toggle node expand state
    - Use dataset.index to identify which node was tapped
    - Update tree[index].open property using setData with dynamic key
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.3 Implement node navigation event handling
    - Write goExamPoint method to handle direct node taps
    - Extract examLevel and examPoint from dataset.item
    - Trigger custom event 'goAnalysis' with examLevel and examPoint data
    - Write tapNode method to catch and re-emit events from child tree-node components
    - _Requirements: 6.1, 6.2, 6.3, 11.1, 11.2, 11.3_

- [ ] 3. Implement tree-node component template
  - [x] 3.1 Create tree-node WXML structure with recursive pattern
    - Use wx:for to iterate over tree array with wx:key="index"
    - Wrap each node in tree-item-wrap and tree-item containers
    - Add conditional class binding for item-open/item-close based on item.open
    - _Requirements: 3.1, 3.6, 9.1_

  - [x] 3.2 Add expand/collapse icon section
    - Create tree-item-icon view with conditional rendering (wx:if for children check)
    - Add bindtap="isOpen" with data-index="{{index}}"
    - Use iconfont with conditional class: icon-reduce when open, icon-add when closed
    - Render empty tree-item-icon view for leaf nodes
    - _Requirements: 3.5, 4.1, 4.5, 9.3_

  - [x] 3.3 Add node content section
    - Create tree-item-content view with item-title and item-desc elements
    - Display examPoint with fallback to '未分类' for missing values
    - Display answerDesc for progress information
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 15.1_

  - [x] 3.4 Add navigation entry arrow
    - Create tree-item-entry view with bindtap="goExamPoint"
    - Pass data-item="{{item}}" for navigation data
    - Use iconfont icon-arrow for visual indicator
    - _Requirements: 6.1, 9.3_

  - [x] 3.5 Add separator line and recursive child rendering
    - Add tree-item-line view with hidden="{{item.open}}" attribute
    - Add recursive tree-node component with wx:if checking children existence and open state
    - Pass treeNodes='{{item.children}}', expandAll, page properties to child
    - Add catch:goAnalysis="tapNode" to propagate events upward
    - Apply children-level class for indentation
    - _Requirements: 3.1, 3.4, 3.6, 5.5, 5.6, 9.2, 11.3, 11.4_

- [x] 4. Create tree-node component styles
  - Create tree-node.wxss with styles for tree-item, tree-item-wrap, tree-item-icon, tree-item-content, tree-item-entry
  - Add styles for item-title, item-desc, tree-item-line
  - Implement children-level class for nested indentation (add left padding)
  - Add item-open and item-close classes for state-based styling
  - Ensure touch target sizes meet 44rpx minimum for accessibility
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 14.1_

- [x] 5. Create tree component structure
  - Create component directory at `01 源代码/miniprogram/components/tree/`
  - Create tree.js, tree.json, tree.wxml, tree.wxss files
  - Define component properties: treeNodes (Array), expandAll (Boolean), page (String)
  - Set component options: styleIsolation to 'shared'
  - _Requirements: 2.1, 2.2, 2.3, 12.6_

- [x] 6. Implement tree component logic
  - Add data property: tree (Array) for processed root nodes
  - Implement observers for treeNodes to initialize open state
  - Write method to catch goAnalysis events from tree-node children and re-emit to parent page
  - _Requirements: 2.2, 2.3, 10.6, 11.4, 11.5_

- [x] 7. Implement tree component template and styles
  - Create tree.wxml using wx:for to render root-level tree-node components
  - Pass treeNodes='{{item}}' (wrapped as single-item array or direct children), expandAll, page
  - Add catch:goAnalysis event binding to propagate events
  - Create tree.wxss with base tree container styles
  - _Requirements: 2.1, 2.2, 7.1, 7.2, 7.3, 7.5_

- [x] 8. Register tree-node and tree components in index.json
  - Add tree-node component to usingComponents in `01 源代码/miniprogram/pages/index/index.json`
  - Add tree component to usingComponents in index.json
  - Use paths: "tree-node": "../../components/tree-node/tree-node", "tree": "../../components/tree/tree"
  - _Requirements: 2.1, 3.1_

- [ ] 9. Update index page WXML to integrate tree component
  - [x] 9.1 Replace practice categories cell-card with tree component
    - Locate the practice mode section in index.wxml (wx:if="{{contentMode === 'practice'}}")
    - Replace the entire cell-card block containing t-cell loop with tree component
    - Add tree component: `<tree treeNodes="{{practiceCategories}}" expandAll="{{false}}" page="index" bind:goAnalysis="onTreeNodeTap" />`
    - _Requirements: 2.1, 2.2, 2.4, 10.6_

  - [x] 9.2 Ensure exam mode section remains unchanged
    - Verify exam mode section (wx:else block) is not modified
    - Confirm exam-shell, mode-switch, and exam action buttons remain intact
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10. Update index page JavaScript for tree integration
  - [x] 10.1 Modify buildPracticeCategories to support tree structure
    - Update buildPracticeCategories method to preserve children arrays from data source
    - Add hasChildren property based on children array length
    - Ensure examPoint, answerDesc, answered, total properties are preserved
    - _Requirements: 7.1, 7.2, 7.6, 10.3_

  - [x] 10.2 Implement tree node navigation handler
    - Add onTreeNodeTap method to handle goAnalysis events from tree component
    - Extract examLevel and examPoint from e.detail
    - Call router.push to navigate to LIST page with mode: 'knowledge-tree'
    - Pass subject: selectedSubjectId and focus: examPoint as parameters
    - _Requirements: 6.2, 6.3, 6.4, 11.5, 11.6_

  - [ ] 10.3 Update data fetching to support hierarchical structure
    - Verify getPracticeCategories returns data with children arrays
    - If data is flat, implement transformation logic to build tree structure
    - Ensure data structure matches: {id, name, examPoint, answerDesc, answered, total, children}
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2, 10.5_

- [x] 11. Checkpoint - Verify tree component integration
  - Test tree component renders on homepage in practice mode
  - Test expand/collapse functionality works for nodes with children
  - Test navigation works when tapping node entry arrows
  - Test exam mode section remains unchanged
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Handle edge cases and error states
  - [x] 12.1 Add empty state handling in tree component
    - Check if treeNodes is empty in tree.wxml
    - Display appropriate message when no data available
    - _Requirements: 15.2_

  - [x] 12.2 Add data validation in tree-node component
    - Check for malformed children data in observers
    - Treat nodes with invalid children as leaf nodes
    - Log errors for debugging when invalid data detected
    - _Requirements: 15.3, 15.6_

  - [x] 12.3 Add error handling for navigation failures
    - Wrap router.push in try-catch in onTreeNodeTap
    - Display toast message if navigation fails
    - _Requirements: 15.4_

  - [x] 12.4 Prevent rapid interaction issues
    - Add debouncing or state checks in isOpen method to prevent state corruption
    - Ensure expand/collapse animations complete before allowing next interaction
    - _Requirements: 15.5_

- [x] 13. Optimize performance for large trees
  - [x] 13.1 Verify conditional rendering optimization
    - Confirm collapsed nodes don't render children in DOM (wx:if usage)
    - Test with large tree structures (50+ nodes)
    - _Requirements: 13.3, 13.4_

  - [x] 13.2 Test rendering and interaction performance
    - Measure initial tree render time (should be < 500ms)
    - Measure expand/collapse response time (should be < 100ms)
    - Test scrolling performance with large trees
    - _Requirements: 13.1, 13.2, 13.5, 13.6_

- [x] 14. Apply visual styling and polish
  - [x] 14.1 Implement tree component visual design
    - Apply reference styles for tree-item layout and spacing
    - Style expand/collapse icons with proper size and color
    - Style node content with proper typography hierarchy
    - Style entry arrow with proper positioning
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 14.2 Add interaction feedback
    - Add hover/active states for tappable elements
    - Add smooth transitions for expand/collapse animations
    - Ensure visual feedback meets accessibility standards
    - _Requirements: 6.6, 14.2, 14.4_

  - [x] 14.3 Verify visual consistency
    - Compare rendered tree with reference screenshots
    - Ensure spacing, colors, and typography match design
    - Test on different screen sizes and devices
    - _Requirements: 1.6, 9.1, 9.2, 9.3, 9.4, 9.5_

- [-] 15. Final integration testing and validation
  - Test complete homepage flow: exam type selection, subject tabs, tree navigation
  - Test switching between practice mode and exam mode
  - Test tree component with different subjects and data sets
  - Verify all existing homepage functionality remains intact
  - Test accessibility features: touch targets, visual feedback, contrast
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation uses JavaScript for WeChat miniprogram development
- Tree component follows recursive pattern for unlimited nesting depth
- Existing homepage functionality (hero section, quick entries, exam mode) remains unchanged
