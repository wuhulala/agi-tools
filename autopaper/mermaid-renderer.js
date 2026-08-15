(function (root) {
  "use strict";

  let initialized = false;
  let diagramId = 0;

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
      flowchart: {
        curve: "basis",
        htmlLabels: false,
        useMaxWidth: true
      }
    });
    initialized = true;
    return true;
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
      diagram.setAttribute("role", "img");
      diagram.setAttribute("aria-label", "Mermaid diagram");
      pre.replaceWith(diagram);

      try {
        diagramId += 1;
        const result = await root.mermaid.render(`autopaper-mermaid-${diagramId}`, source, diagram);
        diagram.innerHTML = result.svg;
        result.bindFunctions?.(diagram);
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
