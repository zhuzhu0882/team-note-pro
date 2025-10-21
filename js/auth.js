// 认证管理类
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.initElements();
        this.bindEvents();
        this.checkExistingAuth();
    }

    // 初始化DOM元素
    initElements() {
        // 表单元素
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');

        // 输入元素
        this.loginEmail = document.getElementById('login-email');
        this.loginPassword = document.getElementById('login-password');
        this.registerUsername = document.getElementById('register-username');
        this.registerEmail = document.getElementById('register-email');
        this.registerPassword = document.getElementById('register-password');
        this.registerConfirmPassword = document.getElementById('register-confirm-password');

        // 状态元素
        this.loading = document.getElementById('loading');
        this.message = document.getElementById('message');
        this.messageText = document.getElementById('message-text');
    }

    // 绑定事件
    bindEvents() {
        // 登录表单
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // 注册表单
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // 输入验证
        this.loginEmail.addEventListener('blur', () => this.validateEmail(this.loginEmail));
        this.loginPassword.addEventListener('blur', () => this.validatePassword(this.loginPassword));
        this.registerUsername.addEventListener('blur', () => this.validateUsername(this.registerUsername));
        this.registerEmail.addEventListener('blur', () => this.validateEmail(this.registerEmail));
        this.registerPassword.addEventListener('blur', () => this.validatePassword(this.registerPassword));
        this.registerConfirmPassword.addEventListener('blur', () => this.validatePasswordConfirm());

        // 实时验证
        this.registerPassword.addEventListener('input', () => {
            if (this.registerConfirmPassword.value) {
                this.validatePasswordConfirm();
            }
        });
    }

    // 检查现有认证状态
    checkExistingAuth() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');

        if (token && user) {
            this.token = token;
            this.currentUser = JSON.parse(user);
            // 如果已登录，重定向到主页面
            window.location.href = 'index.html';
        }
    }

    // 处理登录
    async handleLogin() {
        if (!this.validateLoginForm()) return;

        this.showLoading(true);

        const loginData = {
            email: this.loginEmail.value.trim(),
            password: this.loginPassword.value,
            rememberMe: document.getElementById('remember-me').checked
        };

        try {
            // 模拟API调用 - 实际项目中替换为真实的API
            const response = await this.mockAPI('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginData)
            });

            if (response.success) {
                this.handleAuthSuccess(response.user, response.token, loginData.rememberMe);
                this.showMessage('登录成功！正在跳转...', 'success');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showMessage(response.message || '登录失败，请检查邮箱和密码', 'error');
            }
        } catch (error) {
            this.showMessage('网络错误，请稍后重试', 'error');
            console.error('Login error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 处理注册
    async handleRegister() {
        if (!this.validateRegisterForm()) return;

        this.showLoading(true);

        const registerData = {
            username: this.registerUsername.value.trim(),
            email: this.registerEmail.value.trim(),
            password: this.registerPassword.value
        };

        try {
            // 模拟API调用 - 实际项目中替换为真实的API
            const response = await this.mockAPI('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(registerData)
            });

            if (response.success) {
                this.showMessage('注册成功！请登录', 'success');

                // 切换到登录表单
                setTimeout(() => {
                    switchToLogin();
                    this.loginEmail.value = registerData.email;
                }, 1500);
            } else {
                this.showMessage(response.message || '注册失败，请稍后重试', 'error');
            }
        } catch (error) {
            this.showMessage('网络错误，请稍后重试', 'error');
            console.error('Register error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 验证登录表单
    validateLoginForm() {
        let isValid = true;

        if (!this.validateEmail(this.loginEmail)) isValid = false;
        if (!this.validatePassword(this.loginPassword)) isValid = false;

        return isValid;
    }

    // 验证注册表单
    validateRegisterForm() {
        let isValid = true;

        if (!this.validateUsername(this.registerUsername)) isValid = false;
        if (!this.validateEmail(this.registerEmail)) isValid = false;
        if (!this.validatePassword(this.registerPassword)) isValid = false;
        if (!this.validatePasswordConfirm()) isValid = false;
        if (!this.validateTerms()) isValid = false;

        return isValid;
    }

    // 验证邮箱
    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorElement = document.getElementById(input.id + '-error');

        if (!email) {
            this.showError(input, errorElement, '请输入邮箱地址');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showError(input, errorElement, '请输入有效的邮箱地址');
            return false;
        }

        this.showSuccess(input, errorElement);
        return true;
    }

    // 验证用户名
    validateUsername(input) {
        const username = input.value.trim();
        const errorElement = document.getElementById(input.id + '-error');

        if (!username) {
            this.showError(input, errorElement, '请输入用户名');
            return false;
        }

        if (username.length < 2 || username.length > 20) {
            this.showError(input, errorElement, '用户名长度应在2-20个字符之间');
            return false;
        }

        if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(username)) {
            this.showError(input, errorElement, '用户名只能包含中文、字母、数字和下划线');
            return false;
        }

        this.showSuccess(input, errorElement);
        return true;
    }

    // 验证密码
    validatePassword(input) {
        const password = input.value;
        const errorElement = document.getElementById(input.id + '-error');

        if (!password) {
            this.showError(input, errorElement, '请输入密码');
            return false;
        }

        if (password.length < 6) {
            this.showError(input, errorElement, '密码长度至少为6位');
            return false;
        }

        // 可以添加更多密码强度验证
        // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        //     this.showError(input, errorElement, '密码应包含大小写字母和数字');
        //     return false;
        // }

        this.showSuccess(input, errorElement);
        return true;
    }

    // 验证确认密码
    validatePasswordConfirm() {
        const password = this.registerPassword.value;
        const confirmPassword = this.registerConfirmPassword.value;
        const errorElement = document.getElementById('register-confirm-password-error');

        if (!confirmPassword) {
            this.showError(this.registerConfirmPassword, errorElement, '请确认密码');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError(this.registerConfirmPassword, errorElement, '两次输入的密码不一致');
            return false;
        }

        this.showSuccess(this.registerConfirmPassword, errorElement);
        return true;
    }

    // 验证服务条款
    validateTerms() {
        const agreeTerms = document.getElementById('agree-terms');
        if (!agreeTerms.checked) {
            this.showMessage('请阅读并同意服务条款和隐私政策', 'error');
            return false;
        }
        return true;
    }

    // 显示输入错误
    showError(input, errorElement, message) {
        input.classList.remove('success');
        input.classList.add('error');
        errorElement.textContent = message;
    }

    // 显示输入成功
    showSuccess(input, errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.textContent = '';
    }

    // 处理认证成功
    handleAuthSuccess(user, token, rememberMe) {
        this.currentUser = user;
        this.token = token;

        // 存储认证信息
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));

        // 如果选择记住我，存储更长时间
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
    }

    // 显示/隐藏加载状态
    showLoading(show) {
        this.loading.style.display = show ? 'flex' : 'none';
    }

    // 显示消息
    showMessage(text, type = 'info') {
        this.messageText.textContent = text;
        this.message.className = `message ${type}`;
        this.message.style.display = 'block';

        // 自动隐藏消息
        setTimeout(() => {
            this.hideMessage();
        }, 5000);
    }

    // 隐藏消息
    hideMessage() {
        this.message.style.display = 'none';
    }

    // 模拟API调用（实际项目中替换为真实API）
    async mockAPI(endpoint, options) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 模拟不同的API响应
        if (endpoint === '/api/auth/login') {
            const body = JSON.parse(options.body);

            // 模拟用户数据库
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === body.email);

            if (user && user.password === body.password) {
                return {
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar || null
                    },
                    token: 'mock_token_' + Date.now()
                };
            } else {
                return {
                    success: false,
                    message: '邮箱或密码错误'
                };
            }
        }

        if (endpoint === '/api/auth/register') {
            const body = JSON.parse(options.body);

            // 检查邮箱是否已存在
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = users.find(u => u.email === body.email);

            if (existingUser) {
                return {
                    success: false,
                    message: '该邮箱已被注册'
                };
            }

            // 创建新用户
            const newUser = {
                id: 'user_' + Date.now(),
                username: body.username,
                email: body.email,
                password: body.password, // 实际项目中应该加密存储
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            return {
                success: true,
                message: '注册成功'
            };
        }

        return {
            success: false,
            message: '未知操作'
        };
    }

    // 登出
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        this.currentUser = null;
        this.token = null;
        window.location.href = 'login.html';
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否已登录
    isAuthenticated() {
        return !!this.token;
    }
}

// 切换到注册表单
function switchToRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// 切换到登录表单
function switchToLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// 切换密码显示/隐藏
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// 第三方登录
function socialLogin(provider) {
    // 显示加载状态
    document.getElementById('loading').style.display = 'flex';

    // 模拟第三方登录
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';

        // 这里应该跳转到相应的第三方认证页面
        // 实际项目中需要集成OAuth流程
        alert(`${provider} 登录功能需要后端API支持，请参考部署指南完成配置`);
    }, 1500);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});