import sanitizeHtml from 'sanitize-html';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export interface MarkdownHeading {
  depth: number;
  text: string;
  slug: string;
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'pre',
  'code',
  'span',
  'figure',
  'figcaption',
  'video',
]);

const allowedAttributes: sanitizeHtml.IOptions['allowedAttributes'] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ['href', 'name', 'target', 'rel', 'class', 'data-xmind-src', 'data-xmind-title'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  code: ['class'],
  div: ['class'],
  button: ['type', 'class', 'data-copy-code', 'aria-label', 'aria-live'],
  span: ['class'],
  figure: ['class'],
  video: ['src', 'controls', 'playsinline', 'preload', 'aria-label'],
};

export async function renderMarkdown(markdown: string): Promise<string> {
  const rendered = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeHeadingIds)
    .use(rehypeCodeBlocks)
    .use(rehypeXmindLinks)
    .use(rehypeVideoLinks)
    .use(rehypeStringify)
    .process(markdown);

  return sanitizeHtml(String(rendered), {
    allowedTags,
    allowedAttributes,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'nofollow noopener noreferrer',
      }),
      img: sanitizeHtml.simpleTransform('img', {
        loading: 'lazy',
      }),
    },
  });
}

// A paragraph containing only a video link opts into inline playback. Keep raw
// HTML disabled and build the player from nodes so labels stay escaped.
function rehypeVideoLinks() {
  return (tree: MarkdownNode) => {
    replaceChildren(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'p' || node.children?.length !== 1) {
        return node;
      }

      const link = node.children[0];
      if (!link) {
        return node;
      }
      const href = link.properties?.href;
      if (link.type !== 'element' || link.tagName !== 'a' || typeof href !== 'string' || !isVideoHref(href)) {
        return node;
      }

      const label = collectText(link).trim() || '视频';
      return {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['markdown-video'] },
        children: [
          {
            type: 'element',
            tagName: 'video',
            properties: { src: href, controls: true, playsInline: true, preload: 'metadata', ariaLabel: label },
            children: [{ type: 'text', value: '浏览器无法播放此视频，请使用下方链接打开。' }],
          },
          {
            type: 'element',
            tagName: 'figcaption',
            children: [{
              type: 'element',
              tagName: 'a',
              properties: { href },
              children: [{ type: 'text', value: `${label} · 打开视频` }],
            }],
          },
        ],
      };
    });
  };
}

function isVideoHref(href: string): boolean {
  // Accept site-root paths and explicit HTTP(S) URLs, never local files,
  // protocol-relative URLs, data URLs, or script schemes.
  if (!/^(?:\/(?![\/\\])|https?:\/\/)/i.test(href) || /[\\\u0000-\u0020]/.test(href)) {
    return false;
  }

  try {
    const url = new URL(href, 'https://video.invalid');
    return /\.(?:mp4|webm|ogv)$/i.test(url.pathname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function rehypeXmindLinks() {
  return (tree: MarkdownNode) => {
    visitTree(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'a') {
        return;
      }

      const href = node.properties?.href;

      if (typeof href !== 'string' || !isXmindHref(href)) {
        return;
      }

      const title = collectText(node).trim() || 'XMind 脑图';
      const className = node.properties?.className;
      const classes = Array.isArray(className) ? className : typeof className === 'string' ? className.split(/\s+/) : [];

      node.properties = {
        ...(node.properties ?? {}),
        className: [...classes.filter((item): item is string => typeof item === 'string'), 'xmind-preview-link'],
        dataXmindSrc: href,
        dataXmindTitle: title,
      };
    });
  };
}

export function extractMarkdownHeadings(markdown: string, minDepth = 2, maxDepth = 3): MarkdownHeading[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const slugger = createHeadingSlugger();
  const headings: MarkdownHeading[] = [];

  visitTree(tree, (node) => {
    if (node.type !== 'heading' || typeof node.depth !== 'number') {
      return;
    }

    const text = collectText(node).trim();

    if (!text) {
      return;
    }

    const slug = slugger.slug(text);

    if (node.depth >= minDepth && node.depth <= maxDepth) {
      headings.push({
        depth: node.depth,
        text,
        slug,
      });
    }
  });

  return headings;
}

function rehypeHeadingIds() {
  return (tree: MarkdownNode) => {
    const slugger = createHeadingSlugger();

    visitTree(tree, (node) => {
      if (node.type !== 'element' || !isHeadingTag(node.tagName)) {
        return;
      }

      const text = collectText(node).trim();

      if (!text) {
        return;
      }

      node.properties = {
        ...(node.properties ?? {}),
        id: slugger.slug(text),
      };
    });
  };
}

function rehypeCodeBlocks() {
  return (tree: MarkdownNode) => {
    replaceChildren(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'pre') {
        return node;
      }

      const code = node.children?.find((child) => child.type === 'element' && child.tagName === 'code');

      if (!code) {
        return node;
      }

      const language = getCodeLanguage(code);
      const codeText = collectText(code);

      code.children = highlightCode(codeText, language);

      return {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['markdown-code-block'],
        },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['markdown-code-block__bar'],
            },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: {
                  className: ['markdown-code-block__language'],
                },
                children: [{ type: 'text', value: language || 'text' }],
              },
              {
                type: 'element',
                tagName: 'button',
                properties: {
                  type: 'button',
                  className: ['markdown-code-block__copy'],
                  dataCopyCode: 'true',
                  ariaLabel: '复制代码块',
                  ariaLive: 'polite',
                },
                children: [{ type: 'text', value: '复制代码' }],
              },
            ],
          },
          node,
        ],
      };
    });
  };
}

interface MarkdownNode {
  type?: string;
  depth?: number;
  tagName?: string;
  value?: unknown;
  children?: MarkdownNode[];
  properties?: Record<string, unknown>;
}

function replaceChildren(node: MarkdownNode, replacer: (node: MarkdownNode) => MarkdownNode): MarkdownNode {
  if (node.children) {
    node.children = node.children.map((child) => replaceChildren(child, replacer));
  }

  return replacer(node);
}

function visitTree(node: MarkdownNode, visitor: (node: MarkdownNode) => void): void {
  visitor(node);

  for (const child of node.children ?? []) {
    visitTree(child, visitor);
  }
}

function collectText(node: MarkdownNode): string {
  if (typeof node.value === 'string') {
    return node.value;
  }

  return (node.children ?? []).map((child) => collectText(child)).join('');
}

function getCodeLanguage(code: MarkdownNode): string {
  const className = code.properties?.className;
  const classes = Array.isArray(className) ? className : typeof className === 'string' ? className.split(/\s+/) : [];
  const languageClass = classes.find((item) => typeof item === 'string' && item.startsWith('language-'));

  return typeof languageClass === 'string' ? languageClass.replace(/^language-/, '') : '';
}

function isXmindHref(href: string): boolean {
  return /\.xmind(?:$|[?#])/i.test(href);
}

function highlightCode(code: string, language: string): MarkdownNode[] {
  if (!['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript'].includes(language)) {
    return [{ type: 'text', value: code }];
  }

  const tokenPattern = /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:async|await|break|case|catch|class|const|continue|default|else|export|extends|finally|for|from|function|if|import|interface|let|new|return|throw|try|type|var|while)\b)/g;
  const nodes: MarkdownNode[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push({ type: 'text', value: code.slice(lastIndex, index) });
    }

    nodes.push({
      type: 'element',
      tagName: 'span',
      properties: {
        className: [`token ${getTokenType(token)}`],
      },
      children: [{ type: 'text', value: token }],
    });
    lastIndex = index + token.length;
  }

  if (lastIndex < code.length) {
    nodes.push({ type: 'text', value: code.slice(lastIndex) });
  }

  return nodes;
}

function getTokenType(token: string): string {
  if (token.startsWith('//')) {
    return 'comment';
  }

  if (/^["'`]/.test(token)) {
    return 'string';
  }

  return 'keyword';
}

function isHeadingTag(tagName: string | undefined): boolean {
  return Boolean(tagName && /^h[1-6]$/.test(tagName));
}

function createHeadingSlugger() {
  const seen = new Map<string, number>();

  return {
    slug(text: string): string {
      const base = slugifyHeading(text) || 'section';
      const count = (seen.get(base) ?? 0) + 1;
      seen.set(base, count);

      return count === 1 ? base : `${base}-${count}`;
    },
  };
}

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .replace(/[^\p{Letter}\p{Number}\s_-]+/gu, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
