# PDF 资料目录

将课程 PDF 文件放在这里，并在 `content/docs/` 中对应 Markdown 的 frontmatter 添加：

```yaml
pdfUrl: files/docs/你的文件名.pdf
pdfLabel: 显示给学生的资料名称
```

多个 PDF 请使用：

```yaml
pdfs:
  - url: files/docs/文件一.pdf
    label: 第一份资料
  - url: files/docs/文件二.pdf
    label: 第二份资料
```
