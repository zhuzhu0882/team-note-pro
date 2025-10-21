// 云端存储管理类
class CloudStorageManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.token = this.getToken();
        this.storageKey = 'notes';
        this.notes = [];
        this.syncEnabled = false;
        this.lastSyncTime = null;
        this.syncInterval = null;
    }

    // 从LocalStorage加载笔记
    loadNotes() {
        try {
            const storedNotes = localStorage.getItem(this.storageKey);
            return storedNotes ? JSON.parse(storedNotes) : [];
        } catch (error) {
            console.error('加载笔记失败:', error);
            return [];
        }
    }

    // 保存笔记到LocalStorage
    saveNotes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
            return true;
        } catch (error) {
            console.error('保存笔记失败:', error);
            return false;
        }
    }

    // 获取所有笔记
    getAllNotes() {
        return [...this.notes];
    }

    // 根据ID获取笔记
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    // 创建新笔记
    createNote(title = '', content = '') {
        const newNote = {
            id: this.generateId(),
            title: title || '无标题笔记',
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            category: '默认分类'
        };

        this.notes.unshift(newNote);
        this.saveNotes();
        return newNote;
    }

    // 更新笔记
    updateNote(id, updates) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex] = {
                ...this.notes[noteIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveNotes();
            return this.notes[noteIndex];
        }
        return null;
    }

    // 删除笔记
    deleteNote(id) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            const deletedNote = this.notes.splice(noteIndex, 1)[0];
            this.saveNotes();
            return deletedNote;
        }
        return null;
    }

    // 搜索笔记
    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // 导出笔记数据
    exportNotes() {
        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // 导入笔记数据
    importNotes(notesData) {
        try {
            // 验证数据格式
            if (!Array.isArray(notesData)) {
                throw new Error('导入数据格式不正确');
            }

            // 验证每条笔记的必需字段
            const validNotes = notesData.filter(note =>
                note.id &&
                typeof note.title === 'string' &&
                typeof note.content === 'string'
            );

            if (validNotes.length === 0) {
                throw new Error('没有有效的笔记数据');
            }

            // 合并导入的笔记，避免重复ID
            const existingIds = new Set(this.notes.map(note => note.id));
            const newNotes = validNotes.filter(note => !existingIds.has(note.id));

            this.notes = [...newNotes, ...this.notes];
            this.saveNotes();

            return {
                success: true,
                imported: newNotes.length,
                skipped: validNotes.length - newNotes.length
            };
        } catch (error) {
            console.error('导入笔记失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 获取统计信息
    getStats() {
        const totalNotes = this.notes.length;
        const totalWords = this.notes.reduce((sum, note) =>
            sum + note.content.length, 0
        );
        const latestNote = this.notes.length > 0 ?
            this.notes.reduce((latest, note) =>
                new Date(note.updatedAt) > new Date(latest.updatedAt) ? note : latest
            ) : null;

        return {
            totalNotes,
            totalWords,
            latestNote
        };
    }

    // 生成唯一ID
    generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 清空所有笔记
    clearAllNotes() {
        this.notes = [];
        this.saveNotes();
    }

    // 按日期获取笔记
    getNotesByDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.notes.filter(note =>
            new Date(note.createdAt).toDateString() === targetDate
        );
    }

    // 获取最近的笔记
    getRecentNotes(limit = 10) {
        return this.notes
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }

    // 认证相关方法
    getCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    }

    getToken() {
        return localStorage.getItem('authToken');
    }

    // 初始化同步
    async initializeSync() {
        if (!this.currentUser || !this.token) {
            console.warn('用户未登录，使用本地存储模式');
            this.notes = this.loadNotes();
            return false;
        }

        this.syncEnabled = true;
        await this.syncFromCloud();
        this.startAutoSync();
        return true;
    }

    // 启动自动同步
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(async () => {
            if (this.syncEnabled) {
                await this.syncToCloud();
            }
        }, 30000); // 每30秒同步一次
    }

    // 停止自动同步
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // 从云端同步笔记
    async syncFromCloud() {
        try {
            const response = await this.apiCall('/api/notes', {
                method: 'GET'
            });

            if (response.success) {
                this.notes = response.notes;
                this.lastSyncTime = new Date().toISOString();

                // 同时保存到本地作为备份
                localStorage.setItem(this.storageKey, JSON.stringify(this.notes));

                return true;
            } else {
                console.error('从云端同步失败:', response.message);
                // 如果云端同步失败，使用本地数据
                this.notes = this.loadNotes();
                return false;
            }
        } catch (error) {
            console.error('云端同步错误:', error);
            // 如果网络错误，使用本地数据
            this.notes = this.loadNotes();
            return false;
        }
    }

    // 同步笔记到云端
    async syncToCloud() {
        if (!this.syncEnabled) return false;

        try {
            // 获取本地修改的笔记
            const localNotes = this.loadNotes();
            const cloudNotes = this.notes;

            // 检测冲突（简单的时间戳比较）
            const conflicts = this.detectConflicts(localNotes, cloudNotes);

            if (conflicts.length > 0) {
                console.warn('检测到冲突:', conflicts);
                // 这里可以实现更复杂的冲突解决策略
                // 暂时以本地版本为准
            }

            // 将本地笔记同步到云端
            const response = await this.apiCall('/api/notes/sync', {
                method: 'POST',
                body: JSON.stringify({ notes: localNotes })
            });

            if (response.success) {
                this.notes = response.notes;
                this.lastSyncTime = new Date().toISOString();
                return true;
            } else {
                console.error('同步到云端失败:', response.message);
                return false;
            }
        } catch (error) {
            console.error('同步到云端错误:', error);
            return false;
        }
    }

    // 检测冲突
    detectConflicts(localNotes, cloudNotes) {
        const conflicts = [];

        // 创建云端笔记的映射
        const cloudNotesMap = new Map(cloudNotes.map(note => [note.id, note]));

        // 检查每个本地笔记是否有冲突
        for (const localNote of localNotes) {
            const cloudNote = cloudNotesMap.get(localNote.id);
            if (cloudNote && new Date(localNote.updatedAt) > new Date(cloudNote.updatedAt)) {
                // 本地版本更新，需要同步到云端
            } else if (cloudNote && new Date(cloudNote.updatedAt) > new Date(localNote.updatedAt)) {
                // 云端版本更新，需要同步到本地
                conflicts.push({
                    id: localNote.id,
                    local: localNote,
                    cloud: cloudNote
                });
            }
        }

        return conflicts;
    }

    // API调用封装
    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            // 模拟API调用 - 实际项目中替换为真实API
            const response = await this.mockAPI(endpoint, mergedOptions);
            return response;
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    }

    // 模拟API调用（实际项目中替换为真实API）
    async mockAPI(endpoint, options) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        if (endpoint === '/api/notes') {
            // 模拟获取用户笔记
            const userNotes = this.loadNotes();
            return {
                success: true,
                notes: userNotes
            };
        }

        if (endpoint === '/api/notes/sync') {
            // 模拟同步笔记
            const body = JSON.parse(options.body);
            const notes = body.notes;

            // 保存到本地存储
            localStorage.setItem(this.storageKey, JSON.stringify(notes));
            this.notes = notes;

            return {
                success: true,
                notes: notes,
                message: '同步成功'
            };
        }

        return {
            success: false,
            message: '未知操作'
        };
    }

    // 获取同步状态
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            lastSyncTime: this.lastSyncTime,
            currentUser: this.currentUser,
            syncMode: this.syncEnabled ? '云端同步' : '本地存储'
        };
    }

    // 手动触发同步
    async manualSync() {
        if (!this.syncEnabled) {
            return { success: false, message: '云端同步未启用' };
        }

        try {
            await this.syncToCloud();
            return { success: true, message: '同步完成' };
        } catch (error) {
            return { success: false, message: '同步失败: ' + error.message };
        }
    }

    // 切换同步模式
    toggleSyncMode() {
        if (this.syncEnabled) {
            this.syncEnabled = false;
            this.stopAutoSync();
            this.notes = this.loadNotes();
            return { success: true, mode: '本地存储' };
        } else {
            if (this.currentUser && this.token) {
                this.syncEnabled = true;
                this.initializeSync();
                return { success: true, mode: '云端同步' };
            } else {
                return { success: false, message: '请先登录' };
            }
        }
    }

    // 登出时清理
    logout() {
        this.syncEnabled = false;
        this.stopAutoSync();
        this.currentUser = null;
        this.token = null;
        this.notes = [];
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
}

// 本地存储管理类（兼容旧版本）
class LocalStorageManager {
    constructor() {
        this.storageKey = 'notes';
        this.notes = this.loadNotes();
    }

    // 从LocalStorage加载笔记
    loadNotes() {
        try {
            const storedNotes = localStorage.getItem(this.storageKey);
            return storedNotes ? JSON.parse(storedNotes) : [];
        } catch (error) {
            console.error('加载笔记失败:', error);
            return [];
        }
    }

    // 保存笔记到LocalStorage
    saveNotes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
            return true;
        } catch (error) {
            console.error('保存笔记失败:', error);
            return false;
        }
    }

    // 获取所有笔记
    getAllNotes() {
        return [...this.notes];
    }

    // 根据ID获取笔记
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    // 创建新笔记
    createNote(title = '', content = '') {
        const newNote = {
            id: this.generateId(),
            title: title || '无标题笔记',
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            category: '默认分类'
        };

        this.notes.unshift(newNote);
        this.saveNotes();
        return newNote;
    }

    // 更新笔记
    updateNote(id, updates) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex] = {
                ...this.notes[noteIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveNotes();
            return this.notes[noteIndex];
        }
        return null;
    }

    // 删除笔记
    deleteNote(id) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            const deletedNote = this.notes.splice(noteIndex, 1)[0];
            this.saveNotes();
            return deletedNote;
        }
        return null;
    }

    // 搜索笔记
    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // 导出笔记数据
    exportNotes() {
        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // 导入笔记数据
    importNotes(notesData) {
        try {
            // 验证数据格式
            if (!Array.isArray(notesData)) {
                throw new Error('导入数据格式不正确');
            }

            // 验证每条笔记的必需字段
            const validNotes = notesData.filter(note =>
                note.id &&
                typeof note.title === 'string' &&
                typeof note.content === 'string'
            );

            if (validNotes.length === 0) {
                throw new Error('没有有效的笔记数据');
            }

            // 合并导入的笔记，避免重复ID
            const existingIds = new Set(this.notes.map(note => note.id));
            const newNotes = validNotes.filter(note => !existingIds.has(note.id));

            this.notes = [...newNotes, ...this.notes];
            this.saveNotes();

            return {
                success: true,
                imported: newNotes.length,
                skipped: validNotes.length - newNotes.length
            };
        } catch (error) {
            console.error('导入笔记失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 获取统计信息
    getStats() {
        const totalNotes = this.notes.length;
        const totalWords = this.notes.reduce((sum, note) =>
            sum + note.content.length, 0
        );
        const latestNote = this.notes.length > 0 ?
            this.notes.reduce((latest, note) =>
                new Date(note.updatedAt) > new Date(latest.updatedAt) ? note : latest
            ) : null;

        return {
            totalNotes,
            totalWords,
            latestNote
        };
    }

    // 生成唯一ID
    generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 清空所有笔记
    clearAllNotes() {
        this.notes = [];
        this.saveNotes();
    }

    // 按日期获取笔记
    getNotesByDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.notes.filter(note =>
            new Date(note.createdAt).toDateString() === targetDate
        );
    }

    // 获取最近的笔记
    getRecentNotes(limit = 10) {
        return this.notes
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }

    // 兼容方法（不做任何操作）
    async initializeSync() {
        return false;
    }

    startAutoSync() {
        // 不执行任何操作
    }

    stopAutoSync() {
        // 不执行任何操作
    }

    getSyncStatus() {
        return {
            enabled: false,
            lastSyncTime: null,
            currentUser: null,
            syncMode: '本地存储'
        };
    }

    async manualSync() {
        return { success: false, message: '本地存储模式不支持同步' };
    }

    toggleSyncMode() {
        return { success: false, message: '本地存储模式不支持切换同步' };
    }

    logout() {
        // 清理认证信息，但保留本地笔记
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
}

// 工厂函数：根据用户登录状态选择存储管理器
function createStorageManager() {
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (currentUser && token) {
        // 用户已登录，使用云端存储管理器
        return new CloudStorageManager();
    } else {
        // 用户未登录，使用本地存储管理器
        return new LocalStorageManager();
    }
}