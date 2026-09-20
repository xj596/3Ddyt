/*
 * 登录态 UI 辅助：退出按钮、顶栏渲染。
 * 登录校验门控写在各页面底部的内联脚本中（见 studio.html / index.html）。
 */
(function () {
  const lb = document.getElementById('btn-logout');
  if (lb) {
    lb.addEventListener('click', async function () {
      try { await window.API.logout(); } catch (e) { /* 忽略 */ }
      window.location.replace('/login.html');
    });
  }
})();
