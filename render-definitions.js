function renderDefinitions(data, lang) {
  const container = document.getElementById('accordion');
  const toolbarInput = document.getElementById('toolbar-search');
  const resultCount = document.getElementById('result-count');

  if (!container) return;

  container.innerHTML = '';

  // Render definitions as a single vertical list, grouped by category headings
  const categories = [];
  const byCategory = {};
  data.forEach(item => {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
      categories.push(item.category);
    }
    byCategory[item.category].push(item);
  });

  const itemEls = [];
  const items = [];
  let counter = 0;

  categories.forEach(cat => {
    const catHead = document.createElement('div');
    catHead.className = 'definitions-category';
    catHead.textContent = cat.toUpperCase();
    container.appendChild(catHead);

    // Category list wrapper (single column)
    const list = document.createElement('div');
    list.className = 'definitions-list';
    container.appendChild(list);

    byCategory[cat].forEach(def => {
      counter++;
      const el = document.createElement('button');
      el.className = 'definition-card';
      el.type = 'button';
      el.id = def.id;
      el.setAttribute('data-topic', def.name);
      el.setAttribute('data-lang', lang);
      el.setAttribute('aria-label', `View definition for ${def.name}`);

      el.innerHTML = `
        <span class="tab def-num ${lang}">${counter.toString().padStart(2, '0')}</span>
        <span>
          <div>
            <div class="definition-title">${escapeHTML(def.name)}</div>
            <div class="definition-preview">${escapeHTML(def.shortDefinition || def.definition)}</div>
          </div>
        </span>
        <span class="row-actions">
          <span class="definition-view-btn">View Definition</span>
        </span>`;

      list.appendChild(el);
      itemEls.push(el);
      items.push(def);
    });
  });

  function updateCount(n) {
    if (resultCount) resultCount.textContent = `${n} of ${items.length} concepts`;
  }
  updateCount(items.length);

  if (toolbarInput) {
    toolbarInput.addEventListener('input', () => {
      const n = filterItems(toolbarInput.value, items, d => d.name, itemEls);
      updateCount(n);
    });
  }

  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  bindDefinitionActions();
}

function bindDefinitionActions() {
  document.querySelectorAll('.definition-card').forEach(button => {
    button.addEventListener('click', () => {
      const defId = button.id;
      const lang = button.getAttribute('data-lang') || 'c';
      const defData = (window.C_DEFINITIONS || []).concat(window.PYTHON_DEFINITIONS || []).find(item => item.id === defId);
      const data = lang === 'c' ? (window.C_DEFINITIONS || []) : (window.PYTHON_DEFINITIONS || []);
      const def = data.find(item => item.id === defId) || defData;

      if (!def) return;

      openDefinitionModal(def, lang);
    });
  });
}

function openDefinitionModal(def, lang) {
  const overlay = document.createElement('div');
  overlay.className = 'definition-modal-overlay';
  overlay.innerHTML = `
    <div class="definition-modal" role="dialog" aria-modal="true" aria-labelledby="definition-modal-title">
      <button class="definition-modal-close" type="button" aria-label="Close definition">×</button>
      <div class="definition-modal-head">
        <div>
          <p class="definition-modal-label">${lang === 'c' ? 'C Programming' : 'Python Programming'}</p>
          <h2 id="definition-modal-title" class="definition-modal-title">${escapeHTML(def.name)}</h2>
        </div>
        <button class="definition-modal-copy" type="button" data-copy="${escapeHTML(buildDefinitionText(def))}" aria-label="Copy definition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy Definition</span>
        </button>
      </div>
      <div class="definition-modal-content">
        <section class="definition-modal-section">
          <h3>Short Definition</h3>
          <p>${escapeHTML(def.shortDefinition || def.definition)}</p>
        </section>
        <section class="definition-modal-section">
          <h3>${def.article ? 'Complete Guide' : 'Long Definition'}</h3>
          ${def.article ? renderArticle(def.article, lang) : `<p>${escapeHTML(def.longDefinition || def.definition)}</p>`}
        </section>
        ${def.hindiMeaning ? `<section class="definition-modal-section hindi">
          <h3>Hindi Meaning</h3>
          <p>${escapeHTML(def.hindiMeaning)}</p>
        </section>` : ''}
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.classList.add('definition-modal-open');

  const closeModal = () => {
    overlay.remove();
    document.body.classList.remove('definition-modal-open');
    document.removeEventListener('keydown', handleKeydown);
  };

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleKeydown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  overlay.querySelector('.definition-modal-close').addEventListener('click', closeModal);

  const copyButton = overlay.querySelector('.definition-modal-copy');
  copyButton.addEventListener('click', async (event) => {
    event.stopPropagation();
    const text = copyButton.getAttribute('data-copy') || '';
    const originalHtml = copyButton.innerHTML;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      copyButton.innerHTML = '<span>✓ Copied</span>';
      copyButton.classList.add('copied');
      window.setTimeout(() => {
        copyButton.innerHTML = originalHtml;
        copyButton.classList.remove('copied');
      }, 2000);
    } catch (error) {
      showDefinitionToast('Copy failed. Please try again.');
    }
  });
}

function renderArticle(article, lang) {
  return article.map(section => `
    <article class="learning-article">
      <h4>${escapeHTML(section.heading)}</h4>
      ${section.text ? `<p>${escapeHTML(section.text)}</p>` : ''}
      ${section.items ? `<ul>${section.items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}
      ${section.code ? `<div class="article-code"><div class="article-code-label">${escapeHTML(section.label || (lang === 'c' ? 'example.c' : 'example.py'))}</div><pre><code>${escapeHTML(section.code)}</code></pre></div>` : ''}
    </article>`).join('');
}

function buildDefinitionText(def) {
  const articleText = (def.article || []).map(section => [
    section.heading,
    section.text || '',
    ...(section.items || []).map(item => `- ${item}`),
    section.code || ''
  ].filter(Boolean).join('\n')).join('\n\n');
  return [
    `Topic Name: ${def.name}`,
    `Short Definition: ${def.shortDefinition || def.definition}`,
    `Long Definition: ${def.longDefinition || def.definition}`,
    articleText ? `Complete Guide:\n${articleText}` : '',
    def.hindiMeaning ? `Hindi Meaning: ${def.hindiMeaning}` : ''
  ].filter(Boolean).join('\n\n');
}

function showDefinitionToast(message) {
  let toast = document.getElementById('definition-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'definition-toast';
    toast.className = 'definition-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showDefinitionToast.timeoutId);
  showDefinitionToast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2200);
}
