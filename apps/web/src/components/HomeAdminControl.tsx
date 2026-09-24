'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Archive,
  FilePenLine,
  FolderKanban,
  Grip,
  Image,
  LayoutDashboard,
  LayoutGrid,
  MessageSquareText,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Tags,
  X,
} from 'lucide-react';

type HomeAdminTab = 'manage' | 'visual' | 'layout';

interface AdminLink {
  href: string;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
}

const adminTabs: Array<{ id: HomeAdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'manage', label: '管理', icon: LayoutDashboard },
  { id: 'visual', label: '视觉', icon: Palette },
  { id: 'layout', label: '布局', icon: LayoutGrid },
];

const adminLinks: AdminLink[] = [
  { href: '/admin', label: '后台总览', detail: '工作台', icon: LayoutDashboard },
  { href: '/admin/content/new', label: '新建内容', detail: '文章 / 笔记', icon: FilePenLine },
  { href: '/admin/content', label: '内容管理', detail: '发布流', icon: Archive },
  { href: '/admin/projects', label: '项目管理', detail: '作品记录', icon: FolderKanban },
  { href: '/admin/assets', label: '素材库', detail: '图片资产', icon: Image },
  { href: '/admin/comments', label: '评论审核', detail: '互动', icon: MessageSquareText },
  { href: '/admin/study', label: '刷题任务', detail: '新题复习', icon: Sparkles },
];

const visualLinks: AdminLink[] = [
  { href: '/admin/settings', label: '站点设置', detail: '名称 / 简介 / 社交', icon: SlidersHorizontal },
  { href: '/admin/taxonomy', label: '分类标签', detail: '内容结构', icon: Tags },
  { href: '/admin/assets', label: '封面素材', detail: '首页图像', icon: Image },
];

const layoutRows = [
  { name: '中心名片', size: '主视觉', state: '已接入' },
  { name: '最新文章', size: '左侧模块', state: '已接入' },
  { name: '时钟卡片', size: '右上模块', state: '已接入' },
  { name: '日历卡片', size: '右侧模块', state: '已接入' },
  { name: '社交按钮', size: '中心操作区', state: '已接入' },
];

export function HomeAdminControl() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HomeAdminTab>('manage');
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const shortcutKey = event.key.toLowerCase();

      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && (shortcutKey === ',' || shortcutKey === 'l')) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const adminPanel = (
    <div className="home-admin-config" role="presentation" onMouseDown={() => setOpen(false)}>
      <section
        className="home-admin-config__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="home-admin-config__header">
          <div>
            <span className="home-admin-config__eyebrow">HOME CONFIG</span>
            <h2 id={titleId}>首页管理</h2>
          </div>
          <button className="home-admin-config__close" type="button" aria-label="关闭首页管理面板" onClick={() => setOpen(false)}>
            <X size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </header>

        <div className="home-admin-config__tabs" role="tablist" aria-label="首页管理分类">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                className="home-admin-config__tab"
                type="button"
                role="tab"
                key={tab.id}
                aria-selected={activeTab === tab.id}
                data-active={activeTab === tab.id ? 'true' : undefined}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="home-admin-config__body">
          {activeTab === 'manage' ? <AdminLinkGrid links={adminLinks} /> : null}
          {activeTab === 'visual' ? <AdminLinkGrid links={visualLinks} /> : null}
          {activeTab === 'layout' ? (
            <div className="home-admin-config__layout" aria-label="首页布局模块">
              {layoutRows.map((row) => (
                <div className="home-admin-config__layout-row" key={row.name}>
                  <strong>{row.name}</strong>
                  <span>{row.size}</span>
                  <em>{row.state}</em>
                </div>
              ))}
              <a className="home-admin-config__primary-link" href="/admin/settings">
                打开站点设置
              </a>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );

  return (
    <>
      <button
        className="portfolio-hero__admin-widget"
        type="button"
        aria-label="打开首页管理面板"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Grip className="portfolio-hero__admin-grid-icon" size={24} strokeWidth={2} aria-hidden="true" />
      </button>

      {mounted && open ? createPortal(adminPanel, document.body) : null}
    </>
  );
}

function AdminLinkGrid({ links }: { links: AdminLink[] }) {
  return (
    <div className="home-admin-config__grid">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <a className="home-admin-config__link" href={link.href} key={link.href}>
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>
              <strong>{link.label}</strong>
              <small>{link.detail}</small>
            </span>
          </a>
        );
      })}
    </div>
  );
}
