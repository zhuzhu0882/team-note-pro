# Firebase 部署指南

## 🚀 Firebase 快速部署步骤

### 第一步：创建 Firebase 项目

1. **访问 Firebase 控制台**
   - 打开 [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - 使用 Google 账号登录

2. **创建新项目**
   - 点击"添加项目"
   - 输入项目名称（如：`my-notes-app`）
   - 选择是否启用 Google Analytics
   - 点击"创建项目"

### 第二步：配置 Firebase 服务

#### 1. 启用 Authentication
```
1. 在左侧菜单点击 "Authentication"
2. 点击"开始使用"
3. 在"登录方法"标签页中：
   - 启用"邮箱/密码"登录方式
   - 可选：启用 Google 登录方式
4. 在"用户"标签页中查看注册用户
```

#### 2. 创建 Firestore 数据库
```
1. 在左侧菜单点击"Firestore 数据库"
2. 点击"创建数据库"
3. 选择"以测试模式启动（30天内）"
4. 选择数据库位置（推荐选择离你最近的区域）
5. 点击"启用"
```

#### 3. 设置 Firestore 安全规则
```
1. 在 Firestore 页面点击"规则"标签页
2. 替换规则内容为（见下面的安全规则）
3. 点击"发布"
```

#### 4. 启用 Hosting
```
1. 在左侧菜单点击"Hosting"
2. 点击"开始使用"
3. 配置主机信息，点击"下一步"
4. 设置为单页应用，点击"下一步"
5. 记录 Firebase 项目信息
```

### 第三步：获取 Firebase 配置信息

1. **获取配置对象**
   - 在项目设置中，选择"您的应用"标签页
   - 点击 Web 应用图标
   - 复制配置对象信息

2. **配置对象示例**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
};
```

### 第四步：修改本地代码

1. **更新 Firebase 配置**
   - 编辑 `js/firebase-config.js` 文件
   - 替换为你的实际配置信息

2. **更新 Firestore 安全规则**
   - 复制下面的安全规则到 Firebase 控制台

### 第五步：部署到 Firebase

1. **安装 Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **登录 Firebase**
```bash
firebase login
```

3. **初始化项目**
```bash
firebase init hosting
```

4. **部署应用**
```bash
firebase deploy
```

## 📋 Firestore 安全规则

复制以下规则到 Firebase Firestore 规则编辑器：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的笔记
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 笔记访问规则
    match /notes/{noteId} {
      // 用户可以创建自己的笔记
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.uid;

      // 用户可以读取、更新、删除自己的笔记
      allow read, write, delete: if request.auth != null &&
        request.auth.uid == resource.data.uid;

      // 公开笔记（如果需要分享功能）
      allow read: if resource.data.isPublic == true;
    }

    // 用户配置文件规则
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔧 技术配置详情

### Firebase 项目结构
```
my-notes-app/
├── index.html
├── login.html
├── css/
│   ├── style.css
│   └── auth.css
├── js/
│   ├── firebase-config.js    # Firebase 配置文件
│   ├── app.js
│   ├── auth.js
│   └── storage.js
└── firebase.json             # Firebase 配置文件
```

### firebase.json 配置
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 🌐 自定义域名设置

### 1. 添加自定义域名
1. 在 Firebase Hosting 页面点击"自定义域"
2. 输入你的域名（如：`mynotes.com`）
3. 点击"继续"

### 2. 配置 DNS 记录
```
A 记录：
- 主机名：@
- 值：192.168.0.1, 192.168.0.2

AAAA 记录：
- 主机名：@
- 值：2001:db8:85a3:0:0:8a2e:370:7334
```

### 3. 免费域名选项
- **Freenom**: 免费顶级域名（.tk, .ml, .ga, .cf）
- **GitHub Pages**: `username.github.io`
- **Netlify**: 随机子域名

## 📊 使用量和限制

### Firebase 免费配额
- **Authentication**: 10,000 次月活用户
- **Firestore**:
  - 存储：1GB
  - 读取：50,000 次/天
  - 写入：20,000 次/天
  - 删除：20,000 次/天
- **Hosting**: 10GB 存储流量，360MB/天传输

### 成本估算
- **个人使用**: 免费（通常足够）
- **小型团队**: $25-50/月
- **商业应用**: $100+/月

## 🛠️ 故障排除

### 常见问题

1. **登录失败**
   - 检查 Firebase 配置是否正确
   - 确认 Authentication 已启用
   - 检查网络连接

2. **数据库访问被拒绝**
   - 检查 Firestore 安全规则
   - 确认用户已登录
   - 检查数据结构是否匹配

3. **部署失败**
   - 确认 Firebase CLI 已正确安装
   - 检查 `firebase.json` 配置
   - 确认项目权限

### 调试技巧
- 打开浏览器开发者工具查看错误信息
- 检查 Firebase 控制台的使用情况
- 使用 Firebase 调试工具

## 🎯 下一步功能建议

1. **增强功能**
   - 笔记分享功能
   - 协作编辑
   - 文件附件
   - 标签系统

2. **性能优化**
   - 数据分页
   - 离线缓存
   - 图片压缩

3. **安全性增强**
   - 两步验证
   - 数据加密
   - 访问日志

---

## 📞 需要帮助？

如果在部署过程中遇到任何问题，请检查：
1. Firebase 项目配置是否正确
2. 代码中的配置信息是否匹配
3. 安全规则是否正确设置
4. 网络连接是否正常

祝你的笔记网站部署成功！🎉