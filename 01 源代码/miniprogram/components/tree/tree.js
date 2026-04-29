/**
 * 树形结构组件
 * 用于渲染根级别的树形结构，使用 tree-node 组件递归渲染子节点
 */
Component({
  options: {
    styleIsolation: 'shared',
  },

  properties: {
    // 树节点数据数组
    treeNodes: {
      type: Array,
      value: [],
    },
    // 是否展开所有节点
    expandAll: {
      type: Boolean,
      value: false,
    },
    // 调用页面标识
    page: {
      type: String,
      value: '',
    },
    // 是否支持选择模式
    selectable: {
      type: Boolean,
      value: false,
    },
    // 已选节点的 ID 数组
    selectedIds: {
      type: Array,
      value: [],
    },
  },

  data: {
    tree: [], // 处理后的根节点数据
  },

  observers: {
    // 监听 treeNodes 变化，初始化展开状态
    'treeNodes, expandAll': function(treeNodes, expandAll) {
      if (!treeNodes || !Array.isArray(treeNodes)) {
        this.setData({ tree: [] });
        return;
      }

      // 为每个根节点设置初始展开状态
      const tree = treeNodes.map(item => ({
        ...item,
        open: expandAll,
      }));

      this.setData({ tree });
    },
  },

  methods: {
    // 捕获并重新触发子节点的导航事件
    handleGoAnalysis(e) {
      this.triggerEvent('goAnalysis', e.detail);
    },

    // 捕获并重新触发子节点的选择事件
    handleSelect(e) {
      this.triggerEvent('select', e.detail);
    },
  },
});
