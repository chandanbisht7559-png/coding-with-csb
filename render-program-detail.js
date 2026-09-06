function renderProgramDetail(data, lang, langLabel) {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const program = data.find(p => p.id === id) || data[0];
  const idx = data.indexOf(program);
  const prev = data[idx - 1];
  const next = data[idx + 1];

  document.title = `${program.title} in ${langLabel} — Easy Coding`;

  document.getElementById('breadcrumb').innerHTML =
    `<a href="../index.html">Home</a> / <a href="index.html">${langLabel}</a> / <a href="programs.html">Programs</a> / ${escapeHTML(program.title)}`;

  document.getElementById('detail-title-wrap').innerHTML = `
    <span class="tab ${lang}">${program.num}</span>
    <div>
      <span class="pill ${lang}">${langLabel.toUpperCase()}</span>
      <h1>${escapeHTML(program.title)}</h1>
    </div>`;

  const body = document.getElementById('detail-body');
  body.innerHTML = `
    <div class="detail-block">
      <h2>Problem Statement</h2>
      <p class="body-text">${escapeHTML(program.problem)}</p>
    </div>
    <div class="detail-block">
      <h2>What It Does</h2>
      <p class="body-text">${escapeHTML(program.whatItDoes || '')}</p>
    </div>
    <div class="detail-block">
      <h2>Explanation</h2>
      <p class="body-text">${escapeHTML(program.explanation || '')}</p>
    </div>
    <div class="detail-block">
      <h2>Source Code</h2>
      <div class="code-block">
        <div class="code-bar">
          <span class="lang-label">${lang === 'c' ? 'main.c' : 'main.py'}</span>
          <button class="copy-btn" data-target="code-${program.id}">Copy Code</button>
        </div>
        <pre><code id="code-${program.id}" class="language-${lang}">${escapeHTML(program.code)}</code></pre>
      </div>
    </div>
    <div class="detail-block">
      <h2>Output</h2>
      <div class="io-grid">
        ${program.input ? `<div class="io-box"><div class="field-label">Sample Input</div><pre>${escapeHTML(program.input)}</pre></div>` : ''}
        <div class="io-box"><div class="field-label">Expected Output</div><pre>${escapeHTML(program.output)}</pre></div>
      </div>
    </div>
    <div class="detail-block">
      <h2>Output Explanation</h2>
      <p class="body-text">${escapeHTML(program.outputExplanation)}</p>
    </div>
    <div class="detail-block">
      <h2>Video</h2>
      <div class="video-box">
        <span class="sub" style="font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--ink-soft);">A video walkthrough for this exact program.</span>
        ${program.videoUrl
          ? `<a class="yt-btn" href="${program.videoUrl}" target="_blank" rel="noopener">▶ Watch Video on YouTube</a>`
          : `<span class="yt-btn pending">Video Coming Soon</span>`}
      </div>
    </div>
  `;

  const nav = document.getElementById('detail-nav');
  nav.innerHTML = `
    ${prev ? `<a href="program.html?id=${prev.id}">← #${prev.num} ${escapeHTML(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a href="program.html?id=${next.id}">#${next.num} ${escapeHTML(next.title)} →</a>` : '<span></span>'}
  `;

  // Note: initCopyButtons() runs automatically via the DOMContentLoaded
  // listener in main.js, which always fires after this synchronous
  // render call finishes (see main.js). Calling it again here would
  // double-bind the copy button's click handler.
}
