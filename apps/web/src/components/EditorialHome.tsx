import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import type { SiteContentItem } from '@/lib/content-types';
import type { HomeVideoFeature } from '@/lib/editorial-home';
import type { SiteSocialLink } from '@/lib/settings';
import { getContentHref } from '@/lib/content-routing';
import { recommendedShares } from '@/lib/recommended-shares';
import { HeroCharacter } from './EditorialMotion';

const homeRecommendations = ['React Bits', 'Pipecat', 'Taste Skill'];

export function EditorialHome({ articles, projects, featuredVideo, socialLinks = [] }: { articles: SiteContentItem[]; projects: SiteContentItem[]; featuredVideo?: HomeVideoFeature | null; socialLinks?: SiteSocialLink[] }) {
  return <main id="main-content" tabIndex={-1} className="editorial-home editorial-home--compact">
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
    <div className="home-overview">
      <section className="home-latest" id="latest" aria-labelledby="latest-title">
        <div className="editorial-section__heading"><h2 id="latest-title">最近文章</h2><Link href="/posts">全部文章 <ArrowRight size={16} /></Link></div>
        <div className="home-article-list">{articles.map(item => <article key={item.id}>
          <Link href={getContentHref(item)}><time dateTime={item.publishedAt}>{item.publishedAt.slice(0, 10)}</time><h3>{item.title}</h3><ArrowUpRight size={18} aria-hidden="true" /></Link>
        </article>)}</div>
        {!articles.length && <p className="editorial-empty">还没有公开文章。</p>}
      </section>
      <div className="home-discover">
        <section id="projects" aria-labelledby="projects-title">
          <div className="editorial-section__heading"><h2 id="projects-title">个人项目</h2><Link href="/projects">全部项目 <ArrowRight size={16} /></Link></div>
          <div className="home-project-list">{projects.map(item => <Link key={item.id} href={getContentHref(item)}><span>{item.title}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div>
          {!projects.length && <p className="editorial-empty">还没有公开项目。</p>}
        </section>
        <section id="recommendations" aria-labelledby="recommendations-title">
          <div className="editorial-section__heading"><h2 id="recommendations-title">值得收藏</h2><Link href="/moments">全部推荐 <ArrowRight size={16} /></Link></div>
          <div className="home-resource-links">{homeRecommendations.flatMap(name => recommendedShares.filter(resource => resource.name === name)).map(resource => <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`${resource.name}（在新标签页打开）`}>{resource.name}<ArrowUpRight size={13} aria-hidden="true" /></a>)}</div>
        </section>
      </div>
    </div>
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
