#!/bin/bash

# Team Wiki Pro - 多平台部署脚本
# 支持同时推送到 GitHub 和 Gitee

echo "🚀 Team Wiki Pro - 多平台部署开始..."

# 获取时间戳
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# 检查Git状态
echo "📋 检查Git状态..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  检测到未提交的更改，正在提交..."

    # 添加所有更改
    git add .

    # 提交更改
    git commit -m "[${TIMESTAMP}] 多平台同步部署

📝 本次更新:
- 同步代码到GitHub和Gitee平台
- 确保国内外用户都能正常访问

🔗 访问链接:
🇨🇳 国内: https://team-note-pro.web.app (当前可用)
🌍 国际: https://team-note-pro.web.app

🤖 Generated with automated deploy script"
fi

echo "📡 推送到GitHub..."
if git push origin main; then
    echo "✅ GitHub推送成功"
else
    echo "❌ GitHub推送失败"
fi

echo "📡 推送到Gitee..."
if git push gitee main; then
    echo "✅ Gitee推送成功"
else
    echo "❌ Gitee推送失败"
fi

echo ""
echo "🎉 多平台部署完成！"
echo ""
echo "🌐 访问地址:"
echo "🇨🇳 国内用户: https://team-note-pro.web.app (当前可用)"
echo "🌍 国际用户: https://team-note-pro.web.app"
echo "📱 GitHub Pages: https://zhuxingxing.github.io/team-note-pro/"
echo ""
echo "📋 提示: Gitee Pages需要在Gitee后台手动开启Pages服务"