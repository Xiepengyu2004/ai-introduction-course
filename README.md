# 人工智能导论课程作业站

一个适合托管在 GitHub Pages 的静态课程网站，包含：

- 学习文档
- 实验介绍
- 课程作业与 DDL 倒计时
- 评分规则和成绩查询入口
- 全站 Markdown 搜索与自动导航
- PDF 课程资料上传与下载

## 本地预览

需要 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

浏览器打开终端显示的本地地址。修改 `content/` 后，需要重新运行 `npm run content` 或重启开发服务，才会更新内容索引。

## 构建

```bash
npm run build
npm run preview
```

生成的网站位于 `dist/`。资源使用相对路径、页面使用 hash 路由，因此既支持用户主页仓库，也支持普通项目仓库的 GitHub Pages 子路径。

## 部署到 GitHub Pages

### 1. 创建仓库

在 GitHub 新建一个仓库，例如 `ai-introduction-course`。不要勾选自动创建 README，以免首次推送产生冲突。

### 2. 上传项目

在本目录执行：

```bash
git init
git add .
git commit -m "Initial course website"
git branch -M main
git remote add origin https://github.com/你的用户名/ai-introduction-course.git
git push -u origin main
```

也可以直接在 GitHub 网页上传本目录中的文件，但必须保留 `.github/workflows/deploy-pages.yml`。

### 3. 启用 GitHub Pages

1. 打开仓库的 `Settings`。
2. 进入 `Pages`。
3. 在 `Build and deployment` 的 Source 中选择 `GitHub Actions`。
4. 回到 `Actions`，等待 `Deploy course site to GitHub Pages` 变为绿色。

部署地址通常是：

```text
https://你的用户名.github.io/ai-introduction-course/
```

### 4. 后续更新

以后只需修改或增加 `content/` 下的 Markdown，然后提交到 `main`：

```bash
git add content
git commit -m "Update course materials"
git push
```

网站会自动重新部署。

## 内容维护

详见 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)。

PDF 文件放在 `public/files/docs/`，通过 `pdfUrl` 关联；ZIP 资料包放在 `public/files/packages/`，通过 `zipUrl` 关联。推送后文件会和网站一起发布，学生可以直接下载。

## 成绩隐私

GitHub Pages 是公开静态网站，不适合存储个人成绩。`作业得分` 板块仅展示评分规则和校内成绩系统入口；真实成绩应保存在教务系统、课程 LMS 或 Gradescope 等有身份验证的平台。
