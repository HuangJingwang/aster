import type { Metadata } from 'next';

import { PersistentPublicBackground } from '@/components/PersistentPublicBackground';
import { PublicPersistentNav } from '@/components/PublicPersistentNav';
import { buildPublicNavigation } from '@/lib/navigation';
import { buildSiteMetadata, resolvePublicSiteUrl } from '@/lib/seo';
import { loadSiteSettings } from '@/lib/settings-repository';
import { getThemeInitScript } from '@/lib/site-theme';
import './styles/base.css';
import './styles/public.css';
import './styles/home.css';
import './styles/content.css';
import './styles/leetcode.css';
import './styles/share.css';
import './styles/admin.css';
import './styles/responsive.css';
import './styles/journal.css';
import './styles/editorial.css';
import './styles/reader.css';
import './styles/writing-collection.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadSiteSettings();

  return buildSiteMetadata(
    settings,
    resolvePublicSiteUrl({
      configuredUrl: process.env.PUBLIC_SITE_URL,
      productionHost: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    }),
  );
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await loadSiteSettings();
  const navItems = buildPublicNavigation(settings.navigation);

  return (
    <html lang="zh-CN" data-theme="summer-night" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body>
        <PersistentPublicBackground />
        <PublicPersistentNav title={settings.profile.title} navItems={navItems} />
        {children}
      </body>
    </html>
  );
}
