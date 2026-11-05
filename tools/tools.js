/* ===== 工具导航页渲染脚本 ===== */
(function () {
  var grid = document.getElementById('tools-grid');
  var search = document.getElementById('tools-search');
  var cats = document.getElementById('tools-cats');
  var count = document.getElementById('tools-count');
  var allTools = [];
  var activeCat = '全部';

  function esc (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render () {
    var kw = search.value.trim().toLowerCase();
    var list = allTools.filter(function (t) {
      var inCat = activeCat === '全部' || t.category === activeCat;
      var hay = (t.name + ' ' + (t.desc || '') + ' ' + (t.tags || []).join(' ')).toLowerCase();
      return inCat && (!kw || hay.indexOf(kw) !== -1);
    });
    list.sort(function (a, b) {
      return (b.recommend ? 1 : 0) - (a.recommend ? 1 : 0);
    });

    count.textContent = '共 ' + allTools.length + ' 个工具，当前显示 ' + list.length + ' 个';

    if (!list.length) {
      grid.innerHTML = '<div class="tools-empty">没有匹配的工具，换个关键词试试</div>';
      return;
    }

    grid.innerHTML = list.map(function (t) {
      var tags = (t.tags || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
      return '<a class="tools-card" href="' + esc(t.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<div class="tools-card-head"><i class="tools-icon ' + esc(t.icon) + '"></i>' +
        (t.recommend ? '<span class="tools-badge">推荐</span>' : '') + '</div>' +
        '<div class="tools-card-name">' + esc(t.name) + '</div>' +
        '<div class="tools-card-desc">' + esc(t.desc) + '</div>' +
        (tags ? '<div class="tools-card-tags">' + tags + '</div>' : '') +
        '</a>';
    }).join('');
  }

  function init () {
    var catSet = {};
    allTools.forEach(function (t) {
      if (t.category) catSet[t.category] = true;
    });
    var catList = ['全部'].concat(Object.keys(catSet));

    cats.innerHTML = catList.map(function (c) {
      return '<button type="button" class="tools-cat' + (c === activeCat ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');

    cats.addEventListener('click', function (e) {
      var btn = e.target.closest('.tools-cat');
      if (!btn) return;
      activeCat = btn.getAttribute('data-cat');
      cats.querySelectorAll('.tools-cat').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-cat') === activeCat);
      });
      render();
    });

    search.addEventListener('input', render);
    render();
  }

  fetch('data.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      allTools = data;
      init();
    })
    .catch(function (err) {
      grid.innerHTML = '<div class="tools-empty">工具数据加载失败：' + esc(err.message) + '</div>';
    });
})();
