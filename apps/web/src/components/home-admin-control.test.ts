import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

const source = readFileSync(join(process.cwd(), 'src/components/HomeAdminControl.tsx'), 'utf8');

describe('HomeAdminControl', () => {
  test('keeps the public home admin trigger as an icon-only dialog launcher', () => {
    expect(source).toContain("'use client';");
    expect(source).toContain("import { createPortal } from 'react-dom';");
    expect(source).toContain('className="portfolio-hero__admin-widget"');
    expect(source).toContain('type="button"');
    expect(source).toContain('aria-label="打开首页管理面板"');
    expect(source).toContain('aria-haspopup="dialog"');
    expect(source).toContain('aria-expanded={open}');
    expect(source).toContain('Grip,');
    expect(source).toContain('<Grip className="portfolio-hero__admin-grid-icon" size={24} strokeWidth={2} aria-hidden="true" />');
    expect(source).not.toContain('<Settings size={20} strokeWidth={1.8} aria-hidden="true" />');
    expect(source).not.toContain('<span>管理</span>');
    expect(source).not.toContain('href="/admin" aria-label="进入后台管理"');
  });

  test('uses the reference-site interaction model with shortcuts and tabbed config', () => {
    expect(source).toContain("shortcutKey === ',' || shortcutKey === 'l'");
    expect(source).toContain("event.key === 'Escape'");
    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('createPortal(');
    expect(source).toContain('document.body');
    expect(source).toContain('role="tablist"');
    expect(source).toContain("type HomeAdminTab = 'manage' | 'visual' | 'layout';");
    expect(source).toContain("label: '管理'");
    expect(source).toContain("label: '视觉'");
    expect(source).toContain("label: '布局'");
  });

  test('exposes practical Chinese admin destinations without rendering private data on the public page', () => {
    expect(source).toContain("href: '/admin'");
    expect(source).toContain("href: '/admin/content/new'");
    expect(source).toContain("href: '/admin/content'");
    expect(source).toContain("href: '/admin/projects'");
    expect(source).toContain("href: '/admin/assets'");
    expect(source).toContain("href: '/admin/comments'");
    expect(source).not.toContain("href: '/admin/guestbook'");
    expect(source).toContain("href: '/admin/study'");
    expect(source).toContain("href: '/admin/settings'");
    expect(source).toContain("href: '/admin/taxonomy'");
    expect(source).not.toContain('totalComments');
    expect(source).not.toContain('privateOwnerName');
  });
});
