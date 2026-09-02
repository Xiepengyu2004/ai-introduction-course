import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import {
  Archive, ArrowRight, BookOpen, CalendarDays, ChevronRight, ClipboardCheck, Clock3,
  Download, ExternalLink, FileText, FlaskConical, GraduationCap, Home, Menu,
  Search, ShieldCheck, TimerReset, X,
} from 'lucide-react';
import type { ContentIndex, CourseRecord, SectionId } from './types';

const sectionMeta: Record<SectionId, {
  label: string; eyebrow: string; description: string; icon: typeof BookOpen; tone: string;
}> = {
  docs: { label: '学习文档', eyebrow: 'LEARN', description: '课程讲义、知识地图与补充阅读', icon: BookOpen, tone: 'teal' },
  labs: { label: '实验资源', eyebrow: 'LABS', description: '环境配置、实验指导、论文与参考资料', icon: FlaskConical, tone: 'blue' },
  assignments: { label: '课程作业', eyebrow: 'WORK', description: '作业要求、截止时间与提交说明', icon: ClipboardCheck, tone: 'amber' },
  scores: { label: '作业得分', eyebrow: 'SCORES', description: '评分规则、成绩查询与复核流程', icon: GraduationCap, tone: 'slate' },
};

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '') || '';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

function routeFor(record: CourseRecord) { return `#/${record.id}`; }

function hardDeadlineOf(record: CourseRecord) {
  return record.hardDeadline ?? record.deadline;
}

function assetUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${import.meta.env.BASE_URL}${value.replace(/^\.?\//, '')}`;
}

function formatDate(value: string | null, includeTime = false) {
  if (!value) return '待公布';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short', day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(date);
}

function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = Math.max(0, new Date(deadline).getTime() - now);
  const units = [
    ['天', Math.floor(remaining / 86_400_000)],
    ['时', Math.floor((remaining / 3_600_000) % 24)],
    ['分', Math.floor((remaining / 60_000) % 60)],
    ['秒', Math.floor((remaining / 1000) % 60)],
  ] as const;
  if (remaining === 0) return <strong className="deadline-finished">本次作业已截止</strong>;
  return <div className="countdown" aria-label="距离截止时间">
    {units.map(([label, value]) => <span className="countdown-unit" key={label}>
      <strong>{String(value).padStart(2, '0')}</strong><small>{label}</small>
    </span>)}
  </div>;
}

function Header({ records, onMenu }: { records: CourseRecord[]; onMenu: () => void }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return records.filter((r) => `${r.title} ${r.summary}`.toLowerCase().includes(normalized)).slice(0, 6);
  }, [query, records]);
  return <header className="topbar">
    <button className="icon-button mobile-only" type="button" onClick={onMenu} aria-label="打开导航"><Menu size={20} /></button>
    <a className="brand" href="#/" aria-label="返回课程主页">
      <span className="brand-mark">AI</span><span><strong>人工智能导论</strong><small>课程作业站</small></span>
    </a>
    <div className="search-wrap">
      <Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索课程内容…" aria-label="搜索课程内容" />
      {matches.length > 0 && <div className="search-results">{matches.map((r) =>
        <a key={r.id} href={routeFor(r)} onClick={() => setQuery('')}><span>{r.title}</span><small>{sectionMeta[r.section].label}</small></a>
      )}</div>}
    </div>
  </header>;
}

function Sidebar({ records, open, onClose }: { records: CourseRecord[]; open: boolean; onClose: () => void }) {
  return <>
    {open && <button className="nav-scrim" type="button" onClick={onClose} aria-label="关闭导航" />}
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-mobile-head"><strong>课程导航</strong><button className="icon-button" type="button" onClick={onClose} aria-label="关闭导航"><X size={19} /></button></div>
      <nav>
        <a className="nav-home" href="#/" onClick={onClose}><Home size={17} />课程首页</a>
        {(Object.keys(sectionMeta) as SectionId[]).map((section) => {
          const meta = sectionMeta[section]; const Icon = meta.icon;
          const items = records.filter((record) => record.section === section);
          return <div className="nav-group" key={section}>
            <div className="nav-heading"><Icon size={16} /><span>{meta.label}</span><small>{items.length}</small></div>
            {items.map((record) => <a href={routeFor(record)} onClick={onClose} key={record.id}>{record.title}</a>)}
          </div>;
        })}
      </nav>
    </aside>
  </>;
}

function HomePage({ records }: { records: CourseRecord[] }) {
  const [now] = useState(() => Date.now());
  const deadlineRecords = records.filter((record) =>
    (record.section === 'assignments' || record.section === 'labs') && hardDeadlineOf(record));
  const nextAssignment = deadlineRecords.filter((r) => new Date(hardDeadlineOf(r)!).getTime() > now)
    .sort((a, b) => new Date(hardDeadlineOf(a)!).getTime() - new Date(hardDeadlineOf(b)!).getTime())[0];
  const nextHardDeadline = nextAssignment ? hardDeadlineOf(nextAssignment) : null;
  const firstDoc = records.find((record) => record.section === 'docs');
  const firstLab = records.find((record) => record.section === 'labs');
  return <div className="home-page">
    <section className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">2026 · INTRODUCTION TO AI</p>
        <h1>从这里开始你的人工智能学习生涯</h1>
        <div className="hero-actions">
          <a className="primary-button" href={firstDoc ? routeFor(firstDoc) : '#/'}>开始学习 <ArrowRight size={17} /></a>
          <a className="text-button" href={firstLab ? routeFor(firstLab) : '#/'}>查看实验安排</a>
        </div>
      </div>
      <div className="hero-symbol" aria-hidden="true">
        <div className="orbit orbit-a"><span /></div><div className="orbit orbit-b"><span /></div>
        <div className="core-node">AI</div><span className="node n1" /><span className="node n2" /><span className="node n3" />
      </div>
    </section>
    <section className="deadline-card">
      <div className="deadline-copy"><span className="deadline-icon"><Clock3 size={22} /></span><div>
        <p className="eyebrow">NEXT DEADLINE</p><h2>{nextAssignment?.title ?? '近期暂无截止任务'}</h2>
        {nextAssignment ? <div className="dual-deadline-summary">
          {nextAssignment.softDeadline && <span><b>Soft DDL</b>{formatDate(nextAssignment.softDeadline, true)}</span>}
          {nextHardDeadline && <span><b>Hard DDL</b>{formatDate(nextHardDeadline, true)}</span>}
        </div> : <p>新的实验或作业安排将在这里自动显示</p>}
      </div></div>
      {nextHardDeadline ? <Countdown deadline={nextHardDeadline} /> : <span className="no-deadline"><TimerReset size={18} /> 可以安心学习</span>}
      {nextAssignment && <a className="round-link" href={routeFor(nextAssignment)} aria-label="查看作业"><ChevronRight size={20} /></a>}
    </section>
    <section className="section-block">
      <div className="section-title-row"><div><p className="eyebrow">COURSE HUB</p><h2>课程资源</h2></div><span>{records.length} 篇内容</span></div>
      <div className="portal-grid">{(Object.keys(sectionMeta) as SectionId[]).map((section) => {
        const meta = sectionMeta[section]; const Icon = meta.icon;
        const first = records.find((record) => record.section === section);
        return <a className={`portal-card tone-${meta.tone}`} href={first ? routeFor(first) : '#/'} key={section}>
          <div className="portal-icon"><Icon size={22} /></div><p>{meta.eyebrow}</p><h3>{meta.label}</h3><span>{meta.description}</span>
          <b>{records.filter((record) => record.section === section).length} 项 <ArrowRight size={15} /></b>
        </a>;
      })}</div>
    </section>
    <section className="home-columns">
      <div className="content-panel"><div className="panel-heading"><div><FileText size={19} /><h2>最近更新</h2></div><small>按课程顺序</small></div>
        <div className="record-list">{records.slice(0, 5).map((record) => <a href={routeFor(record)} key={record.id}>
          <span className={`record-dot tone-${sectionMeta[record.section].tone}`} /><div><strong>{record.title}</strong><small>{record.summary}</small></div>
          <time>{formatDate(record.updated)}</time><ChevronRight size={17} />
        </a>)}</div>
      </div>
      <div className="content-panel schedule-panel"><div className="panel-heading"><div><CalendarDays size={19} /><h2>作业日历</h2></div></div>
        {deadlineRecords.length ? deadlineRecords.map((record) => <a href={routeFor(record)} className="schedule-item" key={record.id} aria-label={`查看${record.title}`}>
          <time><strong>{hardDeadlineOf(record) ? new Date(hardDeadlineOf(record)!).getDate() : '--'}</strong><span>日</span></time>
          <div><strong>{record.title}</strong><small>{record.softDeadline ? `Soft ${formatDate(record.softDeadline, true)} · ` : ''}Hard {formatDate(hardDeadlineOf(record), true)}</small></div>
        </a>) : <p className="empty-copy">实验或作业增加 hardDeadline 后会显示在这里。</p>}
      </div>
    </section>
  </div>;
}

function MarkdownPage({ record }: { record: CourseRecord }) {
  const meta = sectionMeta[record.section];
  const html = useMemo(() => DOMPurify.sanitize(String(marked.parse(record.content, { async: false, gfm: true }))), [record.content]);
  const pdfFiles = record.pdfs?.length
    ? record.pdfs
    : record.pdfUrl ? [{ url: record.pdfUrl, label: record.pdfLabel ?? `${record.title} PDF` }] : [];
  return <article className="markdown-page">
    <header className={`document-header tone-${meta.tone}`}><p className="eyebrow">{meta.eyebrow} · {meta.label}</p><h1>{record.title}</h1><p>{record.summary}</p>
      <div className="document-meta">
        {record.updated && <span><CalendarDays size={15} /> 更新于 {formatDate(record.updated)}</span>}
        {record.softDeadline && <span><Clock3 size={15} /> Soft DDL：{formatDate(record.softDeadline, true)}</span>}
        {hardDeadlineOf(record) && <span><Clock3 size={15} /> Hard DDL：{formatDate(hardDeadlineOf(record), true)}</span>}
        {record.points != null && <span><ClipboardCheck size={15} /> {record.points} 分</span>}
        {record.externalUrl && <a href={record.externalUrl} target="_blank" rel="noreferrer">外部入口 <ExternalLink size={14} /></a>}
      </div>
    </header>
    {pdfFiles.length > 0 && <section className="download-card multi-download-card">
      <div className="download-icon"><FileText size={24} /></div>
      <div className="download-content"><p className="eyebrow">PDF MATERIALS</p><strong>课程 PDF 资料</strong><span>共 {pdfFiles.length} 个文件，可分别下载并离线阅读。</span>
        <div className="download-list">{pdfFiles.map((file) =>
          <a href={assetUrl(file.url)} download target="_blank" rel="noreferrer" key={file.url}><FileText size={15} /><span>{file.label}</span><Download size={16} /></a>
        )}</div>
      </div>
    </section>}
    {record.zipUrl && <section className="download-card package-card">
      <div className="download-icon"><Archive size={24} /></div>
      <div><p className="eyebrow">COURSE PACKAGE</p><strong>{record.zipLabel ?? `${record.title} 课程资料包`}</strong><span>包含代码、数据或实验素材，下载后请先解压。</span></div>
      <a href={assetUrl(record.zipUrl)} download><Download size={17} /> 下载 ZIP</a>
    </section>}
    {record.section === 'scores' && <div className="privacy-banner"><ShieldCheck size={20} /><div><strong>成绩隐私提示</strong><p>公开网页只展示评分规则和查询入口，请勿将学号、姓名或个人成绩提交到公开 GitHub 仓库。</p></div></div>}
    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
  </article>;
}

export default function App() {
  const route = useHashRoute();
  const [records, setRecords] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}content/index.json`).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<ContentIndex>;
    }).then((data) => setRecords(data.records))
      .catch(() => setError('课程内容加载失败，请刷新页面或检查 content 构建步骤。'))
      .finally(() => setLoading(false));
  }, []);
  const active = records.find((record) => record.id === decodeURIComponent(route));
  return <div className="site-shell">
    <Header records={records} onMenu={() => setMenuOpen(true)} />
    <Sidebar records={records} open={menuOpen} onClose={() => setMenuOpen(false)} />
    <main className="main-content">
      {loading && <div className="state-card">正在加载课程内容…</div>}
      {error && <div className="state-card error-state">{error}</div>}
      {!loading && !error && (route === '' ? <HomePage records={records} /> : active ? <MarkdownPage record={active} /> :
        <div className="state-card not-found"><h1>没有找到这篇内容</h1><p>它可能已被移动，或尚未发布。</p><a href="#/">返回课程首页</a></div>)}
    </main>
    <footer className="site-footer"><span>人工智能导论 · 课程教学网站</span><span>Markdown 驱动 · GitHub Pages 托管</span></footer>
  </div>;
}
