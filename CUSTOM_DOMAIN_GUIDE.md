# 🌐 Team Note Pro - 自定义域名配置指南

## 🎯 **目标域名：www.team-note-pro.com**

## 📋 **配置步骤总览**

### 第一步：购买域名
1. 推荐域名注册商：
   - 阿里云：https://wanwang.aliyun.com/domain/
   - 腾讯云：https://dnspod.cloud.tencent.com/
   - Namecheap：https://www.namecheap.com/
   - Cloudflare：https://www.cloudflare.com/

2. 搜索并购买 `team-note-pro.com`

### 第二步：Firebase 添加自定义域名
1. 打开 Firebase 控制台：https://console.firebase.google.com/
2. 选择项目：Team Note Pro
3. 左侧菜单点击 **Hosting**
4. 点击 **"自定义域"**
5. 输入：`www.team-note-pro.com`
6. 点击 **"继续"**

### 第三步：DNS 配置

Firebase 会提供以下 DNS 记录需要配置：

#### A 记录（主域名）
```
类型: A
主机名: @
值: 192.168.0.1
TTL: 300
```

#### A 记录（www子域名）
```
类型: A
主机名: www
值: 192.168.0.1
TTL: 300
```

#### CNAME 记录（推荐，更简单）
```
类型: CNAME
主机名: www
值: team-note-pro.web.app
TTL: 300
```

### 第四步：在域名注册商配置 DNS

**阿里云配置：**
1. 登录阿里云控制台
2. 进入域名管理
3. 找到 DNS 解析设置
4. 添加记录：
   - 记录类型：CNAME
   - 主机记录：www
   - 记录值：team-note-pro.web.app
   - TTL：600

**腾讯云配置：**
1. 登录腾讯云 DNSPod
2. 进入域名解析
3. 添加记录：
   - 记录类型：CNAME
   - 主机记录：www
   - 记录值：team-note-pro.web.app
   - TTL：600

**Namecheap 配置：**
1. 登录 Namecheap Dashboard
2. 选择域名 → Manage
3. Advanced DNS
4. 添加记录：
   - Type: CNAME
   - Host: www
   - Value: team-note-pro.web.app
   - TTL: Automatic

### 第五步：验证和发布

1. 在 Firebase 中点击 **"验证域名"**
2. 等待 DNS 生效（通常需要几分钟到几小时）
3. Firebase 会自动配置 SSL 证书
4. 完成后状态会显示"已发布"

## ⏱️ **DNS 生效时间**

- **最快**: 5-15 分钟
- **通常**: 30 分钟 - 2 小时
- **最长**: 48 小时

## 🧪 **验证方法**

1. **命令行验证**：
   ```bash
   nslookup www.team-note-pro.com
   ping www.team-note-pro.com
   ```

2. **在线验证**：
   - https://www.whatsmydns.net/
   - 输入：www.team-note-pro.com

## 🔧 **常见问题解决**

### 问题1：DNS 配置后无法访问
- 检查 DNS 记录是否正确
- 等待更长时间让 DNS 生效
- 清除本地 DNS 缓存：`ipconfig /flushdns`

### 问题2：SSL 证书未生效
- SSL 证书会在 DNS 验证后自动配置
- 可能需要额外 24 小时

### 问题3：只访问到 Firebase 默认域名
- 检查 CNAME 记录是否指向正确的 Firebase 域名
- 确认在 Firebase 中已添加自定义域名

## 📱 **配置完成后**

你的网站将在以下地址访问：
- ✅ https://team-note-pro.web.app (默认)
- ✅ https://www.team-note-pro.com (自定义)
- ✅ 自动 HTTPS 重定向

## 🎉 **完成标准**

当满足以下条件时，配置成功：
- ✅ www.team-note-pro.com 可以正常访问
- ✅ HTTPS 证书正常工作（锁图标）
- ✅ 与默认域名功能完全一致

---

## 🚀 **开始配置吧！**

1. 先购买域名
2. 然后告诉我你在哪个平台购买的
3. 我会提供针对性的详细步骤

**你的 Team Note Pro 即将拥有专业域名！** 🌟