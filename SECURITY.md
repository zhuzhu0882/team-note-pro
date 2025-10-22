# Team Wiki Pro - 安全配置文档

## 🔒 安全特性

### 1. 内容安全策略 (CSP)
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://*.firebaseio.com https://*.firebase.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.firebaseio.com https://*.firebase.com https://*.googleapis.com; frame-src 'self' https://*.firebase.com;">
```

### 2. HTTP 安全头部
- **X-Content-Type-Options**: `nosniff` - 防止MIME类型嗅探
- **X-Frame-Options**: `DENY` - 防止点击劫持
- **X-XSS-Protection**: `1; mode=block` - 启用XSS过滤器
- **Referrer-Policy**: `strict-origin-when-cross-origin` - 控制引用信息泄露

### 3. Firebase 安全配置
- 使用 Firebase Authentication 进行用户认证
- Firestore 安全规则保护数据访问
- API 密钥限制在授权域名

### 4. 数据保护
- 所有敏感数据传输使用 HTTPS
- 密码和认证信息通过安全通道传输
- 本地存储数据加密处理

## 🛡️ 安全最佳实践

### 用户认证
- 支持邮箱/密码和 Google OAuth 登录
- 密码强度验证
- 会话管理和自动登出

### 数据安全
- Firebase Firestore 安全规则
- 用户数据隔离
- 角色权限控制

### 网络安全
- 强制 HTTPS 连接
- CSP 防止 XSS 攻击
- 防止 CSRF 攻击

## 🔧 安全配置更新

### 域名安全配置
- **主域名**: https://www.team.wiki.cn
- **备用域名**: https://team-note-pro.web.app
- **GitHub Pages**: https://zhuxingxing.github.io/team-note-pro/

### SSL/TLS 配置
- 所有域名均启用 SSL/TLS
- 使用现代加密协议
- 定期更新安全证书

## 📋 安全检查清单

- [x] CSP 策略配置
- [x] HTTP 安全头部
- [x] HTTPS 强制使用
- [x] 用户认证系统
- [x] 数据访问控制
- [x] XSS 防护
- [x] 点击劫持防护
- [x] 内容类型嗅探防护

## 🚨 安全事件响应

如果发现安全问题：
1. 立即评估影响范围
2. 采取缓解措施
3. 更新安全配置
4. 通知用户（如需要）

## 📞 安全联系方式

如发现安全漏洞，请通过以下方式联系：
- GitHub Issues: https://github.com/zhuzhu0882/team-note-pro/issues
- 邮箱: security@team.wiki.cn

---

*最后更新: 2025-10-22*