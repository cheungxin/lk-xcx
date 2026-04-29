# Git 操作指南

## 问题说明

路径 `/Volumes/Xin's Disk/` 包含单引号，导致命令执行有问题。

## 解决方案

### 方案 1：创建临时脚本执行

```bash
# 1. 创建执行脚本
cat > /tmp/git_ops.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="/Volumes/Xin's Disk/工作/lingkao/lk-xcx/01 源代码"

case "$1" in
  pull)
    cd "$PROJECT_DIR"
    git pull origin master
    ;;
  status)
    cd "$PROJECT_DIR"
    git status
    ;;
  commit)
    cd "$PROJECT_DIR"
    git add -A
    git commit -m "$2"
    git push origin master
    ;;
  log)
    cd "$PROJECT_DIR"
    git log --oneline -10
    ;;
esac
EOF

chmod +x /tmp/git_ops.sh

# 2. 使用脚本
/tmp/git_ops.sh pull      # 拉取代码
/tmp/git_ops.sh status    # 查看状态
/tmp/git_ops.sh log       # 查看最近提交
/tmp/git_ops.sh commit "提交信息"  # 提交并推送
```

### 方案 2：使用绝对路径别名

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加
alias lkxcx='cd "/Volumes/Xin'"'"'s Disk/工作/lingkao/lk-xcx/01 源代码"'

# 然后使用
lkxcx
git pull
```

### 方案 3：创建软链接

```bash
ln -s "/Volumes/Xin's Disk/工作/lingkao/lk-xcx/01 源代码" ~/lk-xcx
# 之后就可以用
cd ~/lk-xcx
git pull
```

## 推荐操作流程

1. **拉取代码**：`/tmp/git_ops.sh pull`
2. **查看改动**：`/tmp/git_ops.sh status`
3. **提交代码**：`/tmp/git_ops.sh commit "提交信息"`
