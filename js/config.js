/*
 * 站点全局配置（测试阶段 · 纯静态本地模式）
 * 当前无后端，鉴权走浏览器 localStorage（见 api.js）。
 * 后续接入真实后端时，可在此增加 API_BASE 等字段，前端统一从这里读取。
 */
window.APP_CONFIG = {
  BRAND: '3D导演台',
  MODE: 'local-test'   // local-test = 本地模拟鉴权，仅作 git 预览
};
