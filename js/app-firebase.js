// Firebase 版本笔记应用主类
if (typeof FirebaseNoteApp === 'undefined') {
    class FirebaseNoteApp {
    constructor() {
        this.storage = createStorageManager();
        this.currentNoteId = null;
        this.autoSaveTimer = null;
        this.isModified = false;
        this.currentUser = null;
        this.isDropdownOpen = false;

        this.initElements();
        this.bindEvents();
        this.initializeApp();
    }

    // 初始化DOM元素
    initElements() {
        // 按钮元素
        this.newNoteBtn = document.getElementById('new-note-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.deleteBtn = document.getElementById('delete-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.importBtn = document.getElementById('import-btn');
        this.syncBtn = document.getElementById('sync-btn');
        this.loginBtn = document.getElementById('login-btn');
        this.userBtn = document.getElementById('user-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.toggleSyncBtn = document.getElementById('toggle-sync-btn');

        // 输入元素
        this.searchInput = document.getElementById('search-input');
        this.noteTitleInput = document.getElementById('note-title');
        this.noteContentTextarea = document.getElementById('note-content');

        // 显示元素
        this.notesList = document.getElementById('notes-list');
        this.wordCount = document.getElementById('word-count');
        this.notesCount = document.getElementById('notes-count');
        this.saveStatus = document.getElementById('save-status');
        this.syncStatus = document.getElementById('sync-status');
        this.syncText = document.getElementById('sync-text');
        this.userName = document.getElementById('user-name');
        this.userEmail = document.getElementById('user-email');
        this.syncMode = document.getElementById('sync-mode');
        this.userDropdown = document.getElementById('user-dropdown');

        // 模态框元素
        this.deleteModal = document.getElementById('delete-modal');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');
        this.importFileInput = document.getElementById('import-file-input');
    }

    // 绑定事件
    bindEvents() {
        console.log('🔧 绑定事件监听器...');

        // 按钮事件
        if (this.newNoteBtn) {
            this.newNoteBtn.addEventListener('click', () => this.createNewNote());
            console.log('✅ 新建笔记按钮已绑定');
        }
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.saveCurrentNote());
            console.log('✅ 保存按钮已绑定');
        }
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => this.showDeleteConfirm());
            console.log('✅ 删除按钮已绑定');
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportNotes());
            console.log('✅ 导出按钮已绑定');
        }
        if (this.importBtn) {
            this.importBtn.addEventListener('click', () => this.importNotes());
            console.log('✅ 导入按钮已绑定');
        }
        if (this.syncBtn) {
            this.syncBtn.addEventListener('click', () => this.manualSync());
            console.log('✅ 同步按钮已绑定');
        }
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.goToLogin());
            console.log('✅ 登录按钮已绑定');
        } else {
            console.error('❌ 登录按钮未找到');
        }
        if (this.userBtn) {
            this.userBtn.addEventListener('click', () => this.toggleUserDropdown());
            console.log('✅ 用户按钮已绑定');
        }
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
            console.log('✅ 登出按钮已绑定');
        }
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.openSettings());
            console.log('✅ 设置按钮已绑定');
        }
        if (this.toggleSyncBtn) {
            this.toggleSyncBtn.addEventListener('click', () => this.toggleSyncMode());
            console.log('✅ 切换同步按钮已绑定');
        }

        // 搜索事件
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.searchNotes(e.target.value));
        }

        // 编辑器事件
        if (this.noteTitleInput) {
            this.noteTitleInput.addEventListener('input', () => this.onContentChange());
        }
        if (this.noteContentTextarea) {
            this.noteContentTextarea.addEventListener('input', () => this.onContentChange());
        }

        // 模态框事件
        if (this.cancelDeleteBtn) {
            this.cancelDeleteBtn.addEventListener('click', () => this.hideDeleteConfirm());
        }
        if (this.confirmDeleteBtn) {
            this.confirmDeleteBtn.addEventListener('click', () => this.deleteCurrentNote());
        }
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // 页面关闭前保存
        window.addEventListener('beforeunload', () => {
            if (this.isModified) {
                this.saveCurrentNote();
            }
        });
    }

    // 初始化应用
    async initializeApp() {
        // 检查用户登录状态
        await this.checkAuthState();

        // 更新用户界面
        this.updateUserInterface();

        // 加载笔记
        await this.loadNotes();

        // 启动自动保存
        this.startAutoSave();

        console.log('Firebase 笔记应用初始化完成');
    }

    // 检查认证状态
    async checkAuthState() {
        return new Promise((resolve) => {
            const unsubscribe = window.FirebaseUtils.auth.onAuthStateChanged(async (user) => {
                unsubscribe();

                if (user) {
                    this.currentUser = this.storage.getCurrentUser();
                    console.log('用户已登录:', this.currentUser.email);

                    // 更新同步状态
                    this.updateSyncStatus();
                } else {
                    console.log('用户未登录');
                    this.currentUser = null;
                }

                resolve();
            });
        });
    }

    // 用户登录回调
    onUserLogin(user) {
        this.currentUser = this.storage.getCurrentUser();
        this.updateUserInterface();
        this.updateSyncStatus();
        this.loadNotes();
        this.showAppMessage('登录成功！', 'success');
    }

    // 用户登出回调
    onUserLogout() {
        this.currentUser = null;
        this.updateUserInterface();
        this.updateSyncStatus();
        this.loadNotes();
    }

    // 笔记更新回调（Firebase 实时更新）
    onNotesUpdated(notes) {
        this.notes = notes;
        this.renderNotesList(notes);
        this.updateNotesCount();

        // 如果当前编辑的笔记被删除，清空编辑器
        if (this.currentNoteId && !notes.find(note => note.id === this.currentNoteId)) {
            this.clearEditor();
        }
    }

    // 加载笔记列表
    async loadNotes() {
        try {
            const notes = this.storage.getAllNotes();
            this.notes = notes;
            this.renderNotesList(notes);
            this.updateNotesCount();

            // 如果有笔记，默认选中第一条
            if (notes.length > 0) {
                this.selectNote(notes[0].id);
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('加载笔记失败:', error);
            this.showAppMessage('加载笔记失败: ' + error.message, 'error');
        }
    }

    // 渲染笔记列表
    renderNotesList(notes) {
        if (!this.notesList) return;

        if (notes.length === 0) {
            this.showEmptyState();
            return;
        }

        this.notesList.innerHTML = notes.map(note => {
            // 处理 Firebase 时间戳
            const updatedAt = note.updatedAt && note.updatedAt.toDate ?
                note.updatedAt.toDate().toISOString() :
                note.updatedAt;

            return `
                <div class="note-item ${note.id === this.currentNoteId ? 'active' : ''}"
                     data-id="${note.id}">
                    <div class="note-item-title">${this.escapeHtml(note.title)}</div>
                    <div class="note-item-preview">${this.escapeHtml((note.content || '').substring(0, 100))}</div>
                    <div class="note-item-date">${this.formatDate(updatedAt)}</div>
                </div>
            `;
        }).join('');

        // 绑定笔记项点击事件
        document.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = item.dataset.id;
                this.selectNote(noteId);
            });
        });
    }

    // 显示空状态
    showEmptyState() {
        if (!this.notesList) return;

        this.notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>还没有笔记</h3>
                <p>点击"新建笔记"开始创建你的第一条笔记</p>
            </div>
        `;
    }

    // 创建新笔记
    async createNewNote() {
        if (this.isModified) {
            await this.saveCurrentNote();
        }

        try {
            const newNote = await this.storage.createNote();
            this.showAppMessage('笔记创建成功', 'success');

            // 重新加载笔记列表
            await this.loadNotes();
            this.selectNote(newNote.id);

            // 聚焦到标题输入框
            if (this.noteTitleInput) {
                this.noteTitleInput.focus();
                this.noteTitleInput.select();
            }
        } catch (error) {
            console.error('创建笔记失败:', error);
            this.showAppMessage('创建笔记失败: ' + error.message, 'error');
        }
    }

    // 选择笔记
    async selectNote(noteId) {
        if (this.isModified && this.currentNoteId !== noteId) {
            await this.saveCurrentNote();
        }

        this.currentNoteId = noteId;
        const note = this.storage.getNoteById(noteId);

        if (note) {
            if (this.noteTitleInput) {
                this.noteTitleInput.value = note.title || '';
            }
            if (this.noteContentTextarea) {
                this.noteContentTextarea.value = note.content || '';
            }
            this.updateWordCount();
            this.isModified = false;
            this.updateSaveStatus('已保存');

            // 更新列表中的选中状态
            document.querySelectorAll('.note-item').forEach(item => {
                item.classList.toggle('active', item.dataset.id === noteId);
            });
        }
    }

    // 保存当前笔记
    async saveCurrentNote() {
        if (!this.currentNoteId) return;

        const title = this.noteTitleInput ? this.noteTitleInput.value.trim() : '';
        const content = this.noteContentTextarea ? this.noteContentTextarea.value : '';

        try {
            await this.storage.updateNote(this.currentNoteId, { title, content });
            this.isModified = false;
            this.updateSaveStatus('已保存');

            // Firebase 实时同步会自动更新列表，但为了保险起见
            if (!(this.storage instanceof FirebaseStorageManager)) {
                await this.loadNotes();
            }
        } catch (error) {
            console.error('保存笔记失败:', error);
            this.showAppMessage('保存失败: ' + error.message, 'error');
        }
    }

    // 删除当前笔记
    async deleteCurrentNote() {
        if (!this.currentNoteId) return;

        try {
            await this.storage.deleteNote(this.currentNoteId);
            this.hideDeleteConfirm();
            this.currentNoteId = null;
            this.clearEditor();
            this.showAppMessage('笔记删除成功', 'success');
        } catch (error) {
            console.error('删除笔记失败:', error);
            this.showAppMessage('删除失败: ' + error.message, 'error');
        }
    }

    // 搜索笔记
    async searchNotes(query) {
        if (!query.trim()) {
            await this.loadNotes();
            return;
        }

        try {
            const filteredNotes = this.storage.searchNotes(query);
            this.renderNotesList(filteredNotes);
        } catch (error) {
            console.error('搜索失败:', error);
        }
    }

    // 导出笔记
    async exportNotes() {
        try {
            await this.storage.exportNotes();
            this.showAppMessage('笔记导出成功', 'success');
        } catch (error) {
            console.error('导出失败:', error);
            this.showAppMessage('导出失败: ' + error.message, 'error');
        }
    }

    // 导入笔记
    importNotes() {
        if (this.importFileInput) {
            this.importFileInput.click();
        }
    }

    // 处理文件导入
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const notesData = JSON.parse(e.target.result);
                    const result = await this.storage.importNotes(notesData);

                    if (result.success) {
                        this.showAppMessage(`成功导入 ${result.imported} 条笔记`, 'success');
                        await this.loadNotes();
                    } else {
                        this.showAppMessage('导入失败：' + result.error, 'error');
                    }
                } catch (error) {
                    this.showAppMessage('导入失败：文件格式不正确', 'error');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            this.showAppMessage('读取文件失败', 'error');
        }

        // 清空文件输入
        if (this.importFileInput) {
            this.importFileInput.value = '';
        }
    }

    // 内容变化处理
    onContentChange() {
        this.isModified = true;
        this.updateWordCount();
        this.updateSaveStatus('编辑中...');
        this.resetAutoSaveTimer();
    }

    // 更新字数统计
    updateWordCount() {
        if (!this.wordCount || !this.noteContentTextarea) return;

        const content = this.noteContentTextarea.value;
        const wordCount = content.length;
        this.wordCount.textContent = `${wordCount} 字`;
    }

    // 更新笔记数量统计
    updateNotesCount() {
        if (!this.notesCount) return;

        const stats = this.storage.getStats();
        this.notesCount.textContent = `共 ${stats.totalNotes} 条笔记`;
    }

    // 更新保存状态
    updateSaveStatus(status) {
        if (!this.saveStatus) return;

        this.saveStatus.textContent = status;
        this.saveStatus.className = 'save-status';

        if (status === '编辑中...') {
            this.saveStatus.classList.add('saving');
        }
    }

    // 自动保存
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(async () => {
            if (this.isModified) {
                await this.saveCurrentNote();
            }
        }, 5000); // 每5秒自动保存
    }

    // 重置自动保存计时器
    resetAutoSaveTimer() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        this.startAutoSave();
    }

    // 显示删除确认框
    showDeleteConfirm() {
        if (!this.currentNoteId) return;
        if (this.deleteModal) {
            this.deleteModal.style.display = 'block';
        }
    }

    // 隐藏删除确认框
    hideDeleteConfirm() {
        if (this.deleteModal) {
            this.deleteModal.style.display = 'none';
        }
    }

    // 清空编辑器
    clearEditor() {
        if (this.noteTitleInput) {
            this.noteTitleInput.value = '';
        }
        if (this.noteContentTextarea) {
            this.noteContentTextarea.value = '';
        }
        this.updateWordCount();
        this.isModified = false;
        this.updateSaveStatus('已保存');
    }

    // 更新用户界面
    updateUserInterface() {
        if (this.currentUser) {
            // 显示用户界面
            if (this.loginBtn) this.loginBtn.style.display = 'none';
            if (this.userBtn) this.userBtn.style.display = 'flex';
            if (this.userName) this.userName.textContent = this.currentUser.username || this.currentUser.email.split('@')[0];
            if (this.userEmail) this.userEmail.textContent = this.currentUser.email;

            // 如果是云端存储，显示同步按钮
            if (this.storage instanceof FirebaseStorageManager && this.syncBtn) {
                this.syncBtn.style.display = 'inline-flex';
            }
        } else {
            // 显示登录界面
            if (this.loginBtn) this.loginBtn.style.display = 'inline-flex';
            if (this.userBtn) this.userBtn.style.display = 'none';
            if (this.syncBtn) this.syncBtn.style.display = 'none';
        }
    }

    // 更新同步状态
    updateSyncStatus() {
        if (!this.syncText || !this.syncMode) return;

        const syncStatus = this.storage.getSyncStatus();
        this.syncText.textContent = syncStatus.syncMode;

        if (syncStatus.enabled) {
            if (this.syncStatus) {
                this.syncStatus.classList.add('syncing');
            }
            this.syncMode.textContent = '云端同步';
        } else {
            if (this.syncStatus) {
                this.syncStatus.classList.remove('syncing');
            }
            this.syncMode.textContent = '本地存储';
        }
    }

    // 跳转到登录页面
    goToLogin() {
        console.log('🔗 跳转到登录页面');
        window.location.href = 'login.html';
    }

    // 切换用户下拉菜单
    toggleUserDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
        if (this.userDropdown) {
            this.userDropdown.style.display = this.isDropdownOpen ? 'block' : 'none';
        }
    }

    // 处理外部点击
    handleOutsideClick(event) {
        if (this.isDropdownOpen && this.userBtn && this.userDropdown &&
            !this.userBtn.contains(event.target) && !this.userDropdown.contains(event.target)) {
            this.isDropdownOpen = false;
            this.userDropdown.style.display = 'none';
        }
    }

    // 登出
    async logout() {
        if (confirm('确定要退出登录吗？未保存的更改将会丢失。')) {
            try {
                await window.FirebaseUtils.auth.signOut();
                this.showAppMessage('已退出登录', 'success');

                // 关闭下拉菜单
                this.isDropdownOpen = false;
                if (this.userDropdown) {
                    this.userDropdown.style.display = 'none';
                }
            } catch (error) {
                console.error('登出失败:', error);
                this.showAppMessage('登出失败', 'error');
            }
        }
    }

    // 打开设置
    openSettings() {
        this.showAppMessage('设置功能正在开发中...', 'warning');
        this.isDropdownOpen = false;
        if (this.userDropdown) {
            this.userDropdown.style.display = 'none';
        }
    }

    // 切换同步模式
    async toggleSyncMode() {
        if (!this.currentUser) {
            this.showAppMessage('请先登录', 'error');
            return;
        }

        const result = this.storage.toggleSyncMode();

        if (result.success) {
            this.updateSyncStatus();
            this.showAppMessage(`已切换到${result.mode}`, 'success');

            // 如果切换到云端同步，需要重新加载笔记
            if (result.mode === '云端同步') {
                await this.loadNotes();
            }
        } else {
            this.showAppMessage(result.message, 'error');
        }

        this.isDropdownOpen = false;
        if (this.userDropdown) {
            this.userDropdown.style.display = 'none';
        }
    }

    // 手动同步
    async manualSync() {
        if (!(this.storage instanceof FirebaseStorageManager)) {
            this.showAppMessage('当前为本地存储模式', 'warning');
            return;
        }

        if (!this.syncBtn) return;

        this.syncBtn.disabled = true;
        this.syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 同步中...';

        try {
            const result = await this.storage.manualSync();

            if (result.success) {
                this.showAppMessage(result.message, 'success');
                await this.loadNotes();
                this.updateSyncStatus();
            } else {
                this.showAppMessage(result.message, 'error');
            }
        } catch (error) {
            this.showAppMessage('同步失败: ' + error.message, 'error');
        } finally {
            if (this.syncBtn) {
                this.syncBtn.disabled = false;
                this.syncBtn.innerHTML = '<i class="fas fa-sync"></i> 同步';
            }
        }
    }

    // 显示应用消息
    showAppMessage(text, type = 'info') {
        const appMessage = document.getElementById('app-message');
        const messageText = document.getElementById('app-message-text');

        if (!appMessage || !messageText) return;

        messageText.textContent = text;
        appMessage.className = `app-message ${type}`;
        appMessage.style.display = 'block';

        // 自动隐藏消息
        setTimeout(() => {
            this.hideAppMessage();
        }, 5000);
    }

    // 隐藏应用消息
    hideAppMessage() {
        const appMessage = document.getElementById('app-message');
        if (appMessage) {
            appMessage.style.display = 'none';
        }
    }

    // 处理键盘快捷键
    handleKeyboardShortcuts(event) {
        // Ctrl+N: 新建笔记
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            this.createNewNote();
        }

        // Ctrl+S: 保存笔记
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveCurrentNote();
        }

        // Ctrl+D: 删除笔记
        if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            this.showDeleteConfirm();
        }

        // Ctrl+F: 聚焦搜索框
        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            if (this.searchInput) {
                this.searchInput.focus();
            }
        }

        // Esc: 关闭模态框
        if (event.key === 'Escape') {
            this.hideDeleteConfirm();
        }
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return '今天 ' + date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return diffDays + '天前';
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    // HTML转义
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 全局函数：隐藏应用消息
function hideAppMessage() {
    if (window.noteApp) {
        window.noteApp.hideAppMessage();
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 开始初始化 Firebase 笔记应用...');
    console.log('📝 DOM 加载完成');

    // 等待 Firebase 配置加载完成，最多等待5秒
    let attempts = 0;
    const maxAttempts = 50; // 5秒，每100ms检查一次

    const checkFirebaseReady = () => {
        attempts++;

        if (window.FirebaseUtils && window.FirebaseUtils.auth) {
            console.log('✅ Firebase Utils 已加载');
            console.log('🔥 Firebase 项目:', window.FirebaseUtils.db.app.options.projectId);

            try {
                window.noteApp = new FirebaseNoteApp();
                console.log('🎉 笔记应用初始化完成');
            } catch (error) {
                console.error('❌ 应用初始化失败:', error);
                showErrorToUser('应用初始化失败: ' + error.message);
            }
        } else if (attempts < maxAttempts) {
            console.log(`⏳ 等待 Firebase 配置加载... (${attempts}/${maxAttempts})`);
            setTimeout(checkFirebaseReady, 100);
        } else {
            console.error('❌ Firebase 配置加载超时');
            console.log('📋 可能的原因:');
            console.log('  1. Firebase SDK 未正确加载');
            console.log('  2. 网络连接问题');
            console.log('  3. Firebase 配置文件错误');

            showErrorToUser('Firebase 配置加载失败，请刷新页面重试');
        }
    };

    // 开始检查
    setTimeout(checkFirebaseReady, 100);
});

// 显示错误给用户
function showErrorToUser(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f8d7da;
        color: #721c24;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
        z-index: 9999;
        text-align: center;
        max-width: 400px;
    `;
    errorDiv.innerHTML = `
        <h3>⚠️ 加载错误</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            background: #721c24;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        ">刷新页面</button>
    `;
    document.body.appendChild(errorDiv);
}
} // 结束防止重复声明