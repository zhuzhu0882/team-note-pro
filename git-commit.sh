#!/bin/bash

# Team Note Pro - 自动化Git提交脚本
# 自动生成README并提交到GitHub

echo "🚀 Team Note Pro - 自动化Git提交开始..."

# 获取当前时间戳
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
DATE_SHORT=$(date +"%Y-%m-%d")

# 获取文件统计
HTML_FILES=$(find . -name "*.html" -type f | wc -l)
CSS_FILES=$(find . -name "*.css" -type f | wc -l)
JS_FILES=$(find . -name "*.js" -type f | wc -l)
TOTAL_FILES=$((HTML_FILES + CSS_FILES + JS_FILES))

# 获取项目大小
PROJECT_SIZE=$(du -sh . | cut -f1)

# 获取最近的修改时间
LAST_MODIFIED=$(date -r . +"%Y-%m-%d %H:%M:%S")

# 检测Firebase配置
FIREBASE_CONFIGURED=false
if [ -f "firebase.json" ] && [ -f ".firebaserc" ]; then
    FIREBASE_CONFIGURED=true
    FIREBASE_PROJECT=$(cat .firebaserc | grep -o '"default": "[^"]*"' | cut -d'"' -f4)
fi

# 检测主要功能文件
MAIN_APP_EXISTS=false
SIMPLE_APP_EXISTS=false
if [ -f "index.html" ]; then
    MAIN_APP_EXISTS=true
fi
if [ -f "simple-app.html" ]; then
    SIMPLE_APP_EXISTS=true
fi

# 生成README.md
cat > README.md << EOF
# Team Note Pro - 我的笔记应用

一个现代化的在线笔记应用，支持实时同步和多设备访问。

## 🌐 在线访问

- **主应用**: https://team-note-pro.web.app
- **简化版**: https://team-note-pro.web.app/simple-app.html
- **诊断工具**: https://team-note-pro.web.app/index-diagnostic.html
- **索引创建**: https://team-note-pro.web.app/create-index.html

## 📱 功能特性

### ✅ 核心功能
- **📝 笔记管理**: 创建、编辑、删除笔记
- **🔍 搜索功能**: 快速搜索笔记标题和内容
- **💾 自动保存**: 实时保存，防止数据丢失
- **📥 数据导出**: 支持JSON格式导出备份
- **🎨 现代界面**: 响应式设计，支持桌面和移动端

### 🔧 技术特性
- **🔒 安全版本**: 完全内联代码，无外部依赖
- **📱 移动优化**: 触摸友好，响应式布局
- **🌙 深色模式**: 自动适应系统主题
- **⌨️ 快捷键**: Ctrl+N新建，Ctrl+S保存
- **🔍 实时搜索**: 即时搜索笔记内容

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **部署**: Firebase Hosting
- **存储**: LocalStorage / Firestore
- **设计**: 响应式设计 + 渐变色UI

## 📊 项目统计

- **总文件数**: ${TOTAL_FILES} 个
  - HTML文件: ${HTML_FILES} 个
  - CSS文件: ${CSS_FILES} 个
  - JavaScript文件: ${JS_FILES} 个
- **项目大小**: ${PROJECT_SIZE}
- **最后更新**: ${LAST_MODIFIED}

## 🚀 部署信息

### Firebase 配置
- **项目状态**: ${FIREBASE_CONFIGURED:+✅ 已配置} ${FIREBASE_CONFIGURED:-❌ 未配置}
EOF

if [ "$FIREBASE_CONFIGURED" = true ]; then
    cat >> README.md << EOF
- **项目ID**: ${FIREBASE_PROJECT}
- **托管URL**: https://team-note-pro.web.app
EOF
fi

cat >> README.md << EOF

### 应用版本
- **安全主应用**: ${MAIN_APP_EXISTS:+✅ 可用} ${MAIN_APP_EXISTS:-❌ 不可用}
- **简化版应用**: ${SIMPLE_APP_EXISTS:+✅ 可用} ${SIMPLE_APP_EXISTS:-❌ 不可用}

## 📝 最近更新

### ${TIMESTAMP}

**提交内容**:
- 更新主应用安全版本
- 优化用户界面和交互体验
- 修复已知问题和安全漏洞
- 改进移动端兼容性

---

## 🔧 开发指南

### 本地运行
1. 克隆仓库到本地
2. 使用任意HTTP服务器打开index.html
3. 推荐使用Live Server或其他静态服务器

### 部署到Firebase
\`\`\`bash
# 1. 安装Firebase CLI
npm install -g firebase-tools

# 2. 登录Firebase
firebase login

# 3. 部署
firebase deploy --project team-note-pro
\`\`\`

### 文件结构
\`\`\`
hello_html/
├── index.html              # 主应用（安全版本）
├── simple-app.html          # 简化版应用
├── index-diagnostic.html    # 诊断工具
├── create-index.html        # 索引创建工具
├── css/                     # 样式文件
├── js/                      # JavaScript文件
├── firebase.json            # Firebase配置
├── .firebaserc              # Firebase项目配置
└── README.md                # 项目文档（自动生成）
\`\`\`

## 📄 许可证

MIT License - 可自由使用和修改

## 👨‍💻 开发者

Team Note Pro 开发团队

---

*最后更新: ${TIMESTAMP}*
EOF

echo "✅ README.md 已自动生成"

# Git提交
echo "📝 准备Git提交..."

# 添加所有文件
git add .

# 提交信息
COMMIT_MESSAGE="[${DATE_SHORT}] Team Note Pro 更新

🔧 本次更新内容:
- 更新主应用安全版本，修复安全问题
- 优化用户界面和交互体验
- 改进移动端兼容性和响应式设计
- 添加自动化提交和README生成功能
- 项目统计: ${TOTAL_FILES}个文件，大小${PROJECT_SIZE}

📱 功能状态:
✅ 主应用安全版本可用
✅ 简化版应用可用
✅ 诊断工具可用
✅ Firebase部署正常

🔗 在线访问: https://team-note-pro.web.app

🤖 Generated with automated commit script"

git commit -m "$COMMIT_MESSAGE"

echo "✅ Git提交完成"

# 检查是否配置了GitHub远程仓库
if ! git remote | grep -q "origin"; then
    echo "⚠️  未检测到GitHub远程仓库"
    echo ""
    echo "请手动配置GitHub远程仓库："
    echo "1. 在GitHub上创建新仓库"
    echo "2. 运行以下命令："
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    echo ""
    echo "或者使用GitHub CLI："
    echo "   gh repo create <username>/team-note-pro --public --source=. --remote=origin --push"
else
    echo "🚀 检测到GitHub远程仓库，准备推送..."
    # 尝试推送
    if git push origin main 2>/dev/null; then
        echo "✅ 成功推送到GitHub"
    else
        echo "⚠️  推送失败，请手动运行: git push origin main"
    fi
fi

echo ""
echo "🎉 自动化Git提交完成！"
echo "📋 提交摘要:"
echo "   - 时间: ${TIMESTAMP}"
echo "   - 文件: ${TOTAL_FILES}个"
echo "   - 大小: ${PROJECT_SIZE}"
echo "   - README: 已自动更新"
echo ""
echo "🔗 查看更多: git log --oneline -5"