import { describe, expect, test } from 'vitest';
import { getHomeArticleHeading, selectEditorialHome } from './editorial-home';
import { filterRecommendations, getRecommendationKind } from './recommendation-filter';
import { recommendedShares } from './recommended-shares';
import type { SiteContentItem } from './content-types';

describe('editorial home preserves content boundaries', () => {
  test('bounds homepage previews to three public articles and two projects without changing the source', () => {
    const items = Array.from({ length: 6 }, (_, index) => ({ id: String(index), slug: String(index), title: `文章${index}`, type: 'post', status: 'published', visibility: 'public', publishedAt: `2026-09-0${index + 1}` } as SiteContentItem));
    items.push(...Array.from({ length: 4 }, (_, index) => ({ ...items[index]!, id: `project${index}`, type: 'project' as const })), { ...items[0]!, id: 'draft', status: 'draft' }, { ...items[0]!, id: 'private', visibility: 'private' });
    const model = selectEditorialHome(items);
    expect(model.articles.map(item => item.id)).toEqual(['5', '4', '3']);
    expect(model.projects.map(item => item.id)).toEqual(['project3', 'project2']);
    expect(items).toHaveLength(12);
    expect(model.articles.some(item => ['draft', 'private'].includes(item.id))).toBe(false);
  });
  test('empty collections remain empty', () => expect(selectEditorialHome([])).toEqual({ articles: [], projects: [] }));
  test('treats video articles as ordinary articles, with no separate feature', () => {
    const video: SiteContentItem = { id: 'moment-mina-meeting-video', slug: 'mina-meeting-video', title: 'Mina 会议视频', type: 'post', status: 'published', visibility: 'public', publishedAt: '2026-11-12' };
    expect(selectEditorialHome([video])).toEqual({ articles: [video], projects: [] });
    expect(selectEditorialHome([{ ...video, status: 'draft' }]).articles).toEqual([]);
    expect(selectEditorialHome([{ ...video, visibility: 'private' }]).articles).toEqual([]);
  });
  test('separates a declared series and episode from its display heading without rewriting the article', () => {
    const item = { title: 'Voice Agent 实践与落地（三）：前后台分离与记忆管理', series: ['Voice Agent 实践与落地'], type: 'post' } as SiteContentItem;
    expect(getHomeArticleHeading(item)).toEqual({ title: '前后台分离与记忆管理', kicker: 'Voice Agent 实践与落地', issue: '03' });
    expect(item.title).toBe('Voice Agent 实践与落地（三）：前后台分离与记忆管理');
    expect(getHomeArticleHeading({ ...item, series: ['别的系列'] }).title).toBe(item.title);
    expect(getHomeArticleHeading({ ...item, title: '普通标题', series: [] })).toEqual({ title: '普通标题', kicker: '文章', issue: undefined });
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
