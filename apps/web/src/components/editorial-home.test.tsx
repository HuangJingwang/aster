// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { EditorialHome } from './EditorialHome';
import { selectEditorialHome } from '@/lib/editorial-home';

vi.mock('./EditorialMotion', () => ({ HeroCharacter: () => null, TiltMedia: ({ children }: { children: React.ReactNode }) => children }));

test('homepage exposes the video after the hero as one accessible link without loading the MP4', () => {
  const model = selectEditorialHome([{ id: 'moment-mina-meeting-video', slug: 'mina-meeting-video', title: 'Mina 会议视频', type: 'post', status: 'published', visibility: 'public', publishedAt: '2026-11-12' }]);
  const document = new DOMParser().parseFromString(renderToStaticMarkup(<EditorialHome {...model} />), 'text/html');
  const feature = document.querySelector('.editorial-video-feature');
  const link = feature?.querySelector('a');
  expect(link?.getAttribute('href')).toBe('/posts/mina-meeting-video');
  expect(link?.getAttribute('aria-label')).toContain('Mina 会议视频');
  expect(feature?.textContent).toContain('1 分 35 秒');
  expect(feature?.textContent).toContain('播放视频');
  expect(link?.querySelector('img')?.getAttribute('src')).toBe('/images/mina-meeting-video.webp');
  expect(feature?.previousElementSibling?.classList.contains('editorial-hero')).toBe(true);
  expect(feature?.nextElementSibling?.id).toBe('latest');
  expect(feature?.querySelectorAll('a')).toHaveLength(1);
  expect(feature?.querySelector('video')).toBeNull();
});

test('homepage omits the video feature when no public video is selected', () => {
  const html = renderToStaticMarkup(<EditorialHome {...selectEditorialHome([])} />);
  expect(html).not.toContain('editorial-video-feature');
});

test('homepage renders configured social profiles as safe external links beside reading', () => {
  const html = renderToStaticMarkup(<EditorialHome articles={[]} projects={[]} socialLinks={[
    { label: 'GitHub', href: 'https://github.com/example' },
    { label: '掘金', href: 'https://juejin.cn/user/123' },
  ]} />);
  expect(html).toContain('aria-label="社交主页"');
  expect(html).toContain('href="https://github.com/example" target="_blank" rel="noopener noreferrer"');
  expect(html).toContain('href="https://juejin.cn/user/123" target="_blank" rel="noopener noreferrer"');
  expect(html).toContain('掘金（在新标签页打开）');
  expect(html).toContain('开始阅读');
});

test('homepage omits empty social navigation when profiles are not configured', () => {
  expect(renderToStaticMarkup(<EditorialHome articles={[]} projects={[]} socialLinks={[]} />)).not.toContain('aria-label="社交主页"');
});

test('homepage gives GitHub and Juejin local brand icons without changing configured links', () => {
  const links = [
    { label: '我的代码', href: 'https://github.com/example' },
    { label: '掘金', href: 'https://juejin.cn/user/123' },
    { label: '其他主页', href: 'https://example.com/github' },
  ];
  const document = new DOMParser().parseFromString(renderToStaticMarkup(
    <EditorialHome articles={[]} projects={[]} socialLinks={links} />,
  ), 'text/html');
  const anchors = document.querySelectorAll('.editorial-social a');
  expect(anchors).toHaveLength(3);
  links.forEach((link, index) => {
    expect(anchors[index]?.getAttribute('href')).toBe(link.href);
    expect(anchors[index]?.textContent).toBe(link.label);
  });
  ['github', 'juejin'].forEach((brand, index) => {
    const icon = anchors[index]?.querySelector('img');
    expect(icon?.getAttribute('src')).toBe(`/images/reference-social/${brand}.svg`);
    expect(icon?.getAttribute('alt')).toBe('');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.getAttribute('width')).toBe('22');
    expect(icon?.getAttribute('height')).toBe('22');
  });
  expect(anchors[2]?.querySelector('img')).toBeNull();
});
