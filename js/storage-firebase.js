// Firebase 存储管理类
if (typeof FirebaseStorageManager === 'undefined') {
    class FirebaseStorageManager {
    constructor() {
        this.auth = window.FirebaseUtils.auth;
        this.db = window.FirebaseUtils.db;
        this.currentUser = null;
        this.notes = [];
        this.unsubscribeNotes = null;
        this.syncEnabled = true;
        this.lastSyncTime = null;

        // 监听认证状态变化
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.initializeSync();
            } else {
                this.currentUser = null;
                this.cleanup();
            }
        });
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser ? {
            uid: this.currentUser.uid,
            email: this.currentUser.email,
            username: this.currentUser.displayName || this.currentUser.email.split('@')[0],
            photoURL: this.currentUser.photoURL
        } : null;
    }

    // 初始化同步
    async initializeSync() {
        if (!this.currentUser) {
            console.warn('用户未登录');
            return false;
        }

        this.syncEnabled = true;
        await this.loadNotesFromFirebase();
        this.startRealtimeSync();
        return true;
    }

    // 从 Firebase 加载笔记
    async loadNotesFromFirebase() {
        if (!this.currentUser) {
            console.error('用户未登录，无法加载笔记');
            return false;
        }

        try {
            console.log('开始从 Firebase 加载笔记，用户ID:', this.currentUser.uid);

            const snapshot = await this.db
                .collection('notes')
                .where('uid', '==', this.currentUser.uid)
                .orderBy('updatedAt', 'desc')
                .get();

            this.notes = snapshot.docs.map(doc => {
                const data = doc.data();
                // 处理时间戳
                return {
                    id: doc.id,
                    ...data,
                    updatedAt: data.updatedAt && data.updatedAt.toDate ?
                        data.updatedAt.toDate().toISOString() : data.updatedAt,
                    createdAt: data.createdAt && data.createdAt.toDate ?
                        data.createdAt.toDate().toISOString() : data.createdAt
                };
            });

            this.lastSyncTime = new Date().toISOString();
            console.log(`从 Firebase 加载了 ${this.notes.length} 条笔记`, this.notes);
            return true;
        } catch (error) {
            console.error('从 Firebase 加载笔记失败:', error);
            // 尝试降级到本地存储
            console.log('降级到本地存储模式');
            return false;
        }
    }

    // 启动实时同步
    startRealtimeSync() {
        if (this.unsubscribeNotes) {
            this.unsubscribeNotes();
        }

        this.unsubscribeNotes = this.db
            .collection('notes')
            .where('uid', '==', this.currentUser.uid)
            .orderBy('updatedAt', 'desc')
            .onSnapshot((snapshot) => {
                this.notes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                this.lastSyncTime = new Date().toISOString();

                // 触发笔记更新事件
                if (window.noteApp) {
                    window.noteApp.onNotesUpdated(this.notes);
                }
            }, (error) => {
                console.error('实时同步错误:', error);
            });
    }

    // 停止实时同步
    stopRealtimeSync() {
        if (this.unsubscribeNotes) {
            this.unsubscribeNotes();
            this.unsubscribeNotes = null;
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
    async createNote(title = '', content = '') {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }

        try {
            console.log('创建新笔记，用户ID:', this.currentUser.uid);

            const newNoteData = {
                uid: this.currentUser.uid,
                title: title || '无标题笔记',
                content: content || '',
                createdAt: window.FirebaseUtils.getTimestamp(),
                updatedAt: window.FirebaseUtils.getTimestamp(),
                tags: [],
                category: '默认分类',
                isPublic: false
            };

            console.log('笔记数据:', newNoteData);
            const docRef = await this.db.collection('notes').add(newNoteData);
            const newNote = { id: docRef.id, ...newNoteData };

            console.log('笔记创建成功:', docRef.id);
            return newNote;
        } catch (error) {
            console.error('创建笔记失败:', error);
            throw error;
        }
    }

    // 更新笔记
    async updateNote(id, updates) {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }

        try {
            const noteRef = this.db.collection('notes').doc(id);
            const updateData = {
                ...updates,
                updatedAt: window.FirebaseUtils.getTimestamp()
            };

            await noteRef.update(updateData);

            const updatedNote = { id, ...updates, ...updateData };
            console.log('笔记更新成功:', id);
            return updatedNote;
        } catch (error) {
            console.error('更新笔记失败:', error);
            throw error;
        }
    }

    // 删除笔记
    async deleteNote(id) {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }

        try {
            await this.db.collection('notes').doc(id).delete();
            console.log('笔记删除成功:', id);
            return { id };
        } catch (error) {
            console.error('删除笔记失败:', error);
            throw error;
        }
    }

    // 搜索笔记
    async searchNotes(query) {
        if (!this.currentUser) {
            return [];
        }

        const lowerQuery = query.toLowerCase();

        // 本地搜索（更简单，对于个人应用足够）
        return this.notes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );

        // 如果需要更复杂的搜索，可以使用 Firebase 的搜索扩展
    }

    // 导出笔记数据
    async exportNotes() {
        try {
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                user: this.getCurrentUser(),
                notes: this.notes
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('笔记导出成功');
        } catch (error) {
            console.error('导出笔记失败:', error);
            throw error;
        }
    }

    // 导入笔记数据
    async importNotes(notesData) {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }

        try {
            let notes = [];

            // 处理不同的数据格式
            if (Array.isArray(notesData)) {
                notes = notesData;
            } else if (notesData.notes && Array.isArray(notesData.notes)) {
                notes = notesData.notes;
            } else {
                throw new Error('不支持的数据格式');
            }

            // 验证和清理笔记数据
            const validNotes = notes.filter(note => {
                return note.title && typeof note.title === 'string' &&
                       (note.content === undefined || typeof note.content === 'string');
            });

            if (validNotes.length === 0) {
                throw new Error('没有有效的笔记数据');
            }

            // 批量导入到 Firebase
            const batch = this.db.batch();
            let importedCount = 0;

            for (const note of validNotes) {
                const noteData = {
                    uid: this.currentUser.uid,
                    title: note.title,
                    content: note.content || '',
                    tags: note.tags || [],
                    category: note.category || '默认分类',
                    isPublic: note.isPublic || false,
                    createdAt: note.createdAt || window.FirebaseUtils.getTimestamp(),
                    updatedAt: window.FirebaseUtils.getTimestamp(),
                    importedAt: window.FirebaseUtils.getTimestamp()
                };

                const docRef = this.db.collection('notes').doc();
                batch.set(docRef, noteData);
                importedCount++;
            }

            await batch.commit();
            console.log(`成功导入 ${importedCount} 条笔记`);

            return {
                success: true,
                imported: importedCount,
                total: validNotes.length
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
    async getStats() {
        if (!this.currentUser) {
            return { totalNotes: 0, totalWords: 0, latestNote: null };
        }

        const totalNotes = this.notes.length;
        const totalWords = this.notes.reduce((sum, note) =>
            sum + (note.content ? note.content.length : 0), 0
        );

        const latestNote = this.notes.length > 0 ? this.notes[0] : null;

        return {
            totalNotes,
            totalWords,
            latestNote,
            storageUsed: this.estimateStorageSize()
        };
    }

    // 估算存储使用量
    estimateStorageSize() {
        const notesSize = JSON.stringify(this.notes).length;
        const userInfoSize = JSON.stringify(this.getCurrentUser()).length;
        return {
            bytes: notesSize + userInfoSize,
            kb: Math.round((notesSize + userInfoSize) / 1024 * 100) / 100
        };
    }

    // 生成唯一ID
    generateId() {
        return this.db.collection('notes').doc().id;
    }

    // 清空所有笔记
    async clearAllNotes() {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }

        try {
            const batch = this.db.batch();
            const snapshot = await this.db
                .collection('notes')
                .where('uid', '==', this.currentUser.uid)
                .get();

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log('所有笔记已清空');
        } catch (error) {
            console.error('清空笔记失败:', error);
            throw error;
        }
    }

    // 按日期获取笔记
    getNotesByDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.notes.filter(note => {
            if (!note.createdAt) return false;
            return new Date(note.createdAt.toDate ? note.createdAt.toDate() : note.createdAt).toDateString() === targetDate;
        });
    }

    // 获取最近的笔记
    getRecentNotes(limit = 10) {
        return this.notes.slice(0, limit);
    }

    // 获取同步状态
    getSyncStatus() {
        return {
            enabled: this.syncEnabled && this.currentUser !== null,
            lastSyncTime: this.lastSyncTime,
            currentUser: this.getCurrentUser(),
            syncMode: this.syncEnabled && this.currentUser ? '云端同步' : '本地存储',
            connectionStatus: 'connected' // 可以添加实际连接状态检查
        };
    }

    // 手动触发同步
    async manualSync() {
        if (!this.currentUser) {
            return { success: false, message: '用户未登录' };
        }

        try {
            await this.loadNotesFromFirebase();
            return { success: true, message: '同步完成' };
        } catch (error) {
            return { success: false, message: '同步失败: ' + error.message };
        }
    }

    // 切换同步模式
    toggleSyncMode() {
        if (this.syncEnabled && this.currentUser) {
            this.syncEnabled = false;
            this.stopRealtimeSync();
            return { success: true, mode: '本地存储' };
        } else if (this.currentUser) {
            this.syncEnabled = true;
            this.initializeSync();
            return { success: true, mode: '云端同步' };
        } else {
            return { success: false, message: '请先登录' };
        }
    }

    // 登出时清理
    logout() {
        this.syncEnabled = false;
        this.stopRealtimeSync();
        this.currentUser = null;
        this.notes = [];
    }

    // 清理资源
    cleanup() {
        this.stopRealtimeSync();
        this.notes = [];
        this.currentUser = null;
    }
}

// 本地存储管理类（兼容旧版本）
class LocalStorageManager {
    constructor() {
        this.storageKey = 'notes';
        this.notes = this.loadNotes();
    }

    loadNotes() {
        try {
            const storedNotes = localStorage.getItem(this.storageKey);
            return storedNotes ? JSON.parse(storedNotes) : [];
        } catch (error) {
            console.error('加载笔记失败:', error);
            return [];
        }
    }

    saveNotes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
            return true;
        } catch (error) {
            console.error('保存笔记失败:', error);
            return false;
        }
    }

    getAllNotes() {
        return [...this.notes];
    }

    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    createNote(title = '', content = '') {
        const newNote = {
            id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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

    deleteNote(id) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            const deletedNote = this.notes.splice(noteIndex, 1)[0];
            this.saveNotes();
            return deletedNote;
        }
        return null;
    }

    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }

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

    async importNotes(notesData) {
        try {
            let notes = [];

            if (Array.isArray(notesData)) {
                notes = notesData;
            } else if (notesData.notes && Array.isArray(notesData.notes)) {
                notes = notesData.notes;
            } else {
                throw new Error('不支持的数据格式');
            }

            const validNotes = notes.filter(note =>
                note.id &&
                typeof note.title === 'string' &&
                (note.content === undefined || typeof note.content === 'string')
            );

            if (validNotes.length === 0) {
                throw new Error('没有有效的笔记数据');
            }

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

    getStats() {
        const totalNotes = this.notes.length;
        const totalWords = this.notes.reduce((sum, note) =>
            sum + (note.content ? note.content.length : 0), 0
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

    generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    clearAllNotes() {
        this.notes = [];
        this.saveNotes();
    }

    getNotesByDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.notes.filter(note =>
            new Date(note.createdAt).toDateString() === targetDate
        );
    }

    getRecentNotes(limit = 10) {
        return this.notes
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }

    getCurrentUser() {
        return null;
    }

    async initializeSync() {
        return false;
    }

    startRealtimeSync() {
        // 不执行任何操作
    }

    stopRealtimeSync() {
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
}

// 工厂函数：根据用户登录状态选择存储管理器
function createStorageManager() {
    const currentUser = window.FirebaseUtils.auth.currentUser;

    if (currentUser) {
        console.log('使用 Firebase 存储管理器');
        return new FirebaseStorageManager();
    } else {
        console.log('使用本地存储管理器');
        return new LocalStorageManager();
    }
}
} // 结束防止重复声明