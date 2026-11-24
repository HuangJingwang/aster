'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Asterisk } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { NavigationItem } from '@/lib/navigation';
import { EditorialDock } from './EditorialDock';
import { ThemeToggle } from './ThemeToggle';

export function PublicPersistentNav({ title, navItems }: { title: string; navItems: NavigationItem[] }) {
  const pathname = usePathname();
  const directory = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (directory.current) directory.current.open = false; }, [pathname]);
  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (directory.current && !directory.current.contains(event.target as Node)) directory.current.open = false;
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  // Keep the same primary destinations as the mobile dock.
  void navItems;
  const primary = [{ href: '/', label: '首页' }, { href: '/posts', label: '文章' }, { href: '/projects', label: '项目' }, { href: '/moments', label: '推荐分享' }, { href: '/search', label: '搜索' }];
  const secondary = [{ href: '/notes', label: '笔记' }, { href: '/series', label: '专题' }, { href: '/categories', label: '分类' }, { href: '/tags', label: '标签' }, { href: '/archives', label: '归档' }, { href: '/guestbook', label: '留言' }, { href: '/leetcode', label: '刷题日记' }];
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
  if (pathname.startsWith('/admin') || pathname === '/fleet-flagship' || pathname === '/creative-preview') return null;
  return <>
    <div className="journal-chrome">
      <a className="journal-skip" href="#main-content">跳到页面内容</a>
      <header className="editorial-header">
        <Link aria-label={`${title} · Aster.H · 返回首页`} className="editorial-brand" href="/"><Asterisk size={28} aria-hidden="true" /><span>{title}</span></Link>
        <nav className="editorial-primary-nav" aria-label="主导航">{primary.map(item => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}</nav>
        <div className="editorial-header__tools">
          <details className="editorial-directory" ref={directory} onKeyDown={event => { if (event.key === 'Escape' && directory.current) { directory.current.open = false; directory.current.querySelector('summary')?.focus(); } }}>
            <summary>栏目 <span aria-hidden="true">＋</span></summary>
            <nav aria-label="更多栏目">{secondary.map(item => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} onClick={() => { if (directory.current) directory.current.open = false; }}>{item.label}</Link>)}</nav>
          </details>
          <Link href="/about">关于 Aster.H</Link><ThemeToggle />
        </div>
      </header>
    </div>
    <EditorialDock pathname={pathname} />
  </>;
}
