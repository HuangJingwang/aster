import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { categoryOrder, getRecommendedShareStars, recommendedShares } from '@/lib/recommended-shares';

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function readGlobalStyles() {
  return [
    'src/app/styles/base.css',
    'src/app/styles/public.css',
    'src/app/styles/home.css',
    'src/app/styles/content.css',
    'src/app/styles/leetcode.css',
    'src/app/styles/share.css',
    'src/app/styles/admin.css',
    'src/app/styles/responsive.css',
  ]
    .map((path) => readSource(path))
    .join('\n');
}

function readRule(source: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escapedSelector} \\{([\\s\\S]*?)\\n\\}`, 'm'));

  return match?.[1] ?? '';
}

function fileSha256(path: string) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('recommended share page', () => {
  test('turns the moments route into the recommended share resource page', () => {
    const page = readSource('src/app/moments/page.tsx');
    const grid = readSource('src/components/RecommendedShareGrid.tsx');
    const data = readSource('src/lib/recommended-shares.ts');

    expect(page).toContain("title: '推荐分享'");
    expect(page).toContain("description: '收藏常用工具、灵感网站、组件库和学习资源。'");
    expect(page).toContain('<RecommendedShareGrid resources={recommendedShares} />');
    expect(page).not.toContain('loadSiteContent');
    expect(page).not.toContain('<ContentCard');

    expect(grid).toContain('placeholder="搜索名称、标签或简介"');
    expect(grid).toContain('全部');
    expect(grid).toContain('没有找到相关资源');
    expect(grid).toContain('RecommendationCard');

    expect(categoryOrder).toEqual(['全部', '开源项目', 'AI Coding', '前端审美', '工程流程', 'AI 学习', '技术社区']);
    expect(recommendedShares.map((resource) => resource.name)).toEqual([
      'Superpowers',
      'Matt Pocock Skills',
      'Learn Claude Code',
      'Taste Skill',
      'WeKnora',
      'Meetily',
      'Pipecat',
      'Trellis',
      'Avoid AI Writing',
      '2025 Blog Public',
      'Deep Research Skills',
      'Minutes',
      'Visual IP Illustrations',
      'Conductor',
      '21st.dev',
      'React Bits',
      'MotionSites AI',
      'Dribbble',
      'LINUX DO',
      '小林面试笔记',
      'Agent知识库这些年：从Rag到OKF0.2',
    ]);
    expect(recommendedShares.map((resource) => [resource.name, resource.avatarSrc, resource.avatarAlt])).toEqual([
      ['Superpowers', '/images/recommended-shares/superpowers-avatar.jpg', 'Superpowers GitHub 项目图标'],
      ['Matt Pocock Skills', '/images/recommended-shares/mattpocock-skills-avatar.jpg', 'Matt Pocock Skills GitHub 项目图标'],
      ['Learn Claude Code', '/images/recommended-shares/learn-claude-code-avatar.jpg', 'Learn Claude Code GitHub 项目图标'],
      ['Taste Skill', '/images/recommended-shares/taste-skill-avatar.jpg', 'Taste Skill GitHub 项目图标'],
      ['WeKnora', '/images/recommended-shares/weknora-avatar.png', 'Tencent GitHub 头像'],
      ['Meetily', '/images/recommended-shares/meetily-avatar.jpg', 'Meetily GitHub 项目图标'],
      ['Pipecat', '/images/recommended-shares/pipecat-avatar.png', 'Pipecat GitHub 项目图标'],
      ['Trellis', '/images/recommended-shares/trellis-avatar.jpg', 'Trellis GitHub 项目图标'],
      ['Avoid AI Writing', undefined, undefined],
      [
        '2025 Blog Public',
        '/images/recommended-shares/yysuni-2025-blog-public-avatar.jpg',
        '2025 Blog Public GitHub 项目图标',
      ],
      [
        'Deep Research Skills',
        '/images/recommended-shares/deep-research-skills-avatar.jpg',
        'Deep Research Skills GitHub 项目图标',
      ],
      ['Minutes', undefined, undefined],
      ['Visual IP Illustrations', '/images/recommended-shares/visual-ip-illustrations-avatar.jpg', 'yangchuansheng GitHub 头像'],
      ['Conductor', '/images/recommended-shares/conductor-avatar.jpg', 'Conductor GitHub 项目图标'],
      ['21st.dev', undefined, undefined],
      ['React Bits', '/images/recommended-shares/react-bits-logo.png', 'React Bits 网站图标'],
      ['MotionSites AI', '/images/recommended-shares/motionsites-logo.png', 'MotionSites AI 网站图标'],
      ['Dribbble', undefined, undefined],
      ['LINUX DO', '/images/recommended-shares/linux-do-logo.svg', 'LINUX DO 网站图标'],
      ['小林面试笔记', '/images/recommended-shares/xiaolinnote-logo.png', '小林面试笔记图标'],
      ['Agent知识库这些年：从Rag到OKF0.2', undefined, undefined],
    ]);
    expect(
      recommendedShares
        .filter((resource) => resource.githubStars !== undefined)
        .map((resource) => [resource.name, resource.githubStars, resource.stars]),
    ).toEqual([
      ['Superpowers', 247376, 5],
      ['Matt Pocock Skills', 161732, 5],
      ['Learn Claude Code', 70037, 5],
      ['Taste Skill', 58234, 5],
      ['WeKnora', 21151, 5],
      ['Meetily', 18223, 5],
      ['Pipecat', 14743, 5],
      ['Trellis', 11828, 5],
      ['Avoid AI Writing', 2360, 4],
      ['2025 Blog Public', 1576, 4],
      ['Deep Research Skills', 1528, 4],
      ['Minutes', 1291, 4],
      ['Visual IP Illustrations', 265, 3],
      ['Conductor', 86, 3],
    ]);
    for (const resource of recommendedShares.filter((item) => item.githubStars !== undefined)) {
      expect(resource.stars).toBe(getRecommendedShareStars(resource.githubStars!));
      expect(resource.stars).toBeGreaterThanOrEqual(3);
    }
    for (const resource of recommendedShares.filter((item) => item.avatarSrc !== undefined)) {
      expect(existsSync(join(process.cwd(), 'public', resource.avatarSrc!.replace(/^\//, '')))).toBe(true);
    }
    expect(fileSha256(join(process.cwd(), 'public/images/recommended-shares/xiaolinnote-logo.png'))).toBe(
      '9d46bacbcd82a54266afc6e68d9ba6560c9bcdc5796bb75ebfa7c86a9a027476',
    );
    expect(recommendedShares.find((resource) => resource.name === '小林面试笔记')).toMatchObject({
      url: 'https://xiaolinnote.com/',
      logo: 'XL',
      avatarSrc: '/images/recommended-shares/xiaolinnote-logo.png',
      avatarAlt: '小林面试笔记图标',
      tags: ['AI 学习', 'AI Coding', '工程流程'],
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Agent知识库这些年：从Rag到OKF0.2')).toMatchObject({
      url: 'https://www.douyin.com/article/7679728760388311921',
      logo: 'OK',
      description: '梳理 Agent 知识库从 RAG 到 OKF 的演进，并讨论用 Markdown、frontmatter 和 Git 管理可审计、可持续演进的知识。',
      tags: ['AI 学习', '工程流程'],
      kind: 'article',
      attribution: '转载自抖音，原作者：波与粒子皆存',
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === '2025 Blog Public')).toMatchObject({
      url: 'https://github.com/YYsuni/2025-blog-public',
      logo: 'YY',
      avatarSrc: '/images/recommended-shares/yysuni-2025-blog-public-avatar.jpg',
      avatarAlt: '2025 Blog Public GitHub 项目图标',
      tags: ['开源项目', '前端审美', '工程流程'],
      githubStars: 1576,
      stars: 4,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Avoid AI Writing')).toMatchObject({
      url: 'https://github.com/conorbronsdon/avoid-ai-writing',
      logo: 'AW',
      description: '面向 AI 文本的结构化审校与改写 skill，识别模板化措辞、空泛拔高和过度结构化，并用二次检查保留更自然的表达。',
      tags: ['开源项目', 'AI Coding', '工程流程'],
      githubStars: 2360,
      stars: 4,
    });
    expect(recommendedShares.find((resource) => resource.name === 'LINUX DO')).toMatchObject({
      url: 'https://linux.do/',
      logo: 'LD',
      avatarSrc: '/images/recommended-shares/linux-do-logo.svg',
      avatarAlt: 'LINUX DO 网站图标',
      tags: ['技术社区', 'AI 学习', 'AI Coding'],
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Conductor')).toMatchObject({
      url: 'https://github.com/zhengzizhe/conductor',
      logo: 'CO',
      avatarSrc: '/images/recommended-shares/conductor-avatar.jpg',
      avatarAlt: 'Conductor GitHub 项目图标',
      tags: ['开源项目', 'AI Coding', '工程流程'],
      githubStars: 86,
      stars: 3,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Meetily')).toMatchObject({
      url: 'https://github.com/Zackriya-Solutions/meetily',
      logo: 'ME',
      avatarSrc: '/images/recommended-shares/meetily-avatar.jpg',
      avatarAlt: 'Meetily GitHub 项目图标',
      tags: ['开源项目', 'AI 学习', 'AI Coding'],
      githubStars: 18223,
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Pipecat')).toMatchObject({
      url: 'https://github.com/pipecat-ai/pipecat',
      logo: 'PC',
      avatarSrc: '/images/recommended-shares/pipecat-avatar.png',
      avatarAlt: 'Pipecat GitHub 项目图标',
      description: '面向语音 Agent、多模态应用和实时 AI 的开源 Python 框架，统一编排语音、模型、传输与服务集成，适合构建低延迟对话应用。',
      tags: ['开源项目', 'AI Coding', 'AI 学习'],
      githubStars: 14743,
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Deep Research Skills')).toMatchObject({
      url: 'https://github.com/Weizhena/Deep-Research-skills',
      logo: 'DR',
      avatarSrc: '/images/recommended-shares/deep-research-skills-avatar.jpg',
      avatarAlt: 'Deep Research Skills GitHub 项目图标',
      tags: ['开源项目', 'AI Coding', 'AI 学习'],
      githubStars: 1528,
      stars: 4,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Minutes')).toMatchObject({
      url: 'https://github.com/silverstein/minutes',
      logo: 'MI',
      description: '本地优先的开源对话记忆工具，把会议、语音备忘和承诺整理成可搜索的 Markdown，并通过 MCP 接入 Codex 等 AI Agent。',
      tags: ['开源项目', 'AI Coding', '工程流程'],
      githubStars: 1291,
      stars: 4,
    });
    expect(recommendedShares.find((resource) => resource.name === '21st.dev')).toMatchObject({
      url: 'https://21st.dev/',
      logo: '21',
      description: '面向 React 开发者的社区组件与模板库，提供分类筛选、CLI、MCP 和 AI 创建入口，适合快速寻找可复用的前端实现。',
      tags: ['前端审美', 'AI Coding', '工程流程'],
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'React Bits')).toMatchObject({
      url: 'https://reactbits.dev/',
      logo: 'RB',
      avatarSrc: '/images/recommended-shares/react-bits-logo.png',
      avatarAlt: 'React Bits 网站图标',
      description: '开源 React 动效组件库，提供可复制、可定制的动画与交互组件，涵盖文字、背景、卡片等分类，适合快速为页面补充有辨识度的动态效果。',
      tags: ['前端审美', 'AI Coding', '工程流程'],
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'MotionSites AI')).toMatchObject({
      url: 'https://motionsites.ai/',
      logo: 'MS',
      avatarSrc: '/images/recommended-shares/motionsites-logo.png',
      avatarAlt: 'MotionSites AI 网站图标',
      description: '收集适用于 Lovable、Bolt、Cursor 和 Claude 的 AI 建站提示词与动态页面案例，包含完整页面、功能区块和动画背景，适合快速寻找视觉方向。',
      tags: ['前端审美', 'AI Coding', '工程流程'],
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Dribbble')).toMatchObject({
      url: 'https://dribbble.com/',
      logo: 'DB',
      description: '汇集网页、产品、品牌、动效与插画作品的设计社区，适合追踪视觉趋势、收集界面灵感，并发现设计师与创意团队。',
      tags: ['前端审美', '技术社区'],
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Learn Claude Code')).toMatchObject({
      url: 'https://github.com/shareAI-lab/learn-claude-code',
      logo: 'LC',
      avatarSrc: '/images/recommended-shares/learn-claude-code-avatar.jpg',
      avatarAlt: 'Learn Claude Code GitHub 项目图标',
      tags: ['开源项目', 'AI Coding', 'AI 学习'],
      githubStars: 70037,
      stars: 5,
    });
    expect(recommendedShares.find((resource) => resource.name === 'Matt Pocock Skills')).toMatchObject({
      url: 'https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me',
      logo: 'MP',
      avatarSrc: '/images/recommended-shares/mattpocock-skills-avatar.jpg',
      avatarAlt: 'Matt Pocock Skills GitHub 项目图标',
      tags: ['开源项目', 'AI Coding', '工程流程'],
      githubStars: 161732,
      stars: 5,
    });
    expect(data).toContain("name: 'Taste Skill'");
    expect(data).toContain("name: 'Learn Claude Code'");
    expect(data).toContain("name: 'Trellis'");
    expect(data).toContain("name: 'Superpowers'");
    expect(data).toContain("name: 'Deep Research Skills'");
    expect(data).toContain("name: 'Minutes'");
    expect(data).toContain("name: 'Matt Pocock Skills'");
    expect(data).toContain("name: 'Conductor'");
    expect(data).toContain("name: '21st.dev'");
    expect(data).toContain("name: 'Dribbble'");
    expect(data).toContain("name: 'Meetily'");
    expect(data).toContain("name: 'Pipecat'");
    expect(data).toContain("name: '2025 Blog Public'");
    expect(data).toContain("name: 'Avoid AI Writing'");
    expect(data).toContain("name: 'LINUX DO'");
    expect(data).toContain("name: '小林面试笔记'");
    expect(data).toContain("name: 'Agent知识库这些年：从Rag到OKF0.2'");
    expect(data).not.toContain("name: 'iLoveIMG'");
    expect(data).not.toContain("name: 'TinyPNG'");
    expect(data).not.toContain("name: 'Magic UI'");
  });

  test('recommends Tencent WeKnora with its repository details and local avatar', () => {
    expect(recommendedShares.filter((resource) => resource.name === 'WeKnora')).toEqual([
      {
        name: 'WeKnora',
        url: 'https://github.com/Tencent/WeKnora',
        logo: 'WK',
        avatarSrc: '/images/recommended-shares/weknora-avatar.png',
        avatarAlt: 'Tencent GitHub 头像',
        description: '腾讯开源的知识库框架，支持文档解析、RAG 检索问答、Agent 推理和 Wiki 整理，可本地部署，适合搭建私有知识库与知识问答应用。',
        tags: ['开源项目', 'AI Coding', 'AI 学习'],
        githubStars: 21151,
        stars: 5,
      },
    ]);
  });

  test('recommends Visual IP Illustrations with its repository details and local avatar', () => {
    expect(recommendedShares.filter((resource) => resource.name === 'Visual IP Illustrations')).toEqual([
      {
        name: 'Visual IP Illustrations',
        url: 'https://github.com/yangchuansheng/visual-ip-illustrations',
        logo: 'VI',
        avatarSrc: '/images/recommended-shares/visual-ip-illustrations-avatar.jpg',
        avatarAlt: 'yangchuansheng GitHub 头像',
        description: '面向文章配图的开源 Codex skill，将概念、流程和隐喻转成 16:9 手绘插图，支持小黑、纸盒、Gopher 等角色，适合保持整篇文章的视觉风格一致。',
        tags: ['开源项目', 'AI Coding', '工程流程'],
        githubStars: 265,
        stars: 3,
      },
    ]);
  });

  test('converts GitHub repository stars into recommendation tiers with a three-star floor', () => {
    expect(getRecommendedShareStars(10000)).toBe(5);
    expect(getRecommendedShareStars(9999)).toBe(4);
    expect(getRecommendedShareStars(1000)).toBe(4);
    expect(getRecommendedShareStars(999)).toBe(3);
    expect(getRecommendedShareStars(0)).toBe(3);
  });

  test('renders attributed reposted articles as a separate resource type', () => {
    const card = readSource('src/components/RecommendationCard.tsx');
    const grid = readSource('src/components/RecommendedShareGrid.tsx');

    expect(card).toContain("article: '转载文章'");
    expect(card).toContain('resource.attribution');
    expect(grid).toContain("{ value: 'article', label: '转载文章' }");
  });

  test('styles the share page with separate light and dark themes from the YYsuni reference layout', () => {
    const css = readGlobalStyles();
    const grid = readSource('src/components/RecommendedShareGrid.tsx');
    const responsiveCss = readSource('src/app/styles/responsive.css');
    const editorialCss = readSource('src/app/styles/editorial.css');

    expect(css).toContain('.share-page');
    expect(css).toContain('.share-page__filters');
    expect(css).toContain('.share-page__grid');
    expect(css).toContain('.share-page__card');
    expect(css).toContain('.share-page__logo');
    const card = readSource('src/components/RecommendationCard.tsx');
    expect(card).toContain('resource.avatarSrc ?');
    expect(card).toContain('src={resource.avatarSrc}');
    expect(card).toContain('alt=""');
    expect(css).toContain(":root[data-theme='summer-day'] .share-page");
    expect(css).toContain(":root[data-theme='summer-night'] .share-page");
    expect(css).toContain(":root[data-theme='summer-day'] .share-page__card");
    expect(css).toContain(":root[data-theme='summer-night'] .share-page__card");
    expect(responsiveCss).toContain('.share-page__grid');
    expect(editorialCss).toMatch(/@media \(max-width: 767px\) \{[\s\S]*?\.resource-kind-filter \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); width: 100%; \}/);
    expect(editorialCss).toMatch(/@media \(max-width: 767px\) \{[\s\S]*?\.resource-kind-filter button \{ min-width: 0; white-space: nowrap; \}/);
  });

  test('keeps filters and cards compact after search results shrink', () => {
    const css = readGlobalStyles();

    expect(readRule(css, '.share-page')).toContain('align-content: start;');
    expect(readRule(css, '.share-page')).toContain('background: transparent;');
    expect(readRule(css, '.share-page')).not.toContain('background: var(--share-bg);');
    expect(readRule(css, '.share-page__panel')).toContain('align-content: start;');
    expect(readRule(css, '.share-page__filters')).toContain('align-content: start;');
    expect(readRule(css, '.share-page__tag-list')).toContain('align-items: center;');
    expect(readRule(css, '.share-page__tag-list button')).toContain('height: 32px;');
    expect(readRule(css, '.share-page__grid')).toContain('align-items: start;');
    expect(readRule(css, '.share-page__card')).toContain('align-content: start;');
    expect(readRule(css, '.share-page__logo')).toContain('border-radius: 999px;');
    expect(readRule(css, '.share-page__logo img')).toContain('object-fit: cover;');
    expect(readRule(css, '.share-page__body')).toContain('align-content: start;');
  });
});
