import Link from 'next/link';
import { SiteShell } from '@/components/SiteShell';
import { groupContentByTag, getTagHref } from '@/lib/content';
import { loadPublicPageMetadata } from '@/lib/page-metadata';
import { loadSiteContent } from '@/lib/public-content';

export function generateMetadata() {
  return loadPublicPageMetadata({
    title: '标签',
    description: '用关键词串起文章、日常和项目，快速回到相同主题的内容。',
    path: '/tags',
  });
}

export default async function TagsPage() {
  const content = await loadSiteContent();
  const groups = groupContentByTag(content);


  return (
    <SiteShell>
      <main className="page-main">
        <div className="page-title">
          <p className="eyebrow">THE INDEX / KEYWORDS</p>
          <h1>标签</h1>
          <p>用更细的关键词串起文章、日常和项目，快速回到相同技术、主题或状态的内容。</p>
        </div>
        <nav className="journal-taxonomy-index journal-taxonomy-index--directory" aria-label="标签索引">{groups.map((group) => <Link key={group.key} href={getTagHref(group.label)}>{group.label}<span>{group.items.length} 篇</span></Link>)}</nav>
        <p className="archive-total">共 {groups.length} 个标签 · 选择关键词，继续阅读</p>
      </main>
    </SiteShell>
  );
}
