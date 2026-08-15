(function () {
  "use strict";

  const DEFAULT_MARKDOWN = `# 欢迎使用 AutoPaper

在左边输入 **Markdown**，右边会立即显示预览。

## 常用语法

- 标题、列表与引用
- **粗体**、*斜体*、\`行内代码\`
- [链接](https://example.com)

> 写作是把混沌整理成秩序。

\`\`\`js
const idea = "write, preview, refine";
console.log(idea);
\`\`\`
`;

  const input = document.querySelector("#markdownInput");
  const preview = document.querySelector("#preview");
  const wordCount = document.querySelector("#wordCount");
  const saveState = document.querySelector("#saveState");
  const fileInput = document.querySelector("#fileInput");
  const toast = document.querySelector("#toast");
  let saveTimer;
  let toastTimer;

  const storage = {
    get(callback) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get("markdownDraft", callback);
      } else {
        callback({ markdownDraft: localStorage.getItem("markdownDraft") });
      }
    },
    set(markdownDraft, callback) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ markdownDraft }, callback);
      } else {
        localStorage.setItem("markdownDraft", markdownDraft);
        callback();
      }
    }
  };

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1500);
  }

  function render() {
    const markdown = input.value;
    preview.innerHTML = markdown.trim()
      ? window.MarkdownPreview.parseMarkdown(markdown)
      : '<div class="empty-state"><div><span>✦</span>开始写点什么吧</div></div>';
    window.AutoPaperMermaid.render(preview);
    const count = markdown.replace(/\s/g, "").length;
    wordCount.textContent = `${count} 字`;
  }

  function save() {
    saveState.textContent = "保存中…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      storage.set(input.value, () => {
        saveState.textContent = "已保存";
      });
    }, 250);
  }

  input.addEventListener("input", () => { render(); save(); });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const start = input.selectionStart;
      input.setRangeText("  ", start, input.selectionEnd, "end");
      input.dispatchEvent(new Event("input"));
    }
  });

  document.querySelector("#openFile").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const [file] = fileInput.files;
    if (!file) return;
    input.value = await file.text();
    render();
    save();
    showToast(`已打开 ${file.name}`);
    fileInput.value = "";
  });

  document.querySelector("#clearEditor").addEventListener("click", () => {
    if (!input.value || window.confirm("确定清空当前内容吗？")) {
      input.value = "";
      render();
      save();
      input.focus();
    }
  });

  document.querySelector("#copyHtml").addEventListener("click", async () => {
    if (!input.value.trim()) return showToast("暂无可复制的内容");
    try {
      await navigator.clipboard.writeText(window.MarkdownPreview.parseMarkdown(input.value));
      showToast("HTML 已复制");
    } catch (_) {
      showToast("复制失败，请重试");
    }
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("is-active", item === tab));
      document.querySelector(".workspace").dataset.mobileView = tab.dataset.view;
    });
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector("#clearEditor").click();
    }
  });

  storage.get(({ markdownDraft }) => {
    input.value = typeof markdownDraft === "string" ? markdownDraft : DEFAULT_MARKDOWN;
    render();
    input.focus();
  });
})();
