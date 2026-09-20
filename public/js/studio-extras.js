/*
 * 3D导演台 · 扩展（框架注入，不改动原 2.7MB 应用逻辑）
 *  - 模型库面板（加载模型资产）
 * 测试阶段：登录即可用全部功能，无分级、无人偶数量上限。
 */
(function () {
  // 轻量提示（原应用无 toast，这里自带，保证消息可见）
  function notify(msg) {
    if (window.toast) { window.toast(msg); return; }
    let el = document.getElementById('xf-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'xf-toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:9998;' +
        'background:#241c14;color:#e8d9c5;border:1px solid #5a4a38;padding:10px 16px;border-radius:10px;' +
        'font-family:system-ui,sans-serif;font-size:13px;opacity:0;transition:opacity .2s;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.opacity = '0'; }, 2200);
  }

  // ---- 模型库面板 ----
  let libModal = null;
  let manifestCache = null;

  window.openModelLibrary = async function () {
    if (!libModal) buildModal();
    libModal.classList.add('open');
    await renderCategory('mannequin');
  };
  window.closeModelLibrary = function () { if (libModal) libModal.classList.remove('open'); };

  function buildModal() {
    libModal = document.createElement('div');
    libModal.id = 'model-library-modal';
    libModal.innerHTML =
      '<div class="ml-box">' +
        '<div class="ml-head"><strong>📦 模型库</strong>' +
        '<button class="ml-close" onclick="closeModelLibrary()">关闭</button></div>' +
        '<div class="ml-cats" id="ml-cats"></div>' +
        '<div class="ml-grid" id="ml-grid"></div>' +
      '</div>';
    document.body.appendChild(libModal);
    libModal.addEventListener('click', function (e) { if (e.target === libModal) libModal.classList.remove('open'); });
  }

  async function getManifest() {
    if (manifestCache) return manifestCache;
    const res = await fetch('/models/library-manifest.json');
    manifestCache = await res.json();
    return manifestCache;
  }

  async function renderCategory(catId) {
    const m = await getManifest();
    const catsEl = document.getElementById('ml-cats');
    catsEl.innerHTML = '';
    m.categories.forEach(function (c) {
      const b = document.createElement('div');
      b.className = 'ml-cat' + (c.id === catId ? ' active' : '');
      b.textContent = c.icon + ' ' + c.name;
      b.onclick = function () { renderCategory(c.id); };
      catsEl.appendChild(b);
    });
    const cat = m.categories.find(function (c) { return c.id === catId; });
    const grid = document.getElementById('ml-grid');
    grid.innerHTML = '';
    if (!cat || !cat.items.length) {
      grid.innerHTML = '<div class="ml-empty">该分类暂无模型。请把 .glb 放到 public/models/library/' + catId +
        '/ 并在 library-manifest.json 登记。</div>';
      return;
    }
    cat.items.forEach(function (it) {
      const d = document.createElement('div');
      d.className = 'ml-item';
      d.innerHTML = '<div class="ml-thumb">' + (it.icon || '📦') + '</div><div>' + it.name + '</div>';
      d.onclick = function () { loadModel(it); };
      grid.appendChild(d);
    });
  }

  async function loadModel(it) {
    if (!window.ModelLoaders || !window.ModelLoaders.GLTFLoader) { notify('加载器未就绪'); return; }
    try {
      const gltf = await window.ModelLoaders.GLTFLoader.loadAsync('/models/' + it.path);
      if (!window.modelLibGroup) window.modelLibGroup = new window.THREE.Group();
      gltf.scene.position.set(0, 0, 0);
      window.modelLibGroup.add(gltf.scene);
      scene.add(window.modelLibGroup);
      notify('已载入：' + it.name);
      if (libModal) libModal.classList.remove('open');
    } catch (e) {
      notify('载入失败：' + it.name);
      console.warn(e);
    }
  }
})();
