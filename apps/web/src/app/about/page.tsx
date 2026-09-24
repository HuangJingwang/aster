import { ArrowUpRight, Atom, BookOpen, Braces, Code2, FileText, FolderGit2, GitBranch, Rocket, StickyNote } from 'lucide-react';
import Link from 'next/link';

import { SiteShell } from '@/components/SiteShell';
import { loadPublicPageMetadata } from '@/lib/page-metadata';
import { loadSiteSettings } from '@/lib/settings-repository';
import { HeroCharacter } from '@/components/EditorialMotion';
import { AboutPortraitMotion, ReaderReveal } from '@/components/ReaderMotion';
import styles from './about.module.css';

const contentSections = [
  {
    title: '文章与笔记',
    href: '/posts',
    description: '技术问题、学习笔记，还有做完一件事之后的复盘。',
    Icon: BookOpen,
  },
  {
    title: '推荐分享',
    href: '/moments',
    description: '收集值得再打开的网站、开源项目和学习资料。',
    Icon: StickyNote,
  },
  {
    title: '个人项目',
    href: '/projects',
    description: '记录做过的项目，也留下实现过程中的选择和问题。',
    Icon: FolderGit2,
  },
] as const;

const stackItems = [
  { label: 'Next.js', Icon: Code2 },
  { label: 'React', Icon: Atom },
  { label: 'TypeScript', Icon: Braces },
  { label: 'Markdown', Icon: FileText },
  { label: 'GitHub', Icon: GitBranch },
  { label: 'Vercel', Icon: Rocket },
] as const;

const socialIconSources = [
  {
    variant: 'github',
    src: '/images/reference-social/github.svg',
    matches: ['github'],
  },
  {
    variant: 'juejin',
    src: '/images/reference-social/juejin.svg',
    matches: ['juejin', 'juejin.cn', '掘金'],
  },
] as const;

export function generateMetadata() {
  return loadPublicPageMetadata({
    title: '关于',
    description: '关于 Aster.H 和 Aster 个人内容平台。',
    path: '/about',
  });
}

export default async function AboutPage() {
  const settings = await loadSiteSettings();

  return (
    <SiteShell>
      <main className={`page-main narrow about-page ${styles.page}`}>
        <section className={styles.hero} aria-label="关于 Aster">
          <ReaderReveal className={styles.intro}>
            <p className={styles.eyebrow}>关于本站</p>
            <h1><span>你好，我是</span>Aster.H<span className={styles.period}>.</span></h1>
            <p className={styles.lead}>这里是 Aster，记录技术、项目，也留一点日常。</p>
            {settings.profile.socialLinks.length > 0 ? (
              <nav className="about-social" aria-label="社交链接">
                {settings.profile.socialLinks.map((link) => {
                  const socialIcon = getSocialIcon(link);
                  return (
                    <a
                      className={`about-social__link${socialIcon ? ` about-social__link--${socialIcon.variant}` : ''}`}
                      key={`${link.label}-${link.href}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label}（在新标签页打开）`}
                    >
                      {socialIcon ? (
                        <img className={`about-social__icon about-social__icon--${socialIcon.variant}`} src={socialIcon.src} alt="" width="20" height="20" aria-hidden="true" />
                      ) : null}
                      <span>{link.label}</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  );
                })}
              </nav>
            ) : null}
          </ReaderReveal>
          <div className={styles.portrait}>
            <AboutPortraitMotion><HeroCharacter /></AboutPortraitMotion>
          </div>
        </section>

        <section className="about-note" aria-labelledby="about-writing">
          <ReaderReveal className={styles.sectionIntro}>
            <h2 id="about-writing">写在这里</h2>
            <p>Aster 是 Aster.H 的个人内容平台。文章、笔记和日常记录放在一起，方便慢慢整理，也方便以后回看。</p>
          </ReaderReveal>
          <ul className="about-note__list" aria-label="站点内容">
            {contentSections.map(({ title, description, Icon, href }, index) => (
              <ReaderReveal as="li" className="about-note__item" key={title} index={index}>
                <Link className="about-content-link" href={href}>
                  <span className="about-note__item-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                  <ArrowUpRight className="about-content-link__arrow" size={22} aria-hidden="true" />
                </Link>
              </ReaderReveal>
            ))}
          </ul>
        </section>

        <ReaderReveal className={styles.build}>
          <section className={styles.buildCopy} aria-labelledby="about-building">
            <h2 id="about-building">这个网站怎么搭的</h2>
            <p>页面用 Next.js 和 React 搭建，文章用 Markdown 保存，代码和内容一起放在 GitHub 仓库里，部署在 Vercel。以后要修改、备份或迁移，都有文件可查。</p>
          </section>
          <div className="about-note__meta">
            <h3>技术栈</h3>
            <ul className="about-stack" aria-label="技术栈">
              {stackItems.map(({ label, Icon }) => (
                <li key={label}>
                  <Icon className="about-stack__icon" size={20} strokeWidth={1.5} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </ReaderReveal>
      </main>
    </SiteShell>
  );
}

function getSocialIcon(link: { label: string; href: string }) {
  const searchable = `${link.label} ${link.href}`.toLowerCase();

  return socialIconSources.find((item) => item.matches.some((match) => searchable.includes(match)));
}
