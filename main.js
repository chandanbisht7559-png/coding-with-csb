// ===== Shared site behavior =====

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initActiveNav();
  initSearch();
  initCopyButtons();
  initAccordions();
  initInteractiveSelection();
});

// ---------- Mobile nav ----------
function initMobileMenu() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.main-nav');
  if (!btn || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('open');
    btn.classList.remove('is-selected');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('is-selected', isOpen);
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });
}

function initActiveNav() {
  const links = document.querySelectorAll('.main-nav a');
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const currentBase = currentPath === '/' || currentPath.endsWith('/index.html')
    ? '/'
    : currentPath.slice(0, currentPath.lastIndexOf('/')) || '/';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const resolved = new URL(href, window.location.href).pathname.replace(/\/+$/, '') || '/';
    const resolvedBase = resolved === '/' || resolved.endsWith('/index.html')
      ? '/'
      : resolved.slice(0, resolved.lastIndexOf('/')) || '/';
    const isHomeLink = resolved === '/' || resolved.endsWith('/index.html');
    const isCurrentHome = currentPath === '/' || currentPath.endsWith('/index.html');

    if ((isHomeLink && isCurrentHome) || resolvedBase === currentBase || resolved === currentPath) {
      link.classList.add('active');
    }
  });
}

// ---------- Global search (Ctrl/Cmd+K) ----------
function buildSearchIndex() {
  const index = [];
  const langBase = (lang) => (lang === 'c' ? '/c/' : '/python/');

  (window.C_DEFINITIONS || []).forEach(d => index.push({
    title: d.name, type: 'C · Definition', lang: 'c',
    url: `${langBase('c')}definitions.html#${d.id}`
  }));
  (window.PYTHON_DEFINITIONS || []).forEach(d => index.push({
    title: d.name, type: 'Python · Definition', lang: 'python',
    url: `${langBase('python')}definitions.html#${d.id}`
  }));
  (window.C_PROGRAMS || []).forEach(p => index.push({
    title: p.title, type: `C · Program #${p.num}`, lang: 'c',
    url: `${langBase('c')}program.html?id=${p.id}`
  }));
  (window.PYTHON_PROGRAMS || []).forEach(p => index.push({
    title: p.title, type: `Python · Program #${p.num}`, lang: 'python',
    url: `${langBase('python')}program.html?id=${p.id}`
  }));
  return index;
}

function initSearch() {
  const trigger = document.querySelector('.search-trigger');
  const overlay = document.querySelector('.search-overlay');
  if (!overlay) return;
  const input = overlay.querySelector('input');
  const resultsBox = overlay.querySelector('.search-results');
  const index = buildSearchIndex();

  const open = () => {
    overlay.classList.add('open');
    input.value = '';
    renderResults('');
    setTimeout(() => input.focus(), 30);
  };
  const close = () => overlay.classList.remove('open');

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    let matches = q === '' ? [] : index.filter(item => item.title.toLowerCase().includes(q));
    matches = matches.slice(0, 20);
    resultsBox.innerHTML = '';
    if (q === '') {
      resultsBox.innerHTML = '<div class="search-empty">Type to search programs and definitions across C and Python…</div>';
      return;
    }
    if (matches.length === 0) {
      resultsBox.innerHTML = '<div class="search-empty">No results found.</div>';
      return;
    }
    matches.forEach(item => {
      const a = document.createElement('a');
      a.className = 'sr-item';
      a.href = item.url;
      a.innerHTML = `<span class="tab ${item.lang}" style="min-width:22px;height:22px;font-size:10px;">${item.lang === 'c' ? 'C' : 'Py'}</span>
        <span><span class="sr-title">${escapeHTML(item.title)}</span><br><span class="sr-type">${escapeHTML(item.type)}</span></span>`;
      resultsBox.appendChild(a);
    });
  }

  if (trigger) trigger.addEventListener('click', open);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  input.addEventListener('input', () => renderResults(input.value));
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    if (e.key === 'Escape') close();
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Copy code buttons ----------
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const codeEl = targetId ? document.getElementById(targetId) : btn.closest('.code-block').querySelector('code');
      const text = codeEl ? codeEl.textContent : '';
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const original = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = 'Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = original; }, 1600);
    });
  });
}

// ---------- Accordion (definitions pages) ----------
function initAccordions() {
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.closest('.acc-item');
      const shouldOpen = !item.classList.contains('open');

      document.querySelectorAll('.acc-item').forEach(acc => {
        acc.classList.remove('open');
        acc.querySelector('.acc-head')?.classList.remove('is-selected');
      });

      if (shouldOpen) {
        item.classList.add('open');
        head.classList.add('is-selected');
      }
    });
  });
}

function initInteractiveSelection() {
  const groups = [
    '.lang-card, .dash-card, .item-card',
    '.copy-btn, .video-box .yt-btn, .detail-nav a, .back-link',
    '.search-results .sr-item'
  ];

  groups.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll(selector).forEach(item => item.classList.remove('is-selected'));
        el.classList.add('is-selected');
      });
    });
  });
}

// ---------- Generic list/accordion filter, used by page scripts ----------
function filterItems(query, items, getTitle, wrapEls) {
  const q = query.trim().toLowerCase();
  let visibleCount = 0;
  items.forEach((item, i) => {
    const match = q === '' || getTitle(item).toLowerCase().includes(q);
    wrapEls[i].hidden = !match;
    if (match) visibleCount++;
  });
  return visibleCount;
}
