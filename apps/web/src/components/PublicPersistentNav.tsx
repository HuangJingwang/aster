'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Asterisk } from 'lucide-react';
import type { NavigationItem } from '@/lib/navigation';
import { EditorialDock } from './EditorialDock';
import { ThemeToggle } from './ThemeToggle';

export function PublicPersistentNav({ title, navItems }: { title: string; navItems: NavigationItem[] }) {
  const pathname = usePathname();
  // Primary destinations stay stable; secondary routes are available in the footer.
  void navItems;
  if (pathname.startsWith('/admin') || pathname === '/fleet-flagship' || pathname === '/creative-preview') return null;
  return <>
    <div className="journal-chrome">
      <a className="journal-skip" href="#main-content">跳到页面内容</a>
      <header className="editorial-header">
        <Link aria-label={`${title} · Aster.H · 返回首页`} className="editorial-brand" href="/"><Asterisk size={28} aria-hidden="true" /><span>{title}</span></Link>
        <div className="editorial-header__tools"><Link href="/about">关于 Aster.H</Link><ThemeToggle /></div>
      </header>
    </div>
    <EditorialDock pathname={pathname} />
  </>;
}
