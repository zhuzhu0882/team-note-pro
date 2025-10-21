#!/bin/bash

echo "🚀 Team Note Pro - Firebase 部署脚本"
echo "=================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查 Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "📦 安装 Firebase CLI..."
    npm install -g firebase-tools
fi

# 检查是否已登录
echo "🔐 检查 Firebase 登录状态..."
if ! firebase projects:list &> /dev/null; then
    echo "🔗 请先登录 Firebase:"
    firebase login
fi

# 部署
echo "🌐 开始部署到 Firebase..."
firebase deploy --project team-note-pro

echo ""
echo "✅ 部署完成！"
echo "📱 访问地址:"
echo "   主域名: https://team-note-pro.web.app"
echo "   备用域名: https://team-note-pro.firebaseapp.com"
echo ""
echo "🎉 你的 Team Note Pro 已上线！"