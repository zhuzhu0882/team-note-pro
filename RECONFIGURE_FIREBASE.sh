#!/bin/bash

echo "🔧 重新配置 Firebase 项目 - Team Note Pro"
echo "============================================="

# 检查当前目录
echo "📁 当前目录: $(pwd)"

# 备份现有配置
echo "💾 备份现有配置文件..."
cp firebase.json firebase.json.backup 2>/dev/null || true
cp .firebaserc .firebaserc.backup 2>/dev/null || true

# 清理旧的配置
echo "🧹 清理旧的 Firebase 配置..."
rm -rf .firebase
rm -f .firebaserc

echo ""
echo "🚀 开始重新配置 Firebase..."
echo "请按照以下提示操作："
echo ""

# 开始 Firebase 初始化
firebase init

echo ""
echo "✅ Firebase 初始化完成！"
echo ""
echo "📋 请确认以下配置："
echo "- 项目: team-note-pro"
echo "- Hosting public 目录: ."
echo "- 单页应用: y"
echo "- 不覆盖 index.html: n"
echo ""
echo "如果配置正确，继续部署..."
echo "如果配置错误，请重新运行此脚本"

# 检查配置文件
if [ -f ".firebaserc" ]; then
    echo ""
    echo "✅ Firebase 配置文件已创建:"
    cat .firebaserc
else
    echo "❌ 配置文件创建失败"
    exit 1
fi

if [ -f "firebase.json" ]; then
    echo ""
    echo "✅ Hosting 配置已创建:"
    cat firebase.json
else
    echo "❌ Hosting 配置文件创建失败"
    exit 1
fi