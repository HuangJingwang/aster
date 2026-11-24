'use client';

import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from 'react';

/** Broken covers collapse to text layouts; small logos may supply initials. */
export function EditorialImage({ src, fallback = null, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback?: ReactNode }) {
  const image = useRef<HTMLImageElement>(null);
  const [failedSource, setFailedSource] = useState<string>();
  useEffect(() => {
    // Also handle failures that happened before hydration attached onError.
    if (image.current?.complete && !image.current.naturalWidth) setFailedSource(src);
  }, [src]);
  if (failedSource === src) return <>{fallback}</>;
  return <img {...props} src={src} ref={image} onError={() => setFailedSource(src)} />;
}
