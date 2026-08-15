# AutoPaper Chrome Web Store Listing

## Product identity

- Name: `AutoPaper — Local Markdown Reader`
- Category: `Productivity`
- Language: English (default), Chinese (Simplified)
- Visibility: Public, all regions

## English summary

Turn local Markdown files into calm, readable pages. Edit and preview Markdown entirely offline.

## English description

AutoPaper turns local Markdown files into carefully typeset reading pages—right in your browser.

Open any `.md` or `.markdown` file to get:

- a clean long-form reading layout;
- an automatically generated table of contents;
- reading progress, source view, and print support;
- frontmatter hidden from the reading view;
- headings, lists, quotes, code blocks, tables, links, and images.

Click the AutoPaper toolbar icon when you want a lightweight editor with live preview, local draft saving, file import, and rendered HTML copy.

AutoPaper works offline. It has no account, analytics, ads, remote scripts, or developer server. Your Markdown and drafts stay in your browser profile. After installation, enable “Allow access to file URLs” on the extension details page so AutoPaper can render local Markdown files.

## 中文摘要

将本地 Markdown 自动排版为清爽阅读页，也可完全离线地编辑和实时预览。

## 中文说明

AutoPaper 把浏览器中直接打开的 `.md` 或 `.markdown` 文件自动排版为适合长文阅读的页面，提供目录、阅读进度、源码切换、打印，并隐藏 Obsidian frontmatter。

点击工具栏图标，还可使用轻量双栏编辑器：实时预览、打开本地文件、自动保存草稿并复制渲染后的 HTML。

AutoPaper 完全离线运行，没有账号、广告、分析脚本或开发者服务器。Markdown 内容和草稿不会离开当前浏览器。安装后请在扩展详情中开启“允许访问文件网址”。

## Single purpose

Render and preview user-selected local Markdown content entirely within the browser.

## Permission justifications

- `storage`: Stores only the user's popup editor draft in `chrome.storage.local` so it is restored between sessions.
- `file:///*`: Required to detect and render local files ending in `.md` or `.markdown`. Access is used only after the user enables Chrome's “Allow access to file URLs” setting; all other local file types are ignored.

## Data disclosures

- Handles user-generated Markdown content locally: Yes.
- Collects or transmits data to the developer or third parties: No.
- Sells data, uses data for advertising, credit, or unrelated purposes: No.
- Remote code: No.
- Privacy policy URL: required before submission; publish `privacy-policy.md` at a stable public HTTPS URL.

## Reviewer instructions

1. Open the extension details page and enable “Allow access to file URLs”.
2. Open a local file ending in `.md` or `.markdown`; AutoPaper replaces the raw text with a reading view.
3. Click the toolbar icon to test the offline editor and live preview.
4. No login or test credentials are required.
