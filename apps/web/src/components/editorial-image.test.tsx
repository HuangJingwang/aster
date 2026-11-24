// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test, vi } from 'vitest';
import { EditorialImage } from './EditorialImage';

test('failed images disappear or expose a text logo, and a changed source can recover', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  const root = createRoot(host);
  try {
    await act(async () => root.render(<EditorialImage src="/missing.png" alt="封面" />));
    await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
    expect(host.querySelector('img')).toBeNull();
    await act(async () => root.render(<EditorialImage src="/logo.png" alt="" fallback="RB" />));
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/logo.png');
    await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
    expect(host.textContent).toBe('RB');
  } finally { await act(async () => root.unmount()); vi.unstubAllGlobals(); }
});
