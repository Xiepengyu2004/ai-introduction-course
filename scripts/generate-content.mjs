import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const outputDir = path.join(root, 'public', 'content');
const outputFile = path.join(outputDir, 'index.json');
const validSections = new Set(['docs', 'labs', 'assignments', 'scores']);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(fullPath);
  }
  return files;
}

const files = await walk(contentRoot);
const records = [];

for (const file of files) {
  const relative = path.relative(contentRoot, file).replaceAll('\\', '/');
  const [section, ...rest] = relative.split('/');
  if (!validSections.has(section)) throw new Error(`Unsupported content section in ${relative}`);

  const slug = rest.join('/').replace(/\.md$/i, '');
  const raw = await fs.readFile(file, 'utf8');
  const { data, content } = matter(raw);
  if (!data.title) throw new Error(`Missing title in ${relative}`);

  records.push({
    id: `${section}/${slug}`,
    section,
    slug,
    title: String(data.title),
    summary: String(data.summary ?? ''),
    order: Number(data.order ?? 999),
    updated: data.updated ? String(data.updated) : null,
    deadline: data.deadline ? String(data.deadline) : null,
    points: data.points == null ? null : Number(data.points),
    status: data.status ? String(data.status) : null,
    externalUrl: data.externalUrl ? String(data.externalUrl) : null,
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : null,
    pdfLabel: data.pdfLabel ? String(data.pdfLabel) : null,
    zipUrl: data.zipUrl ? String(data.zipUrl) : null,
    zipLabel: data.zipLabel ? String(data.zipLabel) : null,
    content,
  });
}

records.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'zh-CN'));
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`, 'utf8');
console.log(`Generated ${records.length} Markdown records.`);
