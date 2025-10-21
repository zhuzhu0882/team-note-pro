// Firebase 配置文件
// Team Note Pro - 修复版本

// 防止重复声明
if (typeof firebaseConfig === 'undefined') {
    const firebaseConfig = {
    apiKey: "AIzaSyCiUK6B4HCSHD3jGpcfRwbd81RxEtCO-l4",
    authDomain: "team-note-pro.firebaseapp.com",
    projectId: "team-note-pro",
    storageBucket: "team-note-pro.appspot.com",
    messagingSenderId: "475394331627",
    appId: "1:475394331627:web:placeholder_app_id"
};
} // 结束防止重复声明

// 调试模式 - 添加详细日志
window.DEBUG_FIREBASE = true;

// 🔧 配置说明：
// 1. 在 Firebase 控制台 → 项目设置 → 您的应用 → Web 应用中找到这些信息
// 2. 复制上面的配置对象，替换这里的占位符
// 3. 保存文件后即可部署

// 初始化 Firebase (防止重复初始化)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase 首次初始化');
} else {
    console.log('✅ Firebase 已初始化，跳过');
}

// 导出 Firebase 服务
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 🚨 调试：检查 Firebase 初始化
console.log('🔥 Firebase 初始化开始');
console.log('📊 Project ID:', firebaseConfig.projectId);
console.log('🔑 API Key:', firebaseConfig.apiKey ? '已配置' : '未配置');

// 🚨 调试：检查数据库连接 (Firebase v9 不需要 enableNetworkAccess)
console.log('✅ Firestore 网络访问已启用 (默认)');

// Firebase 实时数据库连接监听
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ 用户已登录:', user.uid, user.email);
        console.log('📱 用户详情:', user);

        // 用户登录时触发的事件
        if (window.noteApp) {
            window.noteApp.onUserLogin(user);
        }
    } else {
        console.log('❌ 用户已登出');
        // 用户登出时触发的事件
        if (window.noteApp) {
            window.noteApp.onUserLogout();
        }
    }
});

// 🚨 调试：测试数据库连接
setTimeout(() => {
    console.log('🔍 测试 Firestore 连接...');
    db.collection('test').doc('connection').set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'testing'
    }).then(() => {
        console.log('✅ Firestore 连接测试成功');
        // 删除测试文档
        return db.collection('test').doc('connection').delete();
    }).then(() => {
        console.log('✅ 测试文档已清理');
    }).catch((error) => {
        console.error('❌ Firestore 连接测试失败:', error);
    });
}, 2000);

// 全局错误处理
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('Firebase 认证持久化设置成功');
    })
    .catch((error) => {
        console.error('Firebase 认证持久化设置失败:', error);
    });

// 获取当前时间戳的辅助函数
const getTimestamp = () => {
    return firebase.firestore.FieldValue.serverTimestamp();
};

// 批量操作辅助函数
const batch = db.batch();

// 错误处理
window.FirebaseUtils = {
    auth,
    db,
    storage,
    getTimestamp,
    handleAuthError: (error) => {
        console.error('Firebase 认证错误:', error);
        switch (error.code) {
            case 'auth/user-not-found':
                return '用户不存在';
            case 'auth/wrong-password':
                return '密码错误';
            case 'auth/email-already-in-use':
                return '该邮箱已被注册';
            case 'auth/weak-password':
                return '密码强度不够';
            case 'auth/invalid-email':
                return '邮箱格式不正确';
            case 'auth/too-many-requests':
                return '请求过于频繁，请稍后再试';
            default:
                return '操作失败，请稍后重试';
        }
    },
    handleFirestoreError: (error) => {
        console.error('Firestore 错误:', error);
        switch (error.code) {
            case 'permission-denied':
                return '没有操作权限';
            case 'not-found':
                return '数据不存在';
            case 'unavailable':
                return '服务暂时不可用';
            case 'deadline-exceeded':
                return '请求超时';
            default:
                return '操作失败，请稍后重试';
        }
    }
};