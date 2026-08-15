(function (root) {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeUrl(url) {
    const decoded = url.replace(/&amp;/g, "&").trim();
    if (/^(javascript|data|vbscript):/i.test(decoded)) return "#";
    return url;
  }

  function inline(text) {
    const tokens = [];
    let value = escapeHtml(text);

    value = value.replace(/`([^`]+)`/g, (_, code) => {
      const token = `\u0000CODE${tokens.length}\u0000`;
      tokens.push(`<code>${code}</code>`);
      return token;
    });
    value = value.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+[&quot;\"]([^\"]*)[&quot;\"])?\)/g,
      (_, alt, url, title) => `<img src="${safeUrl(url)}" alt="${alt}"${title ? ` title="${title}"` : ""}>`);
    value = value.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+[&quot;\"]([^\"]*)[&quot;\"])?\)/g,
      (_, label, url, title) => `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer"${title ? ` title="${title}"` : ""}>${label}</a>`);
    value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    value = value.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    value = value.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    value = value.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    value = value.replace(/  \n/g, "<br>");
    tokens.forEach((html, index) => { value = value.replace(`\u0000CODE${index}\u0000`, html); });
    return value;
  }

  function splitCells(row) {
    return row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  }

  function isTableDivider(line) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  }

  function parseMarkdown(markdown) {
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let listType = null;
    let quote = [];

    const flushParagraph = () => {
      if (paragraph.length) html.push(`<p>${inline(paragraph.join("\n"))}</p>`);
      paragraph = [];
    };
    const closeList = () => {
      if (listType) html.push(`</${listType}>`);
      listType = null;
    };
    const flushQuote = () => {
      if (quote.length) html.push(`<blockquote>${quote.map((line) => `<p>${inline(line)}</p>`).join("")}</blockquote>`);
      quote = [];
    };
    const flushBlocks = () => { flushParagraph(); closeList(); flushQuote(); };

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const fence = line.match(/^\s*```([^`]*)$/);
      if (fence) {
        flushBlocks();
        const code = [];
        i += 1;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
          code.push(lines[i]);
          i += 1;
        }
        const language = fence[1].trim().replace(/[^a-z0-9_-]/gi, "");
        html.push(`<pre><code${language ? ` class="language-${language}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
        continue;
      }

      if (i + 1 < lines.length && line.includes("|") && isTableDivider(lines[i + 1])) {
        flushBlocks();
        const headers = splitCells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
          rows.push(splitCells(lines[i]));
          i += 1;
        }
        i -= 1;
        html.push(`<table><thead><tr>${headers.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead>` +
          `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushBlocks();
        const level = heading[1].length;
        html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        continue;
      }
      if (/^\s*((\*|-|_)\s*){3,}$/.test(line)) {
        flushBlocks();
        html.push("<hr>");
        continue;
      }

      const list = line.match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
      if (list) {
        flushParagraph();
        flushQuote();
        const nextType = /\d+\./.test(list[1]) ? "ol" : "ul";
        if (listType !== nextType) {
          closeList();
          listType = nextType;
          html.push(`<${listType}>`);
        }
        const task = list[2].match(/^\[([ xX])\]\s+(.+)$/);
        html.push(task
          ? `<li><input type="checkbox" disabled${task[1].toLowerCase() === "x" ? " checked" : ""}> ${inline(task[2])}</li>`
          : `<li>${inline(list[2])}</li>`);
        continue;
      }

      const quoted = line.match(/^\s*>\s?(.*)$/);
      if (quoted) {
        flushParagraph();
        closeList();
        quote.push(quoted[1]);
        continue;
      }

      if (!line.trim()) {
        flushBlocks();
      } else {
        closeList();
        flushQuote();
        paragraph.push(line);
      }
    }
    flushBlocks();
    return html.join("\n");
  }

  root.MarkdownPreview = { parseMarkdown, escapeHtml };
  if (typeof module !== "undefined" && module.exports) module.exports = root.MarkdownPreview;
})(typeof window !== "undefined" ? window : globalThis);
