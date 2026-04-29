/**
 * 递归树节点组件
 * 用于渲染树形结构的单个节点及其子节点
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
    tree: [], // 处理后的节点数据
    isAnimating: false, // 防止快速点击导致状态混乱
  },

  observers: {
    // 监听 treeNodes 和 selectedIds 变化，初始化显示状态
    'treeNodes, expandAll, selectedIds': function(treeNodes, expandAll, selectedIds) {
      if (!treeNodes || !Array.isArray(treeNodes)) {
        this.setData({ tree: [] });
        return;
      }

      // 为每个节点设置显示状态
      const tree = treeNodes.map(item => {
        // 验证 children 数据
        let validChildren = [];
        let hasValidChildren = false;
        
        if (item.children) {
          if (Array.isArray(item.children)) {
            validChildren = item.children;
            hasValidChildren = item.children.length > 0;
          }
        }
        
        return {
          ...item,
          children: validChildren,
          hasChildren: hasValidChildren,
          open: expandAll,
          selected: (selectedIds || []).includes(item.id),
        };
      });

      this.setData({ tree });
    },
  },

  methods: {
    noop() {},

    // 切换节点展开/收起状态
    isOpen(e) {
      // 防止动画期间的快速点击
      if (this.data.isAnimating) {
        return;
      }
      
      const { index } = e.currentTarget.dataset;
      const key = `tree[${index}].open`;
      
      this.setData({
        isAnimating: true,
        [key]: !this.data.tree[index].open,
      });
      
      // 动画完成后重置状态（300ms 是常见的动画时长）
      setTimeout(() => {
        this.setData({ isAnimating: false });
      }, 300);
    },

    // 处理节点点击，触发导航
    goExamPoint(e) {
      const { item } = e.currentTarget.dataset;
      this.triggerEvent('goAnalysis', {
        node: item,
        id: item.id,
        name: item.name,
        hasChildren: !!item.hasChildren,
        examLevel: item.examLevel || 1,
        examPoint: item.examPoint || item.name,
      });
    },

    // 捕获并重新触发子节点的事件
    tapNode(e) {
      this.triggerEvent('goAnalysis', e.detail);
    },

    // 统一处理整个节点的点击事件
    onItemTap(e) {
      if (this.properties.selectable) {
        this.onSelectNode(e);
        return;
      }

      // 非选择模式下：
      const { item, index } = e.currentTarget.dataset;
      if (item.hasChildren) {
        // 如果有子节点，则切换展开状态
        this.isOpen({
          currentTarget: {
            dataset: { index }
          }
        });
      } else {
        // 如果是叶子节点，则进入做题
        this.goExamPoint(e);
      }
    },

    // 处理节点选择
    onSelectNode(e) {
      const { item } = e.currentTarget.dataset;
      this.triggerEvent('select', { id: item.id });
    },

    // 捕获并重新触发子节点的选择事件
    tapSelect(e) {
      this.triggerEvent('select', e.detail);
    },
  },
});
