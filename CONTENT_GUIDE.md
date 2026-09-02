# Markdown 内容维护指南

网站会在构建时自动扫描 `content/` 下的 Markdown，无需修改 React 页面代码。

## 目录与板块

| 目录 | 网页板块 | 用途 |
|---|---|---|
| `content/docs/` | 学习文档 | 讲义、知识点、补充阅读 |
| `content/labs/` | 实验资源 | 环境配置、实验指导、论文与参考资料 |
| `content/assignments/` | 课程作业 | 要求、提交方式、DDL |
| `content/scores/` | 作业得分 | 评分规则和安全的校内查询入口 |

文件名会成为页面地址的一部分，例如：

```text
content/docs/搜索算法.md
→ #/docs/搜索算法
```

## 文件模板

```markdown
---
title: 第三章：搜索算法
summary: 状态空间、BFS、DFS 与启发式搜索。
order: 3
updated: 2026-09-12
---

# 第三章：搜索算法

这里开始写正文。
```

只有 `title` 是必填项。`order` 越小，在导航中越靠前。

## 实验与作业的双 DDL

实验或作业 Markdown 可设置 Soft DDL 和 Hard DDL：

```yaml
softDeadline: 2026-10-16T23:59:00+08:00
hardDeadline: 2026-10-18T23:59:00+08:00
points: 100
status: 进行中
```

`softDeadline` 用于奖励提前提交，`hardDeadline` 是最终截止时间。主页会同时展示两个时间，但倒计时只以 `hardDeadline` 为准，并在作业日历中列出实验和作业。原有的 `deadline` 字段仍可使用，会被视为 Hard DDL。

## 外部入口

需要跳转到校内成绩系统、Kaggle 或其他平台时：

```yaml
externalUrl: https://your-school.example/gradebook
```

请勿把访问令牌、密码、学号或个人成绩写入 Markdown。

## 上传 PDF 学习资料

把 PDF 文件放进 `public/files/docs/`，然后在对应的学习文档 Markdown 头部添加：

```yaml
pdfUrl: files/docs/第一章-人工智能概述.pdf
pdfLabel: 第一章课程讲义（PDF）
```

网页会自动显示“下载 PDF”卡片。`pdfLabel` 可以省略；文件名建议只使用中文、英文、数字、短横线和下划线。

同一篇文档需要提供多个 PDF 时，请使用 `pdfs` 列表，它们会显示在同一个下载卡片中：

```yaml
pdfs:
  - url: files/docs/第一次实验指导.pdf
    label: 第一次实验指导书
  - url: files/docs/第一次实验补充材料.pdf
    label: 第一次实验补充材料
  - url: files/docs/数据集说明.pdf
    label: 数据集说明
```

不要重复填写多个 `pdfUrl`，因为 YAML 的同名字段可能只保留最后一个。旧的单文件 `pdfUrl/pdfLabel` 写法仍然兼容。

也可以链接已经放在其他网站上的 PDF：

```yaml
pdfUrl: https://example.edu/course/chapter-1.pdf
```

请确认外部链接允许学生访问。GitHub 对单个文件有大小限制，较大的课程视频或数据集建议使用学校网盘或对象存储。

## 上传 ZIP 课程资料包

把 ZIP 文件放进 `public/files/packages/`，然后在对应的学习文档 Markdown 头部添加：

```yaml
zipUrl: files/packages/第一次实验资料包.zip
zipLabel: 第一次实验代码与数据
```

网页会自动显示“下载 ZIP”卡片。同一篇 Markdown 可以同时设置 `pdfUrl` 和 `zipUrl`。也支持将 `zipUrl` 写成可公开访问的完整外部链接。

## 支持的 Markdown

支持标题、列表、引用、链接、图片、代码块、表格、删除线等 GitHub Flavored Markdown。Markdown 转换后的 HTML 会在浏览器中再次清理，以避免插入危险脚本。

## 发布更新

新增或修改 Markdown 后提交到 `main` 分支。GitHub Actions 会自动重新生成内容索引、构建网站并更新 GitHub Pages。
