/*
 * 前端权限门控（测试阶段：登录即可用全部功能，不做账号分级）
 * 本阶段登录态存于浏览器 localStorage（见 api.js），仅本地测试用。
 * 设计要点：前端门控不能作为安全边界；正式上线须由真实后端强制校验。
 */
(function () {
  let user = null;

  function setUser(u) { user = u; }
  function can() { return !!user; }   // 已登录即可用全部功能
  function apply() { /* 测试阶段无分级，无需锁定任何元素 */ }

  window.RBAC = { setUser: setUser, can: can, apply: apply };
})();
