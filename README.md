# Team Wiki Pro - 团队知识库

一个现代化的团队协作wiki系统，支持多人实时编辑和知识管理。

## 🌐 在线访问

### 🇨🇳 国内访问推荐
- **官方网站**: https://www.team.wiki.com (推荐国内用户使用)
- **备用链接**: https://zhuxingxing.github.io/team-note-pro/ (GitHub Pages)

### 🌍 国际访问
- **Firebase 主应用**: https://team-note-pro.web.app
- **简化版**: https://team-note-pro.web.app/simple-app.html
- **诊断工具**: https://team-note-pro.web.app/index-diagnostic.html
- **索引创建**: https://team-note-pro.web.app/create-index.html

## 📱 功能特性

### ✅ 核心功能
- **👥 团队管理**: 创建团队、邀请成员、角色权限控制
- **📚 Wiki页面**: 层级结构、实时编辑、Markdown支持
- **🔍 智能搜索**: 快速搜索wiki页面内容和标题
- **🔐 用户认证**: 支持邮箱登录、Google登录和密码重置
- **☁️ 云端同步**: Firebase Firestore实时同步，多设备访问
- **💬 协作功能**: 页面评论、版本历史、多人编辑
- **🎨 现代界面**: 团队切换器、编辑工具栏、响应式设计

### 🔧 技术特性
- **🔒 安全版本**: 完全内联代码，无外部依赖
- **📱 移动优化**: 触摸友好，响应式布局
- **🌙 深色模式**: 自动适应系统主题
- **⌨️ 快捷键**: Ctrl+N新建页面，Ctrl+S保存
- **🔄 实时协作**: 多人同时编辑，冲突解决
- **📝 Markdown**: 完整的Markdown编辑和预览支持

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Firebase Firestore, Firebase Authentication
- **部署**: Firebase Hosting
- **存储**: 实时数据库 + 本地备份
- **设计**: 响应式设计 + 现代化UI

## 📊 项目统计

- **总文件数**: 20 个
  - HTML文件:       10 个
  - CSS文件:        3 个
  - JavaScript文件:        7 个
- **项目大小**: 508K
- **最后更新**: 2025-10-21 21:54:53

## 🚀 部署信息

### Firebase 配置
- **项目状态**: ✅ 已配置 true
- **项目ID**: team-note-pro
- **托管URL**: https://team-note-pro.web.app

### 应用版本
- **安全主应用**: ✅ 可用 true
- **简化版应用**: ✅ 可用 true

## 📝 最近更新

### 2025-10-22 21:32:20

**提交内容**:
- 更新README文档，完善Team Wiki Pro功能说明和使用指南

---## 🔧 开发指南

### 本地运行
1. 克隆仓库到本地
2. 使用任意HTTP服务器打开index.html
3. 推荐使用Live Server或其他静态服务器

### 团队协作说明
- **团队创建**: 支持创建私有/公开团队，自动生成邀请码
- **成员管理**: 邀请成员加入，分配不同角色权限
- **实时同步**: Wiki页面实时保存到云端，支持多人协作
- **数据结构**: `teams/{teamId}/wiki/pages/{pageId}`
- **权限控制**: 拥有者、管理员、编辑者、查看者四级权限
- **离线支持**: 本地数据备份，确保数据安全

### 部署到Firebase
```bash
# 1. 安装Firebase CLI
npm install -g firebase-tools

# 2. 登录Firebase
firebase login

# 3. 部署
firebase deploy --project team-note-pro
```

### 文件结构
```
hello_html/
├── index.html              # Team Wiki Pro 主应用
├── simple-app.html          # 简化版应用
├── index-diagnostic.html    # 诊断工具
├── create-index.html        # 索引创建工具
├── css/                     # 样式文件
├── js/                      # JavaScript文件
├── firebase.json            # Firebase配置
├── .firebaserc              # Firebase项目配置
├── git-commit.sh            # 自动化提交脚本
├── quick-commit.sh          # 快速提交脚本
├── GIT_GUIDE.md             # Git使用指南
└── README.md                # 项目文档
```

## 📄 许可证

MIT License - 可自由使用和修改

## 👨‍💻 开发者

Team Wiki Pro 开发团队

---

*最后更新: 2025-10-22 21:32:20
