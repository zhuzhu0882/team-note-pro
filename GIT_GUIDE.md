# Git 自动化提交指南

## 🚀 快速开始

Team Note Pro 已经配置了完全自动化的 Git 提交系统！

## 📝 提交脚本

### 1. 完整提交脚本 (推荐)
```bash
./git-commit.sh
```
- ✅ 自动生成完整的 README.md
- ✅ 统计项目文件和大小
- ✅ 检测 Firebase 配置状态
- ✅ 自动推送到 GitHub
- ✅ 生成详细的提交信息

### 2. 快速提交脚本
```bash
./quick-commit.sh "你的提交信息"
```
- ✅ 快速更新 README 时间戳
- ✅ 更新最近更新记录
- ✅ 简化提交信息
- ✅ 自动推送到 GitHub

**使用示例**:
```bash
./quick-commit.sh "修复了搜索功能的bug"
./quick-commit.sh "优化了移动端界面"
./quick-commit.sh "添加了导出功能"
```

## 📊 自动生成的 README 内容

README.md 会自动包含以下信息：

### 🌐 在线访问链接
- 主应用、简化版、诊断工具等所有链接

### 📱 功能特性
- 核心功能、技术特性列表

### 🛠️ 技术栈
- 前端技术、部署方案

### 📊 项目统计
- 文件数量统计 (HTML/CSS/JS)
- 项目大小
- 最后更新时间

### 🚀 部署信息
- Firebase 配置状态
- 项目ID 和托管URL

### 📝 最近更新记录
- 每次提交都会自动添加到 README
- 包含时间戳和提交内容

### 🔧 开发指南
- 本地运行说明
- 部署步骤
- 文件结构

## 🔄 工作流程

### 日常开发提交
1. 完成功能开发或修复
2. 运行快速提交脚本：
   ```bash
   ./quick-commit.sh "描述你的更改"
   ```
3. 完成！README 会自动更新，代码会推送到 GitHub

### 重要更新提交
1. 完成重要功能或重大更改
2. 运行完整提交脚本：
   ```bash
   ./git-commit.sh
   ```
3. README 会完全重新生成，包含最新的项目统计

## 📝 提交信息规范

### 快速提交格式
脚本会自动将你的消息格式化为：
```
[2025-10-21] 你的消息

📝 本次更新:
- 你的消息

🔗 项目: https://team-note-pro.web.app
📅 时间: 2025-10-21 22:03:23
```

### 建议的提交信息
- ✅ "修复了搜索功能的响应问题"
- ✅ "优化了移动端的触摸体验"
- ✅ "添加了数据导出功能"
- ✅ "更新了用户界面设计"
- ✅ "解决了安全漏洞问题"

## 🔧 高级功能

### 自定义提交脚本
你可以修改 `git-commit.sh` 来自定义：
- README 模板
- 统计信息
- 提交信息格式
- 推送目标

### 查看提交历史
```bash
# 查看最近5次提交
git log --oneline -5

# 查看详细的提交信息
git log -5 --pretty=format:"%h - %an, %ar : %s"

# 查看文件变更
git show --name-only HEAD
```

### 回滚操作
```bash
# 回滚到上一个提交
git reset --soft HEAD~1

# 强制推送到GitHub (谨慎使用)
git push --force-with-lease origin main
```

## 🌐 GitHub 仓库

- **仓库地址**: https://github.com/zhuzhu0882/team-note-pro
- **README 地址**: https://github.com/zhuzhu0882/team-note-pro/blob/main/README.md
- **提交历史**: https://github.com/zhuzhu0882/team-note-pro/commits/main

## 📱 移动端使用

在移动设备上，你也可以使用这些脚本：

```bash
# 安装 Termius 或其他终端应用
# 克隆仓库
git clone https://github.com/zhuzhu0882/team-note-pro.git
cd team-note-pro

# 使用脚本提交
./quick-commit.sh "移动端提交测试"
```

## 🎯 最佳实践

1. **频繁提交**: 每完成一个小功能就提交
2. **描述清晰**: 提交信息要清楚说明更改内容
3. **测试后再提交**: 确保功能正常工作
4. **查看README**: 每次 GitHub 更新后检查 README 是否正确

---

*文档最后更新: 2025-10-21 22:03:23*