import { describe, expect, test } from 'vitest';

import { buildAdminNavigation, buildPublicNavigation } from './navigation';

describe('public navigation helpers', () => {
  test('maps configured navigation keys without duplicating the brand home link', () => {
    expect(buildPublicNavigation(['posts', 'projects', 'series', 'tags', 'guestbook'])).toEqual([
      { href: '/posts', label: '文章' },
      { href: '/projects', label: '项目' },
      { href: '/tags', label: '标签' },
    ]);
  });

  test('ignores unknown duplicate and blank navigation keys', () => {
    expect(buildPublicNavigation([' posts ', 'unknown', 'posts', '', 'search', 'about'])).toEqual([
      { href: '/posts', label: '文章' },
    ]);
  });

  test('folds notes into the articles navigation item', () => {
    expect(buildPublicNavigation(['posts', 'notes', 'moments'])).toEqual([
      { href: '/posts', label: '文章' },
      { href: '/moments', label: '推荐分享' },
    ]);
  });

  test('hides search about series and guestbook from the public link navigation', () => {
    expect(buildPublicNavigation(['posts', 'moments', 'projects', 'series', 'guestbook', 'search', 'about'])).toEqual([
      { href: '/posts', label: '文章' },
      { href: '/moments', label: '推荐分享' },
      { href: '/projects', label: '项目' },
    ]);
  });
});

describe('admin navigation helpers', () => {
  test('exposes the lightweight admin workbench as four primary workspaces', () => {
    expect(buildAdminNavigation()).toEqual([
      { href: '/admin', label: '写作' },
      { href: '/admin/content', label: '内容' },
      {
        href: '/admin/comments',
        label: '互动',
        children: [
          { href: '/admin/comments', label: '评论' },
        ],
      },
      {
        href: '/admin/settings',
        label: '站点',
        children: [
          { href: '/admin/assets', label: '素材维护' },
          { href: '/admin/taxonomy', label: '分类索引' },
          { href: '/admin/export', label: '导入导出' },
          { href: '/admin/settings', label: '站点设置' },
          { href: '/admin/study', label: '学习工具' },
        ],
      },
    ]);
  });
});
