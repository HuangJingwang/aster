export interface NavigationItem {
  href: string;
  label: string;
  children?: NavigationItem[];
}

const navigationByKey: Record<string, NavigationItem> = {
  posts: { href: '/posts', label: '文章' },
  moments: { href: '/moments', label: '推荐分享' },
  projects: { href: '/projects', label: '项目' },
  series: { href: '/series', label: '专题' },
  categories: { href: '/categories', label: '分类' },
  tags: { href: '/tags', label: '标签' },
  archives: { href: '/archives', label: '归档' },
  search: { href: '/search', label: '搜索' },
};

const adminNavigation: NavigationItem[] = [
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
];

export function buildPublicNavigation(keys: string[]): NavigationItem[] {
  const items: NavigationItem[] = [];
  const seen = new Set<string>();
  const normalizedKeys = keys.map((key) => normalizeNavigationKey(key));

  for (const normalized of normalizedKeys) {
    if (normalized === 'search' || normalized === 'about' || normalized === 'series' || normalized === 'guestbook') {
      continue;
    }

    const item = navigationByKey[normalized];

    if (item && !seen.has(normalized)) {
      items.push(item);
      seen.add(normalized);
    }
  }

  return items;
}

function normalizeNavigationKey(key: string): string {
  const normalized = key.trim().toLowerCase();

  return normalized === 'notes' ? 'posts' : normalized;
}

export function buildAdminNavigation(): NavigationItem[] {
  return adminNavigation;
}
