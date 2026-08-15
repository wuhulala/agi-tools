(function () {
  "use strict";

  const tbody = document.querySelector("#tbody");
  const pathname = decodeURIComponent(window.location.pathname);
  if (!pathname.endsWith("/") || !tbody || document.body.dataset.paperDirectory === "ready") return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function breadcrumbs(path) {
    const parts = path.split("/").filter(Boolean);
    let href = "file:///";
    return parts.map((part, index) => {
      href += `${encodeURIComponent(part)}/`;
      const current = index === parts.length - 1;
      return `<a href="${href}"${current ? ' aria-current="page"' : ""}>${escapeHtml(part)}</a>`;
    }).join('<span aria-hidden="true">/</span>');
  }

  const items = [...tbody.querySelectorAll("tr")].map((row, sourceIndex) => {
    const link = row.querySelector("a");
    const cells = row.querySelectorAll("td");
    const rawName = link?.textContent.trim() || "";
    const directory = link?.classList.contains("dir") || rawName.endsWith("/");
    const name = rawName.replace(/\/$/, "");
    const extension = directory ? "DIR" : (name.split(".").pop() || "FILE").toUpperCase();
    return {
      sourceIndex,
      name,
      href: link?.href || "#",
      directory,
      markdown: /\.(md|markdown)$/i.test(name),
      extension,
      size: Number(cells[1]?.dataset.value || 0),
      sizeLabel: cells[1]?.textContent.trim() || "—",
      timestamp: Number(cells[2]?.dataset.value || 0),
      dateLabel: cells[2]?.textContent.trim() || "—"
    };
  }).filter((item) => item.name);

  const folderName = pathname.split("/").filter(Boolean).pop() || "本地文件";
  const parentHref = document.querySelector("#parentDirLink")?.href || "file:///";
  const markdownCount = items.filter((item) => item.markdown).length;
  const folderCount = items.filter((item) => item.directory).length;

  document.title = `${folderName} · AutoPaper Library`;
  document.documentElement.classList.add("paper-directory-document");
  document.body.dataset.paperDirectory = "ready";
  document.body.innerHTML = `
    <header class="library-bar">
      <a class="library-brand" href="${escapeHtml(parentHref)}" aria-label="返回上级目录">
        <span class="library-brand-mark">M↓</span>
        <span><strong>AutoPaper</strong><small>LOCAL LIBRARY</small></span>
      </a>
      <nav class="library-breadcrumbs" aria-label="文件路径">${breadcrumbs(pathname)}</nav>
      <a class="library-up" href="${escapeHtml(parentHref)}">上一级 ↑</a>
    </header>
    <main class="library-shell">
      <section class="library-intro">
        <div>
          <p class="library-kicker">LOCAL KNOWLEDGE · 本地文库</p>
          <h1>${escapeHtml(folderName)}</h1>
          <p class="library-path">${escapeHtml(pathname)}</p>
        </div>
        <div class="library-stats" aria-label="目录统计">
          <span><strong>${markdownCount}</strong> Markdown</span>
          <span><strong>${folderCount}</strong> 文件夹</span>
          <span><strong>${items.length}</strong> 项内容</span>
        </div>
      </section>
      <section class="library-controls" aria-label="文库筛选">
        <label class="library-search">
          <span>⌕</span>
          <input id="librarySearch" type="search" placeholder="搜索当前目录…" autocomplete="off" aria-label="搜索当前目录">
          <kbd>/</kbd>
        </label>
        <button id="libraryMarkdownOnly" type="button" aria-pressed="false">只看 Markdown</button>
        <label class="library-sort">排序
          <select id="librarySort" aria-label="排序方式">
            <option value="name">名称</option>
            <option value="recent">最近修改</option>
            <option value="size">文件大小</option>
          </select>
        </label>
      </section>
      <div class="library-heading">
        <span id="libraryResultCount">${items.length} 项</span>
        <span>点击 Markdown 进入阅读模式</span>
      </div>
      <section id="libraryGrid" class="library-grid" aria-live="polite"></section>
      <div id="libraryEmpty" class="library-empty" hidden>
        <strong>没有匹配的内容</strong><span>换个关键词，或关闭 Markdown 筛选。</span>
      </div>
    </main>
    <footer class="library-footer"><span>AUTOPAPER / LOCAL ONLY</span><span>文件不会离开这台设备</span></footer>`;

  const grid = document.querySelector("#libraryGrid");
  const search = document.querySelector("#librarySearch");
  const sort = document.querySelector("#librarySort");
  const markdownOnly = document.querySelector("#libraryMarkdownOnly");
  const resultCount = document.querySelector("#libraryResultCount");
  const empty = document.querySelector("#libraryEmpty");
  let onlyMarkdown = false;

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = items.filter((item) => {
      if (onlyMarkdown && !item.markdown) return false;
      return !query || item.name.toLocaleLowerCase().includes(query);
    }).sort((a, b) => {
      if (a.directory !== b.directory) return a.directory ? -1 : 1;
      if (sort.value === "recent") return b.timestamp - a.timestamp || a.name.localeCompare(b.name, "zh-CN");
      if (sort.value === "size") return b.size - a.size || a.name.localeCompare(b.name, "zh-CN");
      return a.name.localeCompare(b.name, "zh-CN", { numeric: true });
    });

    grid.innerHTML = filtered.map((item, index) => `
      <a class="library-item ${item.directory ? "is-directory" : ""} ${item.markdown ? "is-markdown" : ""}"
         href="${escapeHtml(item.href)}" style="--item-index:${Math.min(index, 12)}">
        <span class="library-item-icon" aria-hidden="true"><i></i></span>
        <span class="library-item-copy">
          <strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.directory ? "文件夹" : item.sizeLabel)} · ${escapeHtml(item.dateLabel)}</small>
        </span>
        <span class="library-item-type">${escapeHtml(item.markdown ? "MD" : item.extension)}</span>
        <span class="library-item-arrow" aria-hidden="true">↗</span>
      </a>`).join("");
    resultCount.textContent = `${filtered.length} 项`;
    empty.hidden = filtered.length > 0;
  }

  search.addEventListener("input", render);
  sort.addEventListener("change", render);
  markdownOnly.addEventListener("click", () => {
    onlyMarkdown = !onlyMarkdown;
    markdownOnly.setAttribute("aria-pressed", String(onlyMarkdown));
    render();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !/input|select|textarea/i.test(document.activeElement.tagName)) {
      event.preventDefault();
      search.focus();
    }
  });
  render();
})();
