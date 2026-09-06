function renderPrograms(data, lang) {
  const container = document.getElementById('program-grid');
  const toolbarInput = document.getElementById('toolbar-search');
  const resultCount = document.getElementById('result-count');
  const itemEls = [];

  data.forEach(p => {
    const card = document.createElement('a');
    card.href = `program.html?id=${p.id}`;
    card.className = 'item-card';
    // Render a single-row program entry with number, title, short problem and a view action
    card.innerHTML = `
      <span class="tab ${lang}">${p.num}</span>
      <span>
        <div>
          <div class="title">${escapeHTML(p.title)}</div>
          <div class="subtitle">${escapeHTML(p.problem)}</div>
        </div>
      </span>
      <span class="row-actions">
        <button class="view-btn" aria-label="View Code">View Code</button>
      </span>`;
    container.appendChild(card);
    itemEls.push(card);
  });

  function updateCount(n) {
    if (resultCount) resultCount.textContent = `${n} of ${data.length} programs`;
  }
  updateCount(data.length);

  if (toolbarInput) {
    toolbarInput.addEventListener('input', () => {
      const n = filterItems(toolbarInput.value, data, p => p.title, itemEls);
      updateCount(n);
    });
  }
}
