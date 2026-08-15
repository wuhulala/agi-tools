(function (root) {
  "use strict";

  let initialized = false;
  let diagramId = 0;
  let viewer;
  let viewerCanvas;
  let viewerSvg;
  let zoom = 1;

  function initialize() {
    if (initialized || !root.mermaid) return Boolean(root.mermaid);
    root.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "base",
      themeVariables: {
        background: "#fffdf7",
        primaryColor: "#f5f1e8",
        primaryTextColor: "#23231f",
        primaryBorderColor: "#77766d",
        secondaryColor: "#ece6da",
        tertiaryColor: "#fffaf0",
        lineColor: "#df5535",
        textColor: "#23231f",
        fontFamily: "Georgia, 'Noto Serif SC', serif"
      },
      flowchart: { curve: "basis", htmlLabels: false, useMaxWidth: true }
    });
    initialized = true;
    return true;
  }

  function safeFileName(index, extension) {
    const title = document.title.replace(/\s*[·|—-].*$/, "").trim() || "AutoPaper";
    return `${title.replace(/[\\/:*?"<>|]/g, "-")}-diagram-${index}.${extension}`;
  }

  function triggerDownload(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function serializeSvg(svg) {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  }

  function downloadSvg(svg, index) {
    triggerDownload(new Blob([serializeSvg(svg)], { type: "image/svg+xml;charset=utf-8" }), safeFileName(index, "svg"));
  }

  async function downloadPng(svg, index) {
    const viewBox = svg.viewBox && svg.viewBox.baseVal;
    const baseWidth = viewBox && viewBox.width ? viewBox.width : Math.max(640, svg.getBoundingClientRect().width);
    const baseHeight = viewBox && viewBox.height ? viewBox.height : Math.max(360, svg.getBoundingClientRect().height);
    const exportSvg = svg.cloneNode(true);
    exportSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    exportSvg.setAttribute("width", String(baseWidth));
    exportSvg.setAttribute("height", String(baseHeight));
    const serialized = new XMLSerializer().serializeToString(exportSvg);
    const image = new Image();
    image.decoding = "async";
    // A Blob URL loaded by a file:// page taints Chrome's canvas. An inline data URL stays exportable.
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
    await image.decode();

    const scale = Math.min(2, 8192 / Math.max(baseWidth, baseHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(baseWidth * scale);
    canvas.height = Math.ceil(baseHeight * scale);
    const context = canvas.getContext("2d");
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) triggerDownload(blob, safeFileName(index, "png"));
  }

  function applyZoom(nextZoom) {
    zoom = Math.min(4, Math.max(0.5, nextZoom));
    if (viewerSvg) {
      viewerSvg.style.width = `${zoom * 100}%`;
      viewerSvg.style.maxWidth = "none";
      viewerSvg.style.height = "auto";
    }
    const value = viewer && viewer.querySelector(".autopaper-mermaid-zoom-value");
    if (value) value.textContent = `${Math.round(zoom * 100)}%`;
  }

  function ensureViewer() {
    if (viewer) return viewer;
    viewer = document.createElement("dialog");
    viewer.className = "autopaper-mermaid-viewer";
    viewer.innerHTML = `
      <div class="autopaper-mermaid-viewer-bar">
        <strong>DIAGRAM VIEWER</strong>
        <div>
          <button type="button" data-viewer-action="out" aria-label="缩小">−</button>
          <span class="autopaper-mermaid-zoom-value">100%</span>
          <button type="button" data-viewer-action="in" aria-label="放大">＋</button>
          <button type="button" data-viewer-action="fit">适应</button>
          <button type="button" data-viewer-action="fullscreen">全屏</button>
          <button type="button" data-viewer-action="close">关闭</button>
        </div>
      </div>
      <div class="autopaper-mermaid-viewer-canvas"></div>`;
    document.body.appendChild(viewer);
    viewerCanvas = viewer.querySelector(".autopaper-mermaid-viewer-canvas");
    viewer.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-viewer-action]")?.dataset.viewerAction;
      if (!action) return;
      if (action === "in") applyZoom(zoom + 0.25);
      if (action === "out") applyZoom(zoom - 0.25);
      if (action === "fit") applyZoom(1);
      if (action === "fullscreen") {
        try { await viewer.requestFullscreen(); } catch (_) { /* Dialog remains as the fallback. */ }
      }
      if (action === "close") viewer.close();
    });
    viewer.addEventListener("close", () => {
      if (document.fullscreenElement === viewer) document.exitFullscreen().catch(() => {});
    });
    return viewer;
  }

  async function openViewer(svg, initialZoom, fullscreen) {
    const dialog = ensureViewer();
    viewerCanvas.replaceChildren(svg.cloneNode(true));
    viewerSvg = viewerCanvas.querySelector("svg");
    applyZoom(initialZoom);
    if (!dialog.open) dialog.showModal();
    if (fullscreen) {
      try { await dialog.requestFullscreen(); } catch (_) { /* Dialog remains as the fallback. */ }
    }
  }

  function addControls(diagram, svg, index) {
    const toolbar = document.createElement("div");
    toolbar.className = "autopaper-mermaid-toolbar";
    toolbar.innerHTML = `
      <button type="button" data-diagram-action="zoom">放大</button>
      <button type="button" data-diagram-action="fullscreen">全屏</button>
      <button type="button" data-diagram-action="svg">下载 SVG</button>
      <button type="button" data-diagram-action="png">下载 PNG</button>`;
    diagram.prepend(toolbar);
    toolbar.addEventListener("click", (event) => {
      const action = event.target.closest("[data-diagram-action]")?.dataset.diagramAction;
      if (action === "zoom") openViewer(svg, 1.5, false);
      if (action === "fullscreen") openViewer(svg, 1, true);
      if (action === "svg") downloadSvg(svg, index);
      if (action === "png") downloadPng(svg, index).catch((error) => console.error("AutoPaper PNG export failed", error));
    });
  }

  async function render(container) {
    const blocks = [...container.querySelectorAll("pre > code.language-mermaid")];
    if (!blocks.length || !initialize()) return;

    for (const code of blocks) {
      if (!code.isConnected) continue;
      const source = code.textContent;
      const pre = code.parentElement;
      const diagram = document.createElement("div");
      diagram.className = "autopaper-mermaid";
      diagram.setAttribute("role", "figure");
      diagram.setAttribute("aria-label", "Mermaid diagram");
      pre.replaceWith(diagram);

      try {
        diagramId += 1;
        const index = diagramId;
        const canvas = document.createElement("div");
        canvas.className = "autopaper-mermaid-canvas";
        diagram.appendChild(canvas);
        const result = await root.mermaid.render(`autopaper-mermaid-${index}`, source, canvas);
        canvas.innerHTML = result.svg;
        result.bindFunctions?.(canvas);
        addControls(diagram, canvas.querySelector("svg"), index);
      } catch (_) {
        diagram.classList.add("autopaper-mermaid-error");
        const label = document.createElement("strong");
        label.textContent = "Mermaid 图表语法有误";
        const fallback = document.createElement("pre");
        const fallbackCode = document.createElement("code");
        fallbackCode.textContent = source;
        fallback.appendChild(fallbackCode);
        diagram.replaceChildren(label, fallback);
      }
    }
  }

  root.AutoPaperMermaid = { render };
})(typeof window !== "undefined" ? window : globalThis);
