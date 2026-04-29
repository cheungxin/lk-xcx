/**
 * Tree Performance Testing Utility
 * 
 * This utility provides functions to:
 * 1. Generate large tree structures for testing
 * 2. Verify conditional rendering (collapsed nodes don't render children)
 * 3. Measure performance metrics (render time, interaction time)
 */

/**
 * Generate a large tree structure for testing
 * @param {number} depth - Maximum depth of the tree
 * @param {number} childrenPerNode - Number of children per node
 * @param {number} currentDepth - Current depth (used internally for recursion)
 * @param {string} parentId - Parent node ID (used internally)
 * @returns {Array} Array of tree nodes
 */
function generateLargeTree(depth = 3, childrenPerNode = 5, currentDepth = 0, parentId = '') {
  if (currentDepth >= depth) {
    return [];
  }

  const nodes = [];
  for (let i = 0; i < childrenPerNode; i++) {
    const nodeId = parentId ? `${parentId}-${i}` : `node-${i}`;
    const node = {
      id: nodeId,
      examPoint: `测试节点 ${nodeId}`,
      answerDesc: `已练习 ${Math.floor(Math.random() * 50)} / ${Math.floor(Math.random() * 100 + 50)} 题`,
      examLevel: currentDepth + 1,
      answered: Math.floor(Math.random() * 50),
      total: Math.floor(Math.random() * 100 + 50),
    };

    // Add children if not at max depth
    if (currentDepth < depth - 1) {
      node.children = generateLargeTree(depth, childrenPerNode, currentDepth + 1, nodeId);
    }

    nodes.push(node);
  }

  return nodes;
}

/**
 * Calculate total number of nodes in a tree
 * @param {Array} nodes - Tree nodes array
 * @returns {number} Total node count
 */
function countNodes(nodes) {
  if (!nodes || !Array.isArray(nodes)) {
    return 0;
  }

  let count = nodes.length;
  nodes.forEach(node => {
    if (node.children && Array.isArray(node.children)) {
      count += countNodes(node.children);
    }
  });

  return count;
}

/**
 * Verify conditional rendering by checking DOM structure
 * This function should be called from a page context where the tree is rendered
 * @param {Object} page - Page instance with selectAllComponents method
 * @returns {Object} Verification results
 */
function verifyConditionalRendering(page) {
  const results = {
    passed: true,
    collapsedNodesChecked: 0,
    collapsedNodesWithChildren: 0,
    errors: [],
  };

  try {
    // Get all tree-node components
    const treeNodes = page.selectAllComponents('.tree-node');
    
    if (!treeNodes || treeNodes.length === 0) {
      results.passed = false;
      results.errors.push('No tree-node components found');
      return results;
    }

    // Check each tree-node component
    treeNodes.forEach((component, index) => {
      const data = component.data;
      
      if (!data.tree || !Array.isArray(data.tree)) {
        return;
      }

      data.tree.forEach((node, nodeIndex) => {
        // Check if node is collapsed and has children
        if (!node.open && node.children && node.children.length > 0) {
          results.collapsedNodesChecked++;
          
          // Verify that children are not rendered in DOM
          // In WeChat miniprogram, wx:if removes elements from DOM
          // We check if the children-level class exists for this node
          const selector = `.tree-item-wrap:nth-child(${nodeIndex + 1}) .children-level`;
          const childrenContainer = component.selectComponent(selector);
          
          if (childrenContainer) {
            results.passed = false;
            results.errors.push(
              `Node ${node.id || nodeIndex} is collapsed but children are in DOM`
            );
          } else {
            results.collapsedNodesWithChildren++;
          }
        }
      });
    });

    if (results.collapsedNodesChecked === 0) {
      results.errors.push('Warning: No collapsed nodes with children found to verify');
    }

  } catch (error) {
    results.passed = false;
    results.errors.push(`Verification error: ${error.message}`);
  }

  return results;
}

/**
 * Measure tree rendering performance
 * @param {Function} renderCallback - Function that triggers tree rendering
 * @returns {Promise<Object>} Performance metrics
 */
async function measureRenderPerformance(renderCallback) {
  const startTime = Date.now();
  
  try {
    await renderCallback();
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    return {
      success: true,
      renderTime,
      meetsRequirement: renderTime < 500, // Requirement 13.1: < 500ms
      message: `Render time: ${renderTime}ms (requirement: < 500ms)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Measure expand/collapse interaction performance
 * @param {Object} component - Tree node component instance
 * @param {number} nodeIndex - Index of node to toggle
 * @returns {Promise<Object>} Performance metrics
 */
async function measureTogglePerformance(component, nodeIndex) {
  const startTime = Date.now();
  
  try {
    // Simulate toggle action
    const event = {
      currentTarget: {
        dataset: { index: nodeIndex }
      }
    };
    
    component.isOpen(event);
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const endTime = Date.now();
    const toggleTime = endTime - startTime - 300; // Subtract animation delay
    
    return {
      success: true,
      toggleTime,
      meetsRequirement: toggleTime < 100, // Requirement 13.2: < 100ms
      message: `Toggle time: ${toggleTime}ms (requirement: < 100ms)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate test scenarios with different tree sizes
 * @returns {Array} Array of test scenarios
 */
function generateTestScenarios() {
  return [
    {
      name: 'Small tree (20 nodes)',
      depth: 2,
      childrenPerNode: 4,
      expectedNodes: 20, // 4 + 16
    },
    {
      name: 'Medium tree (50+ nodes)',
      depth: 3,
      childrenPerNode: 3,
      expectedNodes: 39, // 3 + 9 + 27
    },
    {
      name: 'Large tree (100+ nodes)',
      depth: 3,
      childrenPerNode: 5,
      expectedNodes: 155, // 5 + 25 + 125
    },
    {
      name: 'Deep tree (4 levels)',
      depth: 4,
      childrenPerNode: 3,
      expectedNodes: 120, // 3 + 9 + 27 + 81
    },
  ];
}

/**
 * Run complete performance test suite
 * @param {Object} page - Page instance
 * @returns {Object} Complete test results
 */
function runPerformanceTestSuite(page) {
  const scenarios = generateTestScenarios();
  const results = {
    timestamp: new Date().toISOString(),
    scenarios: [],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
    },
  };

  scenarios.forEach(scenario => {
    const tree = generateLargeTree(scenario.depth, scenario.childrenPerNode);
    const actualNodes = countNodes(tree);
    
    const scenarioResult = {
      name: scenario.name,
      expectedNodes: scenario.expectedNodes,
      actualNodes,
      tree,
      passed: Math.abs(actualNodes - scenario.expectedNodes) < 5, // Allow small variance
    };

    results.scenarios.push(scenarioResult);
    results.summary.totalTests++;
    
    if (scenarioResult.passed) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  });

  return results;
}

module.exports = {
  generateLargeTree,
  countNodes,
  verifyConditionalRendering,
  measureRenderPerformance,
  measureTogglePerformance,
  generateTestScenarios,
  runPerformanceTestSuite,
};
