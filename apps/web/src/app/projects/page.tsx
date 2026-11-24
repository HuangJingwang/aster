import Link from 'next/link';
import { EditorialImage } from '@/components/EditorialImage';

import { SiteShell } from '@/components/SiteShell';
import { ReaderReveal } from '@/components/ReaderMotion';
import { TiltMedia } from '@/components/EditorialMotion';
import { getContentHref, type SiteContentItem } from '@/lib/content';
import { getProjectVisual } from '@/lib/project-visual';
import { loadPublicPageMetadata } from '@/lib/page-metadata';
import { loadSiteContent } from '@/lib/public-content';

export function generateMetadata() {
  return loadPublicPageMetadata({
    title: '项目',
    description: '个人项目、技术实践与开发过程记录。',
    path: '/projects',
  });
}

export default async function ProjectsPage() {
  const projects = await loadSiteContent('project');

  return (
    <SiteShell>
      <main className="page-main projects-page">
        <ReaderReveal className="page-title-row"><div className="page-title"><h1>个人项目</h1><p>把想法做出来，再把过程留下来。</p></div></ReaderReveal>
        <div className="projects-page__grid">
          {projects.map((item, index) => (
            <ReaderReveal key={item.id} index={index}><ProjectShowcaseCard item={item} /></ReaderReveal>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}

function ProjectShowcaseCard({ item }: { item: SiteContentItem }) {
  const href = getContentHref(item);
  const cover = getProjectVisual(item);
  const projectTags = getProjectTags(item);
  const projectLinks = getProjectLinks(item);
  const year = new Date(item.publishedAt).getFullYear();

  return (
    <article className="project-showcase-card">
      <div className="project-showcase-card__header">
        {cover && <Link aria-label={`查看项目：${item.title}`} className="project-showcase-card__thumbnail" href={href}>
          <TiltMedia className="reader-project-media"><EditorialImage src={cover.imageUrl} alt={cover.altText} loading="lazy" decoding="async" /></TiltMedia>
        </Link>}

        <div className="project-showcase-card__intro">
          <div className="project-showcase-card__title-row">
            <h2>
              <Link href={href}>{item.title}</Link>
            </h2>
            <time dateTime={item.publishedAt}>{Number.isFinite(year) ? year : 'NOW'}</time>
          </div>

          {projectTags.length > 0 && (
            <div className="project-showcase-card__tags" aria-label="项目标签">
              {projectTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {item.summary && <p className="project-showcase-card__description">{item.summary}</p>}

      <div className="project-showcase-card__links">
        <Link href={href}>项目详情</Link>
        {projectLinks.map((link) => (
          <Link
            key={`${link.label}-${link.href}`}
            href={link.href}
            rel={link.external ? 'noopener noreferrer' : undefined}
            target={link.external ? '_blank' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </article>
  );
}

function getProjectTags(item: SiteContentItem): string[] {
  const tags = item.project?.stack?.length
    ? item.project.stack
    : [...(item.tags ?? []), ...(item.categories ?? []), ...(item.series ?? [])];

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 5);
}

function getProjectLinks(item: SiteContentItem): Array<{ label: string; href: string; external?: boolean }> {
  const links = item.project?.links;
  return [
    { label: 'Website', href: links?.website },
    { label: 'GitHub', href: links?.repository },
    { label: 'Demo', href: links?.demo },
    { label: 'Article', href: links?.article },
  ]
    .filter((link): link is { label: string; href: string } => Boolean(link.href?.trim()))
    .map((link) => ({ ...link, external: true }));
}
