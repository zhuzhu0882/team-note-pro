// 笔记应用主类
class NoteApp {
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
        // 按钮事件
        this.newNoteBtn.addEventListener('click', () => this.createNewNote());
        this.saveBtn.addEventListener('click', () => this.saveCurrentNote());
        this.deleteBtn.addEventListener('click', () => this.showDeleteConfirm());
        this.exportBtn.addEventListener('click', () => this.exportNotes());
        this.importBtn.addEventListener('click', () => this.importNotes());
        this.syncBtn.addEventListener('click', () => this.manualSync());
        this.loginBtn.addEventListener('click', () => this.goToLogin());
        this.userBtn.addEventListener('click', () => this.toggleUserDropdown());
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.toggleSyncBtn.addEventListener('click', () => this.toggleSyncMode());

        // 搜索事件
        this.searchInput.addEventListener('input', (e) => this.searchNotes(e.target.value));

        // 编辑器事件
        this.noteTitleInput.addEventListener('input', () => this.onContentChange());
        this.noteContentTextarea.addEventListener('input', () => this.onContentChange());

        // 模态框事件
        this.cancelDeleteBtn.addEventListener('click', () => this.hideDeleteConfirm());
        this.confirmDeleteBtn.addEventListener('click', () => this.deleteCurrentNote());
        this.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));

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

    // 加载笔记列表
    loadNotes() {
        const notes = this.storage.getAllNotes();
        this.renderNotesList(notes);
        this.updateNotesCount();

        // 如果有笔记，默认选中第一条
        if (notes.length > 0) {
            this.selectNote(notes[0].id);
        } else {
            this.showEmptyState();
        }
    }

    // 渲染笔记列表
    renderNotesList(notes) {
        if (notes.length === 0) {
            this.showEmptyState();
            return;
        }

        this.notesList.innerHTML = notes.map(note => `
            <div class="note-item ${note.id === this.currentNoteId ? 'active' : ''}"
                 data-id="${note.id}">
                <div class="note-item-title">${this.escapeHtml(note.title)}</div>
                <div class="note-item-preview">${this.escapeHtml(note.content.substring(0, 100))}</div>
                <div class="note-item-date">${this.formatDate(note.updatedAt)}</div>
            </div>
        `).join('');

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
        this.notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>还没有笔记</h3>
                <p>点击"新建笔记"开始创建你的第一条笔记</p>
            </div>
        `;
    }

    // 创建新笔记
    createNewNote() {
        // 如果当前有修改的内容，先保存
        if (this.isModified) {
            this.saveCurrentNote();
        }

        const newNote = this.storage.createNote();
        this.loadNotes();
        this.selectNote(newNote.id);

        // 聚焦到标题输入框
        this.noteTitleInput.focus();
        this.noteTitleInput.select();
    }

    // 选择笔记
    selectNote(noteId) {
        // 如果当前有修改的内容，先保存
        if (this.isModified && this.currentNoteId !== noteId) {
            this.saveCurrentNote();
        }

        this.currentNoteId = noteId;
        const note = this.storage.getNoteById(noteId);

        if (note) {
            this.noteTitleInput.value = note.title;
            this.noteContentTextarea.value = note.content;
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
    saveCurrentNote() {
        if (!this.currentNoteId) return;

        const title = this.noteTitleInput.value.trim() || '无标题笔记';
        const content = this.noteContentTextarea.value;

        this.storage.updateNote(this.currentNoteId, { title, content });
        this.isModified = false;
        this.updateSaveStatus('已保存');
        this.loadNotes(); // 重新加载列表以更新预览
    }

    // 删除当前笔记
    deleteCurrentNote() {
        if (!this.currentNoteId) return;

        this.storage.deleteNote(this.currentNoteId);
        this.hideDeleteConfirm();
        this.currentNoteId = null;
        this.loadNotes();
    }

    // 搜索笔记
    searchNotes(query) {
        if (!query.trim()) {
            this.loadNotes();
            return;
        }

        const filteredNotes = this.storage.searchNotes(query);
        this.renderNotesList(filteredNotes);
    }

    // 导出笔记
    exportNotes() {
        this.storage.exportNotes();
    }

    // 导入笔记
    importNotes() {
        this.importFileInput.click();
    }

    // 处理文件导入
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const notesData = JSON.parse(e.target.result);
                const result = this.storage.importNotes(notesData);

                if (result.success) {
                    alert(`成功导入 ${result.imported} 条笔记${result.skipped > 0 ? `，跳过 ${result.skipped} 条重复笔记` : ''}`);
                    this.loadNotes();
                } else {
                    alert('导入失败：' + result.error);
                }
            } catch (error) {
                alert('导入失败：文件格式不正确');
            }
        };
        reader.readAsText(file);

        // 清空文件输入
        this.importFileInput.value = '';
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
        const content = this.noteContentTextarea.value;
        const wordCount = content.length;
        this.wordCount.textContent = `${wordCount} 字`;
    }

    // 更新笔记数量统计
    updateNotesCount() {
        const stats = this.storage.getStats();
        this.notesCount.textContent = `共 ${stats.totalNotes} 条笔记`;
    }

    // 更新保存状态
    updateSaveStatus(status) {
        this.saveStatus.textContent = status;
        this.saveStatus.className = 'save-status';

        if (status === '编辑中...') {
            this.saveStatus.classList.add('saving');
        }
    }

    // 自动保存
    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            if (this.isModified) {
                this.saveCurrentNote();
            }
        }, 3000); // 每3秒自动保存
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
        this.deleteModal.style.display = 'block';
    }

    // 隐藏删除确认框
    hideDeleteConfirm() {
        this.deleteModal.style.display = 'none';
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
            this.searchInput.focus();
        }

        // Esc: 关闭模态框
        if (event.key === 'Escape') {
            this.hideDeleteConfirm();
        }
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
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
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 初始化应用
    async initializeApp() {
        // 检查用户登录状态
        this.currentUser = this.storage.getCurrentUser();

        if (this.currentUser) {
            this.updateUserInterface();
            // 初始化云端同步
            if (this.storage instanceof CloudStorageManager) {
                await this.storage.initializeSync();
                this.updateSyncStatus();
            }
        } else {
            this.updateUserInterface();
        }

        // 加载笔记
        this.loadNotes();
        this.startAutoSave();
    }

    // 更新用户界面
    updateUserInterface() {
        if (this.currentUser) {
            // 显示用户界面
            this.loginBtn.style.display = 'none';
            this.userBtn.style.display = 'flex';
            this.userName.textContent = this.currentUser.username || this.currentUser.email.split('@')[0];
            this.userEmail.textContent = this.currentUser.email;

            // 如果是云端存储，显示同步按钮
            if (this.storage instanceof CloudStorageManager) {
                this.syncBtn.style.display = 'inline-flex';
            }
        } else {
            // 显示登录界面
            this.loginBtn.style.display = 'inline-flex';
            this.userBtn.style.display = 'none';
            this.syncBtn.style.display = 'none';
        }
    }

    // 更新同步状态
    updateSyncStatus() {
        const syncStatus = this.storage.getSyncStatus();

        this.syncText.textContent = syncStatus.syncMode;

        if (syncStatus.enabled) {
            this.syncStatus.classList.add('syncing');
            this.syncMode.textContent = '云端同步';
        } else {
            this.syncStatus.classList.remove('syncing');
            this.syncMode.textContent = '本地存储';
        }

        // 如果有最后同步时间，显示在提示中
        if (syncStatus.lastSyncTime) {
            const lastSync = new Date(syncStatus.lastSyncTime);
            this.showAppMessage(`最后同步: ${lastSync.toLocaleString('zh-CN')}`, 'info');
        }
    }

    // 跳转到登录页面
    goToLogin() {
        window.location.href = 'login.html';
    }

    // 切换用户下拉菜单
    toggleUserDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
        this.userDropdown.style.display = this.isDropdownOpen ? 'block' : 'none';
    }

    // 处理外部点击
    handleOutsideClick(event) {
        if (this.isDropdownOpen && !this.userBtn.contains(event.target) && !this.userDropdown.contains(event.target)) {
            this.isDropdownOpen = false;
            this.userDropdown.style.display = 'none';
        }
    }

    // 登出
    logout() {
        if (confirm('确定要退出登录吗？未保存的更改将会丢失。')) {
            this.storage.logout();
            this.currentUser = null;
            this.updateUserInterface();
            this.updateSyncStatus();

            // 重新初始化存储管理器
            this.storage = createStorageManager();
            this.loadNotes();

            this.showAppMessage('已退出登录', 'success');

            // 关闭下拉菜单
            this.isDropdownOpen = false;
            this.userDropdown.style.display = 'none';
        }
    }

    // 打开设置
    openSettings() {
        this.showAppMessage('设置功能正在开发中...', 'warning');
        this.isDropdownOpen = false;
        this.userDropdown.style.display = 'none';
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
                await this.storage.initializeSync();
                this.loadNotes();
            }
        } else {
            this.showAppMessage(result.message, 'error');
        }

        this.isDropdownOpen = false;
        this.userDropdown.style.display = 'none';
    }

    // 手动同步
    async manualSync() {
        if (!(this.storage instanceof CloudStorageManager)) {
            this.showAppMessage('当前为本地存储模式', 'warning');
            return;
        }

        this.syncBtn.disabled = true;
        this.syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 同步中...';

        try {
            const result = await this.storage.manualSync();

            if (result.success) {
                this.showAppMessage(result.message, 'success');
                this.loadNotes(); // 重新加载笔记列表
                this.updateSyncStatus();
            } else {
                this.showAppMessage(result.message, 'error');
            }
        } catch (error) {
            this.showAppMessage('同步失败: ' + error.message, 'error');
        } finally {
            this.syncBtn.disabled = false;
            this.syncBtn.innerHTML = '<i class="fas fa-sync"></i> 同步';
        }
    }

    // 显示应用消息
    showAppMessage(text, type = 'info') {
        const appMessage = document.getElementById('app-message');
        const messageText = document.getElementById('app-message-text');

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
        appMessage.style.display = 'none';
    }

    // 重写文件导入处理，添加消息提示
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const notesData = JSON.parse(e.target.result);
                const result = this.storage.importNotes(notesData);

                if (result.success) {
                    this.showAppMessage(`成功导入 ${result.imported} 条笔记${result.skipped > 0 ? `，跳过 ${result.skipped} 条重复笔记` : ''}`, 'success');
                    this.loadNotes();
                } else {
                    this.showAppMessage('导入失败：' + result.error, 'error');
                }
            } catch (error) {
                this.showAppMessage('导入失败：文件格式不正确', 'error');
            }
        };
        reader.readAsText(file);

        // 清空文件输入
        this.importFileInput.value = '';
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
    window.noteApp = new NoteApp();
});