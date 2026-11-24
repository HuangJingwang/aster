import Link from 'next/link';
import { EditorialImage } from './EditorialImage';
import { ArrowRight, ArrowUpRight, Braces } from 'lucide-react';
import type { SiteContentItem } from '@/lib/content-types';
import { getHomeArticleHeading } from '@/lib/editorial-home';
import { getContentCover } from '@/lib/content-cover';
import type { SiteSocialLink } from '@/lib/settings';
import { getContentHref } from '@/lib/content-routing';
import { HeroCharacter } from './EditorialMotion';

const homeEntries = [
  { href: '/moments', label: '值得收藏', description: 'React Bits、Pipecat 与更多发现' },
  { href: '/notes', label: '笔记', description: '零散的想法与技术片段' },
  { href: '/leetcode', label: '刷题日记', description: '练习、复盘与学习记录' },
  { href: '/archives', label: '归档', description: '沿着时间回看所有内容' },
];

export function EditorialHome({ articles, projects, socialLinks = [] }: { articles: SiteContentItem[]; projects: SiteContentItem[]; socialLinks?: SiteSocialLink[] }) {
  return <main id="main-content" tabIndex={-1} className="editorial-home editorial-home--compact">
    <section className="editorial-hero" aria-labelledby="home-title">
      <h1 id="home-title" aria-label="Aster，Aster.H 的个人博客"><span aria-hidden="true">ASTER<span className="editorial-period">.</span></span></h1>
      <HeroCharacter />
      <div className="editorial-hero__intro"><p>你好，我是 Aster.H。</p><p>写代码，也写下思考。<br />这里收藏实践、项目和沿途的发现。</p><div className="editorial-hero__actions"><Link className="editorial-action" href="/posts">开始阅读 <ArrowUpRight size={19} /></Link>{socialLinks.length > 0 && <nav className="editorial-social" aria-label="社交主页">{socialLinks.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label}（在新标签页打开）`}><SocialIcon href={link.href} /><span>{link.label}</span><ArrowUpRight size={14} aria-hidden="true" /></a>)}</nav>}</div></div>
    </section>
    <div className="home-feature-grid">
      <section className="home-feature-column" id="latest" aria-labelledby="latest-title">
        <div className="home-feature-heading"><h2 id="latest-title">最近文章</h2><Link href="/posts">全部文章 <ArrowUpRight aria-hidden="true" /></Link></div>
        {articles.map(item => <FeaturedArticle key={item.id} item={item} />)}
        {!articles.length && <p className="editorial-empty">还没有公开文章。</p>}
      </section>
      <section className="home-feature-column" id="projects" aria-labelledby="projects-title">
        <div className="home-feature-heading"><h2 id="projects-title">个人项目</h2><Link href="/projects">全部项目 <ArrowUpRight aria-hidden="true" /></Link></div>
        {projects.map(item => <FeaturedProject key={item.id} item={item} />)}
        {!projects.length && <p className="editorial-empty">还没有公开项目。</p>}
      </section>
    </div>
    <nav className="home-feature-entries" aria-label="更多栏目">{homeEntries.map(entry => <Link key={entry.href} id={entry.href === '/moments' ? 'recommendations' : undefined} href={entry.href}><span>{entry.label}</span><ArrowUpRight aria-hidden="true" /><p>{entry.description}</p></Link>)}</nav>
  </main>;
}

function FeaturedArticle({ item }: { item: SiteContentItem }) {
  const heading = getHomeArticleHeading(item);
  const cover = getContentCover(item);
  return <Link className="home-feature-article" href={getContentHref(item)} aria-label={item.title}>
    <div className="home-feature-article-top"><span className="home-feature-series">{heading.kicker}</span>{heading.issue && <span className="home-feature-issue" aria-label={`系列第 ${heading.issue} 篇`}><b>{heading.issue}</b></span>}</div>
    <div className={`home-feature-title-row${cover ? ' home-feature-title-row--with-cover' : ' home-feature-title-row--text'}`}>
      <h3>{heading.title}</h3>
      {cover && <span className="home-feature-cover"><EditorialImage src={cover.thumbnailUrl ?? cover.imageUrl} alt={cover.altText} width="150" height="110" loading="lazy" decoding="async" /></span>}
    </div>
    {item.summary && <p className="home-feature-summary">{item.summary}</p>}
    <div className="home-feature-article-foot"><time className="home-feature-article-date" dateTime={item.publishedAt}>{item.publishedAt.slice(0, 10).replaceAll('-', '.')}</time><span className="home-feature-reading-link">阅读全文<span className="home-feature-circle"><ArrowRight aria-hidden="true" /></span></span></div>
  </Link>;
}

function FeaturedProject({ item }: { item: SiteContentItem }) {
  const stack = item.project?.stack ?? [];
  const isMicronaut = item.slug === 'easy-yapi-micronaut';
  const cover = getContentCover(item);
  return <Link className="home-feature-project" href={getContentHref(item)} aria-label={item.title}>
    <div className="home-feature-project-top"><span className="home-feature-project-kicker"><Braces aria-hidden="true" />{isMicronaut ? '开发工具' : '个人项目'}</span><span className="home-feature-project-type">{isMicronaut ? 'MICRONAUT × EASY-YAPI' : stack.slice(0, 2).join(' × ')}</span></div>
    <h3>{item.title}</h3>
    {item.summary && <p className="home-feature-project-summary">{item.summary}</p>}
    {isMicronaut ? <div className="home-feature-diagram" role="img" aria-label="Micronaut 注解转换为 API 文档">
      <div className="home-feature-code" aria-hidden="true"><div className="home-feature-code-top">Micronaut</div><code>@Controller<br />@Get</code></div>
      <span className="home-feature-flow-arrow" aria-hidden="true"><ArrowRight /></span>
      <div className="home-feature-doc" aria-hidden="true"><strong>API</strong><div className="home-feature-doc-line" /><div className="home-feature-doc-line" /><small>接口文档</small></div>
    </div> : cover ? <div className="home-feature-project-cover"><EditorialImage src={cover.imageUrl} alt={cover.altText} width="112" height="112" loading="lazy" /></div> : <div className="home-feature-project-placeholder" aria-hidden="true"><Braces /></div>}
    <div className="home-feature-project-foot"><span className="home-feature-stack">{stack.slice(0, 3).join(' · ')}</span><span className="home-feature-project-link">了解项目<ArrowUpRight aria-hidden="true" /></span></div>
  </Link>;
}

function SocialIcon({ href }: { href: string }) {
  let host: string;
  try {
    host = new URL(href).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
  const brand = host === 'github.com' ? 'github' : host === 'juejin.cn' ? 'juejin' : null;
  return brand ? <img className={`editorial-social__icon editorial-social__icon--${brand}`} src={`/images/reference-social/${brand}.svg`} width="22" height="22" alt="" aria-hidden="true" /> : null;
}
