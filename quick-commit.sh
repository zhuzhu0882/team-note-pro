#!/bin/bash

# Team Note Pro - 快速提交脚本
# 使用方法: ./quick-commit.sh "提交信息"

echo "🚀 Team Note Pro - 快速Git提交"

# 获取提交信息
if [ -z "$1" ]; then
    MESSAGE="更新应用和文档"
else
    MESSAGE="$1"
fi

# 获取时间戳
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
DATE_SHORT=$(date +"%Y-%m-%d")

# 更新README中的最近更新时间
sed -i '' "s/\*最后更新: .*/\*最后更新: ${TIMESTAMP}/" README.md

# 在最近更新部分添加新条目
NEW_UPDATE="### ${TIMESTAMP}

**提交内容**:
- $MESSAGE

---

## 🔧 开发指南 (之前)"

# 使用sed进行替换
sed -i '' "/## 📝 最近更新/,/---/c\\
## 📝 最近更新\\
\\
### ${TIMESTAMP}\\
\\
**提交内容**:\\
- $MESSAGE\\
\\
---" README.md

# Git提交
git add README.md
git add .
git commit -m "[${DATE_SHORT}] $MESSAGE

📝 本次更新:
- $MESSAGE

🔗 项目: https://team-note-pro.web.app
📅 时间: ${TIMESTAMP}"

echo "📝 提交信息: $MESSAGE"
echo "📅 提交时间: $TIMESTAMP"

# 推送到GitHub
if git push origin main; then
    echo "✅ 成功推送到GitHub"
else
    echo "⚠️  推送失败，请检查网络连接"
fi

echo "🎉 快速提交完成！"