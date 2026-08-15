"use strict";

const assert = require("node:assert/strict");
const { parseMarkdown } = require("./markdown.js");

const rendered = parseMarkdown(`# 标题

这是 **粗体** 和 \`code\`。

- 第一项
- [x] 已完成

| 名称 | 状态 |
| --- | --- |
| 预览 | 可用 |

\`\`\`js
const value = "<safe>";
\`\`\``);

assert.match(rendered, /<h1>标题<\/h1>/);
assert.match(rendered, /<strong>粗体<\/strong>/);
assert.match(rendered, /<code>code<\/code>/);
assert.match(rendered, /<ul>/);
assert.match(rendered, /checkbox" disabled checked/);
assert.match(rendered, /<table>/);
assert.match(rendered, /&lt;safe&gt;/);

const unsafe = parseMarkdown('<script>alert(1)</script> [x](javascript:alert(1))');
assert.doesNotMatch(unsafe, /<script>/);
assert.doesNotMatch(unsafe, /href="javascript:/);

const relative = parseMarkdown("[本地笔记](./下一篇.md)");
assert.match(relative, /href="\.\/下一篇\.md"/);

const mermaid = parseMarkdown("```mermaid\nflowchart LR\n  A --> B\n```");
assert.match(mermaid, /<code class="language-mermaid">/);
assert.match(mermaid, /flowchart LR/);

console.log("markdown parser tests passed");
