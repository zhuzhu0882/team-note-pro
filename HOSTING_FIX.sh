#!/bin/bash

echo "🔧 修复 Firebase Hosting 配置 - Team Note Pro"
echo "============================================"

echo "📝 问题诊断："
echo "   错误: resolving hosting target of a site with no site name or target name"
echo "   原因: Firebase Hosting 没有正确配置站点"

echo ""
echo "🧹 清理旧的 Firebase 配置..."
rm -rf .firebase

echo ""
echo "🔍 重新初始化 Firebase Hosting..."
firebase init hosting

echo ""
echo "⚠️  请按照以下选项配置："
echo "   ? What do you want to use as your public directory?"
echo "   → 输入: . (点号，当前目录)"
echo ""
echo "   ? Configure as a single-page app (rewrite all urls to /index.html)?"
echo "   → 输入: y (是)"
echo ""
echo "   ? File index.html already exists. Overwrite?"
echo "   → 输入: n (否)"

echo ""
echo "✅ 配置完成后，按任意键继续..."
read -p "按回车键继续..."

echo ""
echo "🚀 部署到 Firebase..."
firebase deploy --project team-note-pro

echo ""
echo "✅ 部署完成！"
echo "📱 访问地址:"
echo "   主域名: https://team-note-pro.web.app"
echo "   测试页面: https://team-note-pro.web.app/test.html"
echo ""
echo "🎉 你的 Team Note Pro 已重新部署！"