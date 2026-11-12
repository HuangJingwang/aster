import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import type { SiteContentItem } from '@/lib/content-types';
import type { HomeVideoFeature } from '@/lib/editorial-home';
import type { SiteSocialLink } from '@/lib/settings';
import { getContentCover } from '@/lib/content-cover';
import { getProjectVisual } from '@/lib/project-visual';
import { getContentHref } from '@/lib/content-routing';
import { recommendedShares } from '@/lib/recommended-shares';
import { HeroCharacter, ProjectStackItem, TiltMedia } from './EditorialMotion';
import { RecommendationCard } from './RecommendationCard';

const homeRecommendations = ['React Bits', 'MotionSites AI', '21st.dev', 'Pipecat', 'WeKnora', 'Taste Skill'];

export function EditorialHome({ articles, projects, featuredVideo, socialLinks = [] }: { articles: SiteContentItem[]; projects: SiteContentItem[]; featuredVideo?: HomeVideoFeature | null; socialLinks?: SiteSocialLink[] }) {
  const lead = articles[0];
  return <main id="main-content" tabIndex={-1} className="editorial-home">
    <section className="editorial-hero" aria-labelledby="home-title">
      <h1 id="home-title" aria-label="Aster，Aster.H 的个人博客"><span aria-hidden="true">ASTER<span className="editorial-period">.</span></span></h1>
      <HeroCharacter />
      <div className="editorial-hero__intro"><p>你好，我是 Aster.H。</p><p>写代码，也写下思考。<br />这里收藏实践、项目和沿途的发现。</p><div className="editorial-hero__actions"><Link className="editorial-action" href="/posts">开始阅读 <ArrowUpRight size={19} /></Link>{socialLinks.length > 0 && <nav className="editorial-social" aria-label="社交主页">{socialLinks.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label}（在新标签页打开）`}><SocialIcon href={link.href} /><span>{link.label}</span><ArrowUpRight size={14} aria-hidden="true" /></a>)}</nav>}</div></div>
    </section>
    {featuredVideo && <aside className="editorial-video-feature" aria-label="视频文章">
      <Link href={getContentHref(featuredVideo.item)} aria-label={`播放视频：${featuredVideo.item.title}，${featuredVideo.durationLabel}`} className="editorial-video-feature__link">
        <span className="editorial-video-feature__poster">
          <img src={featuredVideo.posterUrl} width="640" height="360" alt="" loading="lazy" decoding="async" />
          <span className="editorial-video-feature__play" aria-hidden="true"><Play size={22} fill="currentColor" /></span>
        </span>
        <span className="editorial-video-feature__copy">
          <span className="editorial-video-feature__meta">视频文章 <span aria-hidden="true">·</span> {featuredVideo.durationLabel}</span>
          <strong>{featuredVideo.item.title}</strong>
          <span className="editorial-video-feature__cta">播放视频 <ArrowUpRight size={18} aria-hidden="true" /></span>
        </span>
      </Link>
    </aside>}
    <section className="editorial-section" id="latest" aria-labelledby="latest-title">
      <div className="editorial-section__heading"><h2 id="latest-title">最近文章</h2><Link href="/posts">全部文章 <ArrowRight size={18} /></Link></div>
      {lead ? <div className="editorial-reading">
        <article className="editorial-lead"><Link href={getContentHref(lead)}><TiltMedia><ArticleCover item={lead} priority /></TiltMedia><div className="editorial-date"><time dateTime={lead.publishedAt}>{lead.publishedAt.slice(0, 10)}</time>{lead.tags?.[0] && <span>{lead.tags[0]}</span>}</div><h3>{lead.title}</h3><p>{lead.summary}</p></Link></article>
        <div className="editorial-reading__list">{articles.slice(1).map(item => <article key={item.id}><Link href={getContentHref(item)}><time dateTime={item.publishedAt}>{item.publishedAt.slice(0, 10)}</time><h3>{item.title}</h3><p>{item.summary}</p><ArrowUpRight size={20} aria-hidden="true" /></Link></article>)}</div>
      </div> : <p className="editorial-empty">还没有公开文章。</p>}
    </section>
    <section className="editorial-section editorial-projects" id="projects" aria-labelledby="projects-title">
      <div className="editorial-section__heading"><h2 id="projects-title">个人项目</h2><Link href="/projects">项目记录 <ArrowRight size={18} /></Link></div>
      <div className="editorial-project-stack">{projects.map((item, index) => <ProjectStackItem key={item.id} index={index} total={projects.length}>
        <article className="editorial-project"><Link className="editorial-project__visual" href={getContentHref(item)} aria-label={`查看项目：${item.title}`}><TiltMedia><ArticleCover item={item} /></TiltMedia></Link><div className="editorial-project__copy"><h3><Link href={getContentHref(item)}>{item.title}</Link></h3><p>{item.summary}</p><div className="editorial-tags">{item.project?.stack?.map(tag => <span key={tag}>{tag}</span>)}</div><div className="editorial-project__links"><Link href={getContentHref(item)}>项目详情 <ArrowUpRight size={18} /></Link>{item.project?.links?.repository && <a href={item.project.links.repository} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15} /></a>}</div></div></article>
      </ProjectStackItem>)}</div>{!projects.length && <p className="editorial-empty">还没有公开项目。</p>}
    </section>
    <section className="editorial-section" id="recommendations" aria-labelledby="recommendations-title">
      <div className="editorial-section__heading"><h2 id="recommendations-title">值得收藏</h2><Link href="/moments">全部推荐 <ArrowRight size={18} /></Link></div>
      <p className="editorial-section__description">常用的网站、开源项目和学习资源。</p>
      <div className="resource-grid">{homeRecommendations.flatMap(name => recommendedShares.filter(resource => resource.name === name)).map(resource => <RecommendationCard key={resource.url} resource={resource} />)}</div>
    </section>
  </main>;
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

function ArticleCover({ item, priority = false }: { item: SiteContentItem; priority?: boolean }) {
  const cover = item.type === 'project' ? getProjectVisual(item) : getContentCover(item);
  const previewImage = cover?.imageUrl === '/images/juejin/7680833071233531938/cover-8bae67eaaa12c28b.webp' ? '/images/editorial-pipecat-cover.webp' : cover?.imageUrl;
  return cover ? <img src={previewImage} alt={cover.altText} width="1000" height="660" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" /> : <div className="editorial-text-cover"><span>{item.title}</span></div>;
}
