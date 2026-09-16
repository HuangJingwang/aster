export type RecommendedShareKind = 'website' | 'opensource' | 'article';

export interface RecommendedShare {
  name: string;
  url: string;
  logo: string;
  avatarSrc?: string;
  avatarAlt?: string;
  description: string;
  tags: string[];
  stars: number;
  githubStars?: number;
  kind?: RecommendedShareKind;
  attribution?: string;
}

export const categoryOrder = ['全部', '开源项目', 'AI Coding', '前端审美', '工程流程', 'AI 学习', '技术社区'];

export function getRecommendedShareStars(githubStars: number) {
  if (githubStars >= 10000) {
    return 5;
  }

  if (githubStars >= 1000) {
    return 4;
  }

  return 3;
}

export const recommendedShares: RecommendedShare[] = [
  {
    name: 'Superpowers',
    url: 'https://github.com/obra/Superpowers',
    logo: 'SP',
    avatarSrc: '/images/recommended-shares/superpowers-avatar.jpg',
    avatarAlt: 'Superpowers GitHub 项目图标',
    description: '一套给 coding agents 使用的软件开发方法论，用可组合 skills 串起澄清、计划、TDD、实现和验证。',
    tags: ['开源项目', 'AI Coding', '工程流程'],
    githubStars: 247376,
    stars: getRecommendedShareStars(247376),
  },
  {
    name: 'Matt Pocock Skills',
    url: 'https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me',
    logo: 'MP',
    avatarSrc: '/images/recommended-shares/mattpocock-skills-avatar.jpg',
    avatarAlt: 'Matt Pocock Skills GitHub 项目图标',
    description: 'Matt Pocock 的开源 skills 仓库中的 grill-me skill，在动手前持续追问目标、约束和边界，逼近共识后再进入实现。',
    tags: ['开源项目', 'AI Coding', '工程流程'],
    githubStars: 161732,
    stars: getRecommendedShareStars(161732),
  },
  {
    name: 'Learn Claude Code',
    url: 'https://github.com/shareAI-lab/learn-claude-code',
    logo: 'LC',
    avatarSrc: '/images/recommended-shares/learn-claude-code-avatar.jpg',
    avatarAlt: 'Learn Claude Code GitHub 项目图标',
    description: '从 0 到 1 用 Bash 搭一个 nano 版 Claude Code agent harness，适合拆解 coding agent 的最小闭环和工具调用骨架。',
    tags: ['开源项目', 'AI Coding', 'AI 学习'],
    githubStars: 70037,
    stars: getRecommendedShareStars(70037),
  },
  {
    name: 'Taste Skill',
    url: 'https://github.com/Leonxlnx/taste-skill',
    logo: 'TS',
    avatarSrc: '/images/recommended-shares/taste-skill-avatar.jpg',
    avatarAlt: 'Taste Skill GitHub 项目图标',
    description: '给 AI 前端产物加上审美约束的开源 skill 集合，适合减少模板感，强化布局、字体、动效和间距判断。',
    tags: ['开源项目', 'AI Coding', '前端审美'],
    githubStars: 58234,
    stars: getRecommendedShareStars(58234),
  },
  {
    name: 'WeKnora',
    url: 'https://github.com/Tencent/WeKnora',
    logo: 'WK',
    avatarSrc: '/images/recommended-shares/weknora-avatar.png',
    avatarAlt: 'Tencent GitHub 头像',
    description: '腾讯开源的知识库框架，支持文档解析、RAG 检索问答、Agent 推理和 Wiki 整理，可本地部署，适合搭建私有知识库与知识问答应用。',
    tags: ['开源项目', 'AI Coding', 'AI 学习'],
    githubStars: 21151,
    stars: getRecommendedShareStars(21151),
  },
  {
    name: 'Meetily',
    url: 'https://github.com/Zackriya-Solutions/meetily',
    logo: 'ME',
    avatarSrc: '/images/recommended-shares/meetily-avatar.jpg',
    avatarAlt: 'Meetily GitHub 项目图标',
    description: '隐私优先的开源 AI 会议助手，支持本地实时转写、会议总结和 Ollama 等模型接入，适合关注本地化 AI 工作流。',
    tags: ['开源项目', 'AI 学习', 'AI Coding'],
    githubStars: 18223,
    stars: getRecommendedShareStars(18223),
  },
  {
    name: 'Pipecat',
    url: 'https://github.com/pipecat-ai/pipecat',
    logo: 'PC',
    avatarSrc: '/images/recommended-shares/pipecat-avatar.png',
    avatarAlt: 'Pipecat GitHub 项目图标',
    description: '面向语音 Agent、多模态应用和实时 AI 的开源 Python 框架，统一编排语音、模型、传输与服务集成，适合构建低延迟对话应用。',
    tags: ['开源项目', 'AI Coding', 'AI 学习'],
    githubStars: 14743,
    stars: getRecommendedShareStars(14743),
  },
  {
    name: 'Trellis',
    url: 'https://github.com/mindfold-ai/trellis',
    logo: 'TR',
    avatarSrc: '/images/recommended-shares/trellis-avatar.jpg',
    avatarAlt: 'Trellis GitHub 项目图标',
    description: '面向 AI coding 的工程脚手架，把项目规范、任务和记忆持久化进仓库，让每次会话都带着上下文开始。',
    tags: ['开源项目', 'AI Coding', '工程流程'],
    githubStars: 11828,
    stars: getRecommendedShareStars(11828),
  },
  {
    name: 'Avoid AI Writing',
    url: 'https://github.com/conorbronsdon/avoid-ai-writing',
    logo: 'AW',
    description: '面向 AI 文本的结构化审校与改写 skill，识别模板化措辞、空泛拔高和过度结构化，并用二次检查保留更自然的表达。',
    tags: ['开源项目', 'AI Coding', '工程流程'],
    githubStars: 2360,
    stars: getRecommendedShareStars(2360),
  },
  {
    name: '2025 Blog Public',
    url: 'https://github.com/YYsuni/2025-blog-public',
    logo: 'YY',
    avatarSrc: '/images/recommended-shares/yysuni-2025-blog-public-avatar.jpg',
    avatarAlt: '2025 Blog Public GitHub 项目图标',
    description: 'YYsuni 的开源博客项目，主打无需服务器和额外费用即可开始写 blog、管理内容，适合作为个人内容站搭建参考。',
    tags: ['开源项目', '前端审美', '工程流程'],
    githubStars: 1576,
    stars: getRecommendedShareStars(1576),
  },
  {
    name: 'Deep Research Skills',
    url: 'https://github.com/Weizhena/Deep-Research-skills',
    logo: 'DR',
    avatarSrc: '/images/recommended-shares/deep-research-skills-avatar.jpg',
    avatarAlt: 'Deep Research Skills GitHub 项目图标',
    description: '面向 Claude Code、OpenCode 和 Codex 的结构化深度研究 skill，用提纲生成、深入调研和人工确认串起更可控的研究流程。',
    tags: ['开源项目', 'AI Coding', 'AI 学习'],
    githubStars: 1528,
    stars: getRecommendedShareStars(1528),
  },
  {
    name: 'Minutes',
    url: 'https://github.com/silverstein/minutes',
    logo: 'MI',
    description: '本地优先的开源对话记忆工具，把会议、语音备忘和承诺整理成可搜索的 Markdown，并通过 MCP 接入 Codex 等 AI Agent。',
    tags: ['开源项目', 'AI Coding', '工程流程'],
    githubStars: 1291,
    stars: getRecommendedShareStars(1291),
  },
  {
    name: 'Visual IP Illustrations',
    url: 'https://github.com/yangchuansheng/visual-ip-illustrations',
    logo: 'VI',
    avatarSrc: '/images/recommended-shares/visual-ip-illustrations-avatar.jpg',
    avatarAlt: 'yangchuansheng GitHub 头像',
    description: '面向文章配图的开源 Codex skill，将概念、流程和隐喻转成 16:9 手绘插图，支持小黑、纸盒、Gopher 等角色，适合保持整篇文章的视觉风格一致。',
    tags: ['开源项目', 'AI Coding', '工程流程'],
    githubStars: 265,
    stars: getRecommendedShareStars(265),
  },
  {
    name: 'Conductor',
    url: 'https://github.com/zhengzizhe/conductor',
    logo: 'CO',
    avatarSrc: '/images/recommended-shares/conductor-avatar.jpg',
    avatarAlt: 'Conductor GitHub 项目图标',
    description: '原生 macOS 多终端管理器，适合把多个开发任务、Agent 会话和命令行工作流集中到一个更清晰的桌面环境里。',
    tags: ['开源项目', 'AI Coding', '工程流程'],
    githubStars: 86,
    stars: getRecommendedShareStars(86),
  },
  {
    name: '21st.dev',
    url: 'https://21st.dev/',
    logo: '21',
    description: '面向 React 开发者的社区组件与模板库，提供分类筛选、CLI、MCP 和 AI 创建入口，适合快速寻找可复用的前端实现。',
    tags: ['前端审美', 'AI Coding', '工程流程'],
    stars: 5,
  },
  {
    name: 'React Bits',
    url: 'https://reactbits.dev/',
    logo: 'RB',
    avatarSrc: '/images/recommended-shares/react-bits-logo.png',
    avatarAlt: 'React Bits 网站图标',
    description: '开源 React 动效组件库，提供可复制、可定制的动画与交互组件，涵盖文字、背景、卡片等分类，适合快速为页面补充有辨识度的动态效果。',
    tags: ['前端审美', 'AI Coding', '工程流程'],
    stars: 5,
  },
  {
    name: 'MotionSites AI',
    url: 'https://motionsites.ai/',
    logo: 'MS',
    avatarSrc: '/images/recommended-shares/motionsites-logo.png',
    avatarAlt: 'MotionSites AI 网站图标',
    description: '收集适用于 Lovable、Bolt、Cursor 和 Claude 的 AI 建站提示词与动态页面案例，包含完整页面、功能区块和动画背景，适合快速寻找视觉方向。',
    tags: ['前端审美', 'AI Coding', '工程流程'],
    stars: 5,
  },
  {
    name: 'Dribbble',
    url: 'https://dribbble.com/',
    logo: 'DB',
    description: '汇集网页、产品、品牌、动效与插画作品的设计社区，适合追踪视觉趋势、收集界面灵感，并发现设计师与创意团队。',
    tags: ['前端审美', '技术社区'],
    stars: 5,
  },
  {
    name: 'LINUX DO',
    url: 'https://linux.do/',
    logo: 'LD',
    avatarSrc: '/images/recommended-shares/linux-do-logo.svg',
    avatarAlt: 'LINUX DO 网站图标',
    description: '活跃的中文技术社区，适合关注 AI 工具、开发经验、Linux 生态和日常工程实践的讨论与资源分享。',
    tags: ['技术社区', 'AI 学习', 'AI Coding'],
    stars: 5,
  },
  {
    name: '小林面试笔记',
    url: 'https://xiaolinnote.com/',
    logo: 'XL',
    avatarSrc: '/images/recommended-shares/xiaolinnote-logo.png',
    avatarAlt: '小林面试笔记图标',
    description: '用图解方式整理 Agent、RAG、LLM 和大模型工程高频面试题，适合作为 AI 应用开发面试前的系统复习入口。',
    tags: ['AI 学习', 'AI Coding', '工程流程'],
    stars: 5,
  },
  {
    name: 'Agent知识库这些年：从Rag到OKF0.2',
    url: 'https://www.douyin.com/article/7679728760388311921',
    logo: 'OK',
    description: '梳理 Agent 知识库从 RAG 到 OKF 的演进，并讨论用 Markdown、frontmatter 和 Git 管理可审计、可持续演进的知识。',
    tags: ['AI 学习', '工程流程'],
    kind: 'article',
    attribution: '转载自抖音，原作者：波与粒子皆存',
    stars: 5,
  },
];
