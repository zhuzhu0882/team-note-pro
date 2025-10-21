// Firebase 认证管理类
class FirebaseAuthManager {
    constructor() {
        this.auth = window.FirebaseUtils.auth;
        this.db = window.FirebaseUtils.db;
        this.currentUser = null;
        this.initElements();
        this.bindEvents();
        this.checkAuthState();
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
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 注册表单
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // 输入验证
        if (this.loginEmail) {
            this.loginEmail.addEventListener('blur', () => this.validateEmail(this.loginEmail));
        }
        if (this.loginPassword) {
            this.loginPassword.addEventListener('blur', () => this.validatePassword(this.loginPassword));
        }
        if (this.registerUsername) {
            this.registerUsername.addEventListener('blur', () => this.validateUsername(this.registerUsername));
        }
        if (this.registerEmail) {
            this.registerEmail.addEventListener('blur', () => this.validateEmail(this.registerEmail));
        }
        if (this.registerPassword) {
            this.registerPassword.addEventListener('blur', () => this.validatePassword(this.registerPassword));
        }
        if (this.registerConfirmPassword) {
            this.registerConfirmPassword.addEventListener('blur', () => this.validatePasswordConfirm());
        }

        // 实时验证
        if (this.registerPassword && this.registerConfirmPassword) {
            this.registerPassword.addEventListener('input', () => {
                if (this.registerConfirmPassword.value) {
                    this.validatePasswordConfirm();
                }
            });
        }
    }

    // 检查认证状态
    checkAuthState() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                // 用户已登录，重定向到主页面
                window.location.href = 'index.html';
            }
        });
    }

    // 处理登录
    async handleLogin() {
        if (!this.validateLoginForm()) return;

        this.showLoading(true);

        const email = this.loginEmail.value.trim();
        const password = this.loginPassword.value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            // 设置认证持久性
            const persistence = rememberMe ?
                firebase.auth.Auth.Persistence.LOCAL :
                firebase.auth.Auth.Persistence.SESSION;

            await this.auth.setPersistence(persistence);

            // 登录用户
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);

            // 获取用户信息
            const userDoc = await this.db.collection('users').doc(userCredential.user.uid).get();
            let userData = { uid: userCredential.user.uid, email: userCredential.user.email };

            if (userDoc.exists) {
                userData = { ...userData, ...userDoc.data() };
            }

            // 保存到本地存储
            localStorage.setItem('authToken', await userCredential.user.getIdToken());
            localStorage.setItem('currentUser', JSON.stringify(userData));

            this.showMessage('登录成功！正在跳转...', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('登录错误:', error);
            const errorMessage = window.FirebaseUtils.handleAuthError(error);
            this.showMessage(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 处理注册
    async handleRegister() {
        if (!this.validateRegisterForm()) return;

        this.showLoading(true);

        const username = this.registerUsername.value.trim();
        const email = this.registerEmail.value.trim();
        const password = this.registerPassword.value;

        try {
            // 创建用户账户
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 创建用户配置文件
            const userData = {
                uid: user.uid,
                username: username,
                email: email,
                displayName: username,
                photoURL: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {
                    theme: 'light',
                    language: 'zh-CN'
                }
            };

            // 保存用户信息到 Firestore
            await this.db.collection('users').doc(user.uid).set(userData);

            // 更新显示名称
            await user.updateProfile({ displayName: username });

            // 保存到本地存储
            localStorage.setItem('authToken', await user.getIdToken());
            localStorage.setItem('currentUser', JSON.stringify(userData));

            this.showMessage('注册成功！正在跳转...', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('注册错误:', error);
            const errorMessage = window.FirebaseUtils.handleAuthError(error);
            this.showMessage(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Google 登录
    async handleGoogleLogin() {
        this.showLoading(true);

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;

            // 检查是否是第一次登录
            const userDoc = await this.db.collection('users').doc(user.uid).get();

            if (!userDoc.exists) {
                // 创建新的用户配置文件
                const userData = {
                    uid: user.uid,
                    username: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    preferences: {
                        theme: 'light',
                        language: 'zh-CN'
                    }
                };

                await this.db.collection('users').doc(user.uid).set(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                // 更新最后登录时间
                await this.db.collection('users').doc(user.uid).update({
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                const userData = userDoc.data();
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }

            localStorage.setItem('authToken', await user.getIdToken());

            this.showMessage('登录成功！正在跳转...', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Google登录错误:', error);
            const errorMessage = window.FirebaseUtils.handleAuthError(error);
            this.showMessage(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 重置密码
    async handlePasswordReset(email) {
        if (!email) {
            this.showMessage('请输入邮箱地址', 'error');
            return;
        }

        try {
            await this.auth.sendPasswordResetEmail(email);
            this.showMessage('密码重置邮件已发送，请检查您的邮箱', 'success');
        } catch (error) {
            console.error('密码重置错误:', error);
            const errorMessage = window.FirebaseUtils.handleAuthError(error);
            this.showMessage(errorMessage, 'error');
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
        if (errorElement) errorElement.textContent = message;
    }

    // 显示输入成功
    showSuccess(input, errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        if (errorElement) errorElement.textContent = '';
    }

    // 显示/隐藏加载状态
    showLoading(show) {
        if (this.loading) {
            this.loading.style.display = show ? 'flex' : 'none';
        }
    }

    // 显示消息
    showMessage(text, type = 'info') {
        if (this.message) {
            this.messageText.textContent = text;
            this.message.className = `message ${type}`;
            this.message.style.display = 'block';

            // 自动隐藏消息
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }

    // 隐藏消息
    hideMessage() {
        if (this.message) {
            this.message.style.display = 'none';
        }
    }

    // 登出
    async logout() {
        try {
            await this.auth.signOut();
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('登出错误:', error);
        }
    }
}

// 全局函数
function switchToRegister() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm && registerForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function switchToLogin() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm && registerForm) {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}

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

function socialLogin(provider) {
    if (provider === 'google') {
        window.firebaseAuthManager.handleGoogleLogin();
    } else {
        document.getElementById('loading').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            alert(`${provider} 登录功能正在开发中...`);
        }, 1500);
    }
}

function hideMessage() {
    if (window.firebaseAuthManager) {
        window.firebaseAuthManager.hideMessage();
    }
}

// 处理忘记密码
function handleForgotPassword() {
    const email = document.getElementById('login-email').value.trim();
    if (window.firebaseAuthManager) {
        window.firebaseAuthManager.handlePasswordReset(email);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.firebaseAuthManager = new FirebaseAuthManager();

    // 添加忘记密码事件监听
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleForgotPassword();
        });
    }
});