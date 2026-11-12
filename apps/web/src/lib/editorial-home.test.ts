import { describe, expect, test } from 'vitest';
import { selectEditorialHome } from './editorial-home';
import { filterRecommendations, getRecommendationKind } from './recommendation-filter';
import { recommendedShares } from './recommended-shares';
import type { SiteContentItem } from './content-types';

describe('editorial home preserves content boundaries', () => {
  test('selects four public articles and every public personal project without mixing recommendations', () => {
    const items = Array.from({ length: 6 }, (_, index) => ({ id: String(index), slug: String(index), title: `文章${index}`, type: 'post', status: 'published', visibility: 'public', publishedAt: `2026-09-0${index + 1}` } as SiteContentItem));
    items.push({ ...items[0]!, id: 'project', type: 'project' }, { ...items[0]!, id: 'draft', status: 'draft' }, { ...items[0]!, id: 'private', visibility: 'private' });
    const model = selectEditorialHome(items);
    expect(model.articles.map(item => item.id)).toEqual(['5', '4', '3', '2']);
    expect(model.projects.map(item => item.id)).toEqual(['project']);
    expect(model.articles.some(item => ['draft', 'private'].includes(item.id))).toBe(false);
  });
  test('empty collections remain empty', () => expect(selectEditorialHome([])).toEqual({ articles: [], projects: [], featuredVideo: null }));
  test('features the published Mina video article while preserving the article feed', () => {
    const video: SiteContentItem = { id: 'moment-mina-meeting-video', slug: 'mina-meeting-video', title: 'Mina 会议视频', type: 'post', status: 'published', visibility: 'public', publishedAt: '2026-11-12' };
    const home = selectEditorialHome([video]);
    expect(home.featuredVideo?.item).toEqual(video);
    expect(home.featuredVideo?.durationLabel).toBe('2 分 20 秒');
    expect(home.articles).toEqual([video]);
    expect(home.projects).toEqual([]);
    expect(selectEditorialHome([{ ...video, status: 'draft' }]).featuredVideo).toBeNull();
    expect(selectEditorialHome([{ ...video, visibility: 'private' }]).featuredVideo).toBeNull();
    expect(selectEditorialHome([{ ...video, id: 'another-moment' }]).featuredVideo).toBeNull();
  });
});

describe('recommendation directory', () => {
  test('preserves recommendations and differentiates websites, open source, and reposted articles', () => {
    expect(filterRecommendations(recommendedShares, '', '全部', 'all')).toHaveLength(21);
    expect(recommendedShares.filter(item => getRecommendationKind(item) === 'website')).toHaveLength(6);
    expect(filterRecommendations(recommendedShares, '', '全部', 'opensource')).toHaveLength(14);
    expect(filterRecommendations(recommendedShares, '', '全部', 'article').map(item => item.name)).toEqual(['Agent知识库这些年：从Rag到OKF0.2']);
  });
  test('combines kind, category and case-insensitive search without mutating the source', () => {
    expect(filterRecommendations(recommendedShares, ' REACT ', '前端审美', 'website').map(item => item.name)).toContain('React Bits');
    expect(filterRecommendations(recommendedShares, 'react', '全部', 'opensource')).toEqual([]);
    expect(filterRecommendations(recommendedShares, '不存在的资源', '全部', 'all')).toEqual([]);
    expect(recommendedShares).toHaveLength(21);
  });
});
