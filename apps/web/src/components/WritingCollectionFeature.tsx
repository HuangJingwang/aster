import Link from 'next/link';
import { ArrowUpRight, PenLine } from 'lucide-react';
import { getContentHref, type SiteContentItem } from '@/lib/content';
import { getContentCover } from '@/lib/content-cover';
import { formatArchiveDate } from '@/lib/archive-date';
import '@fontsource/lxgw-wenkai-tc/400.css';

export function WritingCollectionFeature({ item, kind }: { item?: SiteContentItem; kind: 'posts' | 'notes' }) {
  if (!item) {
    return <div className="writing-paper writing-paper--empty">
      <div className="writing-paper__label"><span>FIELD NOTES</span><PenLine size={18} aria-hidden="true" /></div>
      <p className="writing-paper__thought">记下，<br />再慢慢想。</p>
      <div className="writing-paper__rules" aria-hidden="true"><i /><i /><i /></div>
      <p className="writing-paper__foot">发现 / 备忘 / 想法</p>
    </div>;
  }
  const cover = getContentCover(item);
  return <Link className="writing-paper writing-paper--link" href={getContentHref(item)}>
    <div className="writing-paper__label"><span>{kind === 'posts' ? '从这一篇读起' : '翻开一则笔记'}</span><ArrowUpRight size={18} aria-hidden="true" /></div>
    <div className={`writing-paper__entry${cover ? '' : ' writing-paper__entry--text'}`}>
      <h2>{item.title}</h2>
      {cover && <img src={cover.imageUrl} alt={cover.altText} />}
    </div>
    <div className="writing-paper__foot"><time dateTime={item.publishedAt}>{formatArchiveDate(item.publishedAt)}</time><span>阅读全文 ↗</span></div>
  </Link>;
}
