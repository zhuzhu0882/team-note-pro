# Team Wiki Pro - 域名配置指南

## 🔍 问题诊断

**问题**: `https://www.team.wiki.cn` 无法访问
**原因**: 域名未配置DNS解析记录
**状态**: 需要配置域名解析

## 🛠️ 域名配置步骤

### 方案1: 配置到Firebase Hosting (推荐)

如果您拥有 `team.wiki.cn` 域名，可以将其连接到Firebase Hosting：

#### 1. 登录Firebase控制台
- 访问: https://console.firebase.google.com
- 选择项目: `team-note-pro`
- 进入: Hosting → 自定义域名

#### 2. 添加自定义域名
1. 点击"添加自定义域名"
2. 输入域名: `www.team.wiki.cn`
3. 点击"继续"

#### 3. 配置DNS记录
Firebase会提供以下DNS记录，需要在域名注册商处配置：

```
类型: A
名称: www
值: 192.168.1.1 (示例IP，实际以Firebase提供为准)
TTL: 3600 (或默认值)

类型: CNAME (可选)
名称: @
值: gh-pages.github.io (如果使用GitHub Pages)
TTL: 3600
```

#### 4. 验证域名所有权
- 上传验证文件到域名根目录
- 或配置DNS TXT记录

### 方案2: 使用GitHub Pages (快速方案)

#### 1. 创建GitHub Pages
```bash
# 在GitHub仓库设置中启用Pages
# Settings → Pages → Source: Deploy from a branch
# Branch: main / (root)
```

#### 2. 配置自定义域名
1. 在仓库根目录创建 `CNAME` 文件
2. 内容为: `www.team.wiki.cn`

```bash
echo "www.team.wiki.cn" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

#### 3. 配置DNS记录
在域名注册商处配置：
```
类型: CNAME
名称: www
值: zhuxingxing.github.io
TTL: 3600
```

### 方案3: 使用国内CDN服务

#### 1. 腾讯云CDN
1. 注册腾讯云CDN服务
2. 添加域名: `team.wiki.cn`
3. 配置源站地址: `https://team-note-pro.web.app`
4. 配置DNS记录

#### 2. 阿里云CDN
1. 注册阿里云CDN服务
2. 添加域名并备案
3. 配置源站: Firebase Hosting地址
4. 配置CNAME记录

## 🔧 DNS配置详情

### 必需的DNS记录

#### A记录 (推荐)
```
类型: A
名称: www
值: 151.101.1.195 (以Firebase实际提供为准)
TTL: 3600
```

#### CNAME记录 (备选)
```
类型: CNAME
名称: www
值: team-note-pro.web.app
TTL: 3600
```

#### 根域名配置
```
类型: A
名称: @
值: 151.101.1.195
TTL: 3600
```

## 📋 配置检查清单

- [ ] 域名已购买并激活
- [ ] DNS记录已配置
- [ ] SSL证书已申请
- [ ] 域名验证已完成
- [ ] 网站可以正常访问

## 🚨 故障排除

### 常见问题

#### 1. DNS解析慢
- **原因**: DNS缓存需要时间更新
- **解决**: 等待24-48小时，或清除本地DNS缓存

#### 2. SSL证书问题
- **原因**: 域名验证未完成
- **解决**: 上传验证文件或配置TXT记录

#### 3. 404错误
- **原因**: 域名未正确指向托管服务
- **解决**: 检查DNS记录和托管服务配置

#### 4. 502错误
- **原因**: 源站服务不可用
- **解决**: 检查Firebase Hosting状态

## 🛠️ 工具推荐

### DNS检查工具
- **nslookup**: `nslookup www.team.wiki.cn`
- **dig**: `dig www.team.wiki.cn`
- **在线工具**: https://dnschecker.org

### SSL检查工具
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **Let's Debug**: https://letsdebug.net/

## 📞 技术支持

如需帮助配置域名，请联系：
- **域名注册商技术支持**
- **Firebase支持**: https://firebase.google.com/support
- **GitHub支持**: https://support.github.com

---

## 📋 当前状态

- ✅ 代码已部署到Firebase Hosting
- ✅ Firebase地址正常工作: https://team-note-pro.web.app
- ❌ 自定义域名未配置
- 📋 需要配置DNS解析记录

**推荐操作**: 使用方案1配置Firebase自定义域名，或使用方案2快速部署到GitHub Pages

*最后更新: 2025-10-22*