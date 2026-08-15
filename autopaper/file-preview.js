(function () {
  "use strict";

  if (!/\.(md|markdown)$/i.test(decodeURIComponent(window.location.pathname))) return;
  if (document.body.dataset.paperMarkdown === "ready") return;

  const rawSource = document.body.textContent || "";
  const fileName = decodeURIComponent(window.location.pathname.split("/").pop() || "Markdown");

  function extractFrontmatter(source) {
    const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!match) return { content: source, meta: {} };
    const meta = {};
    match[1].split("\n").forEach((line) => {
      const item = line.match(/^([\w-]+):\s*(.+)$/);
      if (item) meta[item[1]] = item[2].replace(/^['"]|['"]$/g, "");
    });
    return { content: source.slice(match[0].length), meta };
  }

  function slugify(text, index) {
    const slug = text.trim().toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return slug || `section-${index + 1}`;
  }

  const { content, meta } = extractFrontmatter(rawSource);
  const title = meta.title || fileName.replace(/\.(md|markdown)$/i, "");
  document.title = `${title} · AutoPaper`;
  document.documentElement.classList.add("paper-markdown-document");
  document.body.dataset.paperMarkdown = "ready";
  document.body.innerHTML = `
    <div class="paper-progress" aria-hidden="true"><span></span></div>
    <header class="paper-bar">
      <a class="paper-brand" href="#paper-top" aria-label="回到顶部">
        <span class="paper-brand-mark">M↓</span>
        <span><strong>AutoPaper</strong><small>LOCAL MARKDOWN</small></span>
      </a>
      <div class="paper-file" title="${window.MarkdownPreview.escapeHtml(fileName)}">${window.MarkdownPreview.escapeHtml(fileName)}</div>
      <div class="paper-actions">
        <button id="paperSourceToggle" type="button">查看源码</button>
        <button id="paperPrint" type="button">打印</button>
      </div>
    </header>
    <div id="paper-top" class="paper-layout">
      <aside class="paper-toc" aria-label="文章目录">
        <div class="paper-toc-label">CONTENTS</div>
        <nav id="paperToc"></nav>
      </aside>
      <main class="paper-main">
        <div class="paper-meta">
          <span>LOCAL DOCUMENT</span>
          ${meta.updated ? `<span>更新于 ${window.MarkdownPreview.escapeHtml(meta.updated)}</span>` : ""}
        </div>
        <article id="paperArticle" class="paper-article"></article>
        <pre id="paperSource" class="paper-source" hidden></pre>
        <footer class="paper-end"><span>END</span><button id="paperBackTop" type="button">返回顶部 ↑</button></footer>
      </main>
    </div>`;

  const article = document.querySelector("#paperArticle");
  const source = document.querySelector("#paperSource");
  const toc = document.querySelector("#paperToc");
  article.innerHTML = window.MarkdownPreview.parseMarkdown(content);
  window.AutoPaperMermaid.render(article);
  source.textContent = rawSource;

  const usedIds = new Set();
  const headings = [...article.querySelectorAll("h1, h2, h3")];
  headings.forEach((heading, index) => {
    let id = slugify(heading.textContent, index);
    while (usedIds.has(id)) id = `${id}-${index + 1}`;
    usedIds.add(id);
    heading.id = id;
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.className = `paper-toc-${heading.tagName.toLowerCase()}`;
    link.textContent = heading.textContent;
    toc.appendChild(link);
  });

  if (!headings.length) document.querySelector(".paper-toc").hidden = true;

  const toggle = document.querySelector("#paperSourceToggle");
  toggle.addEventListener("click", () => {
    const showingSource = !source.hidden;
    source.hidden = showingSource;
    article.hidden = !showingSource;
    document.querySelector(".paper-toc").hidden = !showingSource || !headings.length;
    toggle.textContent = showingSource ? "查看源码" : "阅读视图";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelector("#paperPrint").addEventListener("click", () => window.print());
  document.querySelector("#paperBackTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    document.querySelector(".paper-progress span").style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  }
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
})();
