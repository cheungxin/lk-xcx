# How to Run Performance Tests

## Prerequisites

1. WeChat Developer Tools installed
2. Project opened in WeChat Developer Tools
3. Tree component implementation completed (tasks 1-12)

## Running the Tests

### Method 1: Automated Test Suite

1. Open WeChat Developer Tools
2. In the simulator, navigate to the test page:
   - Click on the page selector (top bar)
   - Select "pages/tree-performance-test/tree-performance-test"
   - Or manually navigate: `pages/tree-performance-test/tree-performance-test`

3. The test suite will run automatically on page load

4. Open the Console panel (底部工具栏 > Console)

5. Review the test output:
   ```
   [tree-performance-test] Starting test suite...
   [tree-performance-test] Test scenarios generated: {...}
   [tree-performance-test] Running scenario 1: Small tree (20 nodes)
   [tree-performance-test] Render metrics: {...}
   [tree-performance-test] Verification results: {...}
   ...
   ```

6. Check that all scenarios pass:
   - Render time < 500ms ✅
   - Verification passed ✅
   - No errors in console ✅

### Method 2: Manual Interactive Tests

1. Navigate to the test page (same as above)

2. **Test Small Tree (20 nodes):**
   - Click "小树 (20节点)" button
   - Observe tree renders quickly
   - Check console for render time

3. **Test Medium Tree (50+ nodes):**
   - Click "中树 (50+节点)" button
   - Observe tree renders quickly
   - Verify collapsed state (nodes are collapsed by default)

4. **Test Large Tree (100+ nodes):**
   - Click "大树 (100+节点)" button
   - Observe tree renders within 500ms
   - Check console for render time

5. **Test Expand/Collapse:**
   - Click "全部展开" button
   - Observe smooth expansion animation
   - Click "全部折叠" button
   - Observe smooth collapse animation

6. **Verify Conditional Rendering:**
   - Ensure tree is in collapsed state
   - Click "验证条件渲染" button
   - Modal should show: "✓ 验证通过"
   - Check details: "检查了 X 个折叠节点"

7. **Test Scrolling Performance:**
   - Load large tree (100+ nodes)
   - Expand some top-level nodes
   - Scroll up and down rapidly
   - Verify smooth scrolling (no jank)

8. **Export Results:**
   - Click "导出结果" button
   - Check console for complete test results JSON
   - Copy results for documentation

### Method 3: Manual DOM Inspection

1. Load a tree with collapsed nodes (e.g., medium tree)

2. Open the WXML panel in Developer Tools:
   - Click "WXML" tab in the bottom panel
   - Or press Ctrl+Shift+I (Windows) / Cmd+Shift+I (Mac)

3. Inspect a collapsed node:
   - Find a `.tree-item-wrap` element
   - Check that it has `.tree-item` with class `item-close`
   - Verify NO `.children-level` element exists as a child

4. Expand the node:
   - Click the expand icon in the simulator
   - Refresh WXML panel if needed
   - Verify `.tree-item` now has class `item-open`
   - Verify `.children-level` element NOW exists

5. This confirms wx:if is working correctly

## Expected Results

### Subtask 13.1: Conditional Rendering

✅ **PASS Criteria:**
- Collapsed nodes do NOT have `.children-level` in DOM
- Expanded nodes DO have `.children-level` in DOM
- Verification function reports: `passed: true`
- No errors in verification results

### Subtask 13.2: Performance Metrics

✅ **PASS Criteria:**

| Metric | Target | Expected | Status |
|--------|--------|----------|--------|
| Small tree render (20 nodes) | < 500ms | < 100ms | ✅ |
| Medium tree render (50 nodes) | < 500ms | < 200ms | ✅ |
| Large tree render (100 nodes) | < 500ms | < 400ms | ✅ |
| Expand/collapse response | < 100ms | < 50ms | ✅ |
| Scrolling | Smooth | 60fps | ✅ |

## Troubleshooting

### Issue: Test page not found

**Solution:**
- Verify app.json includes the test page path
- Recompile the project (Ctrl+B / Cmd+B)
- Check for syntax errors in test files

### Issue: Tree component not rendering

**Solution:**
- Verify tree component is registered in test page JSON
- Check component paths are correct
- Ensure tree and tree-node components exist

### Issue: Performance metrics not showing

**Solution:**
- Open Console panel in Developer Tools
- Check for JavaScript errors
- Verify test utility is imported correctly

### Issue: Verification fails

**Solution:**
- Check that tree is in collapsed state before verification
- Ensure tree has nodes with children
- Review console errors for details
- Manually inspect WXML to confirm wx:if behavior

## Performance Monitoring

### Using Developer Tools Performance Panel

1. Open Performance panel (底部工具栏 > Performance)

2. Start recording:
   - Click "Start" button
   - Perform actions (load tree, expand/collapse)
   - Click "Stop" button

3. Analyze results:
   - Check FPS (should be ~60fps)
   - Review JavaScript execution time
   - Check for long tasks (> 50ms)

4. Look for issues:
   - Frame drops during scrolling
   - Long setData operations
   - Memory leaks

### Memory Monitoring

1. Open Memory panel (底部工具栏 > Memory)

2. Take heap snapshot:
   - Before loading tree
   - After loading tree
   - After expanding all nodes
   - After collapsing all nodes

3. Compare snapshots:
   - Check for memory growth
   - Verify memory is released when nodes collapse
   - Look for detached DOM nodes

## Documenting Results

After running tests, document the following:

1. **Test Environment:**
   - WeChat Developer Tools version
   - Operating system
   - Date and time of testing

2. **Performance Metrics:**
   - Actual render times for each scenario
   - Expand/collapse response times
   - Scrolling FPS measurements

3. **Verification Results:**
   - Number of nodes checked
   - Number of collapsed nodes verified
   - Any errors or warnings

4. **Screenshots:**
   - Test page with results
   - Console output
   - WXML inspection showing wx:if behavior

5. **Conclusion:**
   - All requirements met? (Yes/No)
   - Any performance concerns?
   - Recommendations for production

## Next Steps

After successful testing:

1. ✅ Mark subtask 13.1 as complete
2. ✅ Mark subtask 13.2 as complete
3. ✅ Mark task 13 as complete
4. 📝 Update task-13-performance-verification.md with actual results
5. 🚀 Ready for production deployment

## Additional Testing (Optional)

### Real Device Testing

1. Preview on real device:
   - Click "Preview" in Developer Tools
   - Scan QR code with WeChat
   - Run tests on actual device

2. Test on different devices:
   - Low-end device (older phone)
   - Mid-range device
   - High-end device

3. Compare performance:
   - May be slower on real devices
   - Adjust expectations accordingly
   - Document device-specific results

### Stress Testing

1. Generate extremely large tree:
   - Modify test utility to create 500+ nodes
   - Test render performance
   - Monitor memory usage

2. Test rapid interactions:
   - Rapidly expand/collapse multiple nodes
   - Verify no state corruption
   - Check for memory leaks

3. Test edge cases:
   - Empty tree
   - Single node tree
   - Very deep tree (10+ levels)
   - Tree with unbalanced structure
