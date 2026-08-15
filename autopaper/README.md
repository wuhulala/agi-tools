# AutoPaper — Local Markdown Reader

一个不依赖网络的 Chrome / Edge Manifest V3 插件。直接打开本地 Markdown 文件即可获得带目录的阅读视图，也支持在插件弹窗中实时编辑、自动保存草稿和复制渲染后的 HTML。

## 安装

1. 打开 Chrome 的 `chrome://extensions/`（Edge 使用 `edge://extensions/`）。
2. 开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本目录 `tools/markdown-preview-extension/`。
5. 在插件详情中开启“允许访问文件网址”。
6. 重新加载已经打开的 `.md` 页面，或点击工具栏中的 AutoPaper 图标使用编辑器。

> 修改插件文件后，需要在扩展管理页点击一次“重新加载”。本地文件权限是 Chrome 的安全要求；未开启时，插件无法接管 `file://` 页面。

## 两种用法

- **直接阅读**：在浏览器中打开本地 `.md` 文件，插件会自动生成目录、阅读进度、源码切换和打印视图，并隐藏 Obsidian frontmatter。
- **临时编辑**：点击插件图标，粘贴 Markdown 或打开文件，在双栏中实时预览。

## 支持的语法

- 六级标题、段落、粗体、斜体、删除线、行内代码
- 有序/无序列表、任务列表、引用、分隔线
- 代码块、链接、图片、简单表格

所有解析都在浏览器本地完成。草稿通过 `chrome.storage.local` 保存在当前浏览器配置中。

## 隐私

AutoPaper 不收集、上传、出售或共享任何用户数据。Markdown 内容只在浏览器本地解析；弹窗草稿只保存在当前设备的 `chrome.storage.local`。完整说明见 [`store-assets/privacy-policy.md`](store-assets/privacy-policy.md)。
