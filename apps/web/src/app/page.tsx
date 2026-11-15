import type { Metadata } from 'next';

import { loadSiteContent } from '@/lib/public-content';
import { EditorialHome } from '@/components/EditorialHome';
import { SiteShell } from '@/components/SiteShell';
import { selectEditorialHome } from '@/lib/editorial-home';
import { loadSiteSettings } from '@/lib/settings-repository';
import '@fontsource/lxgw-wenkai-tc/400.css';
import './styles/home-features.css';

export const metadata: Metadata = {
  title: 'Aster · Aster.H 的个人博客',
  description: '文章、笔记、片刻与项目。Aster.H 的个人内容平台。',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  const [content, settings] = await Promise.all([loadSiteContent(), loadSiteSettings()]);
  return <SiteShell><EditorialHome {...selectEditorialHome(content)} socialLinks={settings.profile.socialLinks} /></SiteShell>;
}
