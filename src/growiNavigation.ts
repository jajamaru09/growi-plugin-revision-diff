import { extractPageId, type GrowiPageContext, type PageMode } from './pageContext';

export type PageChangeCallback = (ctx: GrowiPageContext) => void | Promise<void>;

function hashToMode(hash: string): PageMode {
  return hash === '#edit' ? 'edit' : 'view';
}

export function createPageChangeListener(callback: PageChangeCallback): {
  start: () => void;
  stop: () => void;
} {
  let lastKey: string | null = null;
  let isListening = false;

  function tryFire(pageId: string, mode: PageMode, revisionId?: string): void {
    const key = `${pageId}::${mode}::${revisionId ?? ''}`;
    if (key === lastKey) return;
    lastKey = key;

    try {
      const result = callback({ pageId: `/${pageId}`, mode, revisionId });
      if (result instanceof Promise) {
        result.catch((e) => {
          console.error('[growi-plugin-revision-diff] callback error', e);
        });
      }
    } catch (e) {
      console.error('[growi-plugin-revision-diff] callback error', e);
    }
  }

  function onNavigate(e: Event): void {
    const dest = new URL((e as unknown as { destination: { url: string } }).destination.url);
    const pageId = extractPageId(dest.pathname);
    if (!pageId) return;
    const revisionId = dest.searchParams.get('revisionId') ?? undefined;
    tryFire(pageId, hashToMode(dest.hash), revisionId);
  }

  function start(): void {
    const nav = (window as unknown as { navigation?: EventTarget }).navigation;
    if (!nav) return;
    if (isListening) return;
    isListening = true;
    nav.addEventListener('navigate', onNavigate);

    const { pathname, hash } = location;
    const pageId = extractPageId(pathname);
    if (pageId) {
      const revisionId = new URL(location.href).searchParams.get('revisionId') ?? undefined;
      tryFire(pageId, hashToMode(hash), revisionId);
    }
  }

  function stop(): void {
    const nav = (window as unknown as { navigation?: EventTarget }).navigation;
    nav?.removeEventListener('navigate', onNavigate);
    isListening = false;
    lastKey = null;
  }

  return { start, stop };
}
