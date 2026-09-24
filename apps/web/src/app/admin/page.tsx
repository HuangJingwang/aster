import Link from 'next/link';

import { AdminShell } from '@/components/AdminShell';
import { buildAdminOverviewSnapshot } from '@/lib/admin-content';
import { loadRepositoryAdminContentItems } from '@/lib/admin-content-repository';
import { loadAdminModerationCount } from '@/lib/interaction-client';

export default async function AdminPage() {
  const adminInteractionRequestOptions = {
    interactionBaseUrl: process.env.NEXT_PUBLIC_INTERACTION_BASE_URL,
    cookieHeader: '',
  };
  const { items } = await loadRepositoryAdminContentItems();
  const pendingComments = await loadAdminModerationCount('comments', 'pending', adminInteractionRequestOptions);
  const overview = buildAdminOverviewSnapshot(items);
  const moderationCards = [
    { label: '待处理评论', value: pendingComments, href: '/admin/comments' },
  ];
  const continueItems = overview.draftQueue.length > 0 ? overview.draftQueue : overview.recentUpdates;
  const quickCreateCards = [
    { label: '文章', href: '/admin/content/new?type=post', hint: '沉淀长文、技术记录和专题。' },
    { label: '笔记', href: '/admin/content/new?type=note', hint: '收下短想法、摘录和阶段记录。' },
    { label: '日常', href: '/admin/content/new?type=moment', hint: '快速记录片段、现场和轻更新。' },
    { label: '项目', href: '/admin/content/new?type=project', hint: '整理项目状态、链接和复盘。' },
  ];

  return (
    <AdminShell>
      <section className="admin-panel admin-panel--hero admin-workbench-hero">
        <div className="admin-hero-copy">
          <p className="eyebrow">写作</p>
          <h1>写作工作台</h1>
          <p>先继续写，再处理内容和互动。低频配置收进站点维护，日常路径保持短一点。</p>
          <div className="admin-actions">
            <Link href="/admin/content/new">新建内容</Link>
            <Link href="/admin/content">内容库</Link>
            <Link href="/">查看前台</Link>
          </div>
        </div>
        <div className="admin-signal-panel" aria-label="待处理事项">
          <span>今日处理</span>
          {moderationCards.map((card) => (
            <Link key={card.label} href={card.href}>
              <strong>{card.value}</strong>
              <small>{card.label}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-workbench-grid" aria-label="写作工作区">
        <div className="admin-ops-card admin-workbench-card">
          <div className="admin-heading-row">
            <div>
              <span>继续写</span>
              <h2>草稿和最近编辑</h2>
            </div>
            <Link href="/admin/content?status=draft">查看草稿</Link>
          </div>
          <AdminOverviewList items={continueItems} emptyText="暂无草稿。可以先写一篇文章、笔记或日常片段。" />
        </div>

        <div className="admin-ops-card admin-workbench-card">
          <div className="admin-heading-row">
            <div>
              <span>快速新建</span>
              <h2>选择一种内容</h2>
            </div>
          </div>
          <div className="admin-quick-create">
            {quickCreateCards.map((card) => (
              <Link key={card.label} href={card.href}>
                <strong>{card.label}</strong>
                <small>{card.hint}</small>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-ops-card admin-workbench-card">
          <div className="admin-heading-row">
            <div>
              <span>今日处理</span>
              <h2>互动队列</h2>
            </div>
            <Link href="/admin/comments">进入互动</Link>
          </div>
          <div className="admin-review-strip admin-review-strip--compact">
            {moderationCards.map((card) => (
              <Link key={card.label} href={card.href}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-panel admin-panel--compact">
        <div className="admin-heading-row">
          <div>
            <p className="eyebrow">内容</p>
            <h2>最近内容</h2>
          </div>
          <Link href="/admin/content">打开内容库</Link>
        </div>
        <div className="admin-ops-grid admin-ops-grid--two">
          <div className="admin-ops-card">
            <span>最近内容</span>
            <AdminOverviewList items={overview.recentUpdates} emptyText="暂无近期内容变更。" showMetric />
          </div>
          <div className="admin-ops-card">
            <span>反馈较多</span>
            <AdminOverviewList items={overview.topContent} emptyText="还没有公开反馈数据。" showMetric />
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function AdminOverviewList({
  items,
  emptyText,
  showMetric = false,
}: {
  items: Array<{ id: string; title: string; href: string; meta: string; metric: string }>;
  emptyText: string;
  showMetric?: boolean;
}) {
  if (items.length === 0) {
    return <p className="admin-ops-empty">{emptyText}</p>;
  }

  return (
    <ul className="admin-ops-list">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href}>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
            {showMetric ? <em>{item.metric}</em> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
