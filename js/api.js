/*
 * API 封装（测试阶段 · 纯静态本地模式）
 * -------------------------------------------------------------
 * 本阶段无后端、无部署：登录态用浏览器 localStorage 模拟，
 * 仅用于“上传到 git 即可预览”的本地测试，不具备跨设备/跨用户安全。
 * 接口签名与之前完全一致（register/login/logout/me 均返回 Promise，
 * 成功 resolve、未登录或失败 reject），因此 login.html / studio.html 无需改动。
 *
 * ⚠️ 安全提示：密码仅做本地哈希，未做任何服务端校验，任何人可读取本地数据。
 *    正式上线请恢复后端（Cloudflare Pages Functions / 自建 API）并启用 httpOnly Cookie + JWT。
 */
(function () {
  const USERS_KEY = 'xf3d_users';     // { email: { email, pwHash } }
  const SESSION_KEY = 'xf3d_session'; // { email }

  function readUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeUsers(obj) { localStorage.setItem(USERS_KEY, JSON.stringify(obj)); }
  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch (e) { return null; }
  }
  // 仅用于本地演示的轻量哈希，绝非安全实现
  function hash(pw) {
    let h = 0;
    for (let i = 0; i < pw.length; i++) { h = (h * 31 + pw.charCodeAt(i)) >>> 0; }
    return 'h' + h;
  }
  function emailOk(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  window.API = {
    register: async function (email, password) {
      email = (email || '').trim().toLowerCase();
      if (!emailOk(email)) throw new Error('邮箱格式不正确');
      if (!password || password.length < 6) throw new Error('密码至少 6 位');
      const users = readUsers();
      if (users[email]) throw new Error('该邮箱已注册，请直接登录');
      users[email] = { email: email, pwHash: hash(password) };
      writeUsers(users);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email }));
      return { email: email };
    },
    login: async function (email, password) {
      email = (email || '').trim().toLowerCase();
      const users = readUsers();
      const u = users[email];
      if (!u || u.pwHash !== hash(password)) throw new Error('邮箱或密码错误');
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email }));
      return { email: email };
    },
    logout: async function () {
      localStorage.removeItem(SESSION_KEY);
      return {};
    },
    me: async function () {
      const s = readSession();
      if (!s || !s.email) { const e = new Error('UNAUTH'); e.code = 401; throw e; }
      return { email: s.email };
    }
  };
})();
