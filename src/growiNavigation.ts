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
    console.debug('[revision-diff DEBUG] start(): window.navigation=', nav, 'location.pathname=', location.pathname);
    if (!nav) {
      console.warn('[revision-diff DEBUG] Navigation API not available, falling back to manual fire');
    }
    if (isListening) return;
    isListening = true;
    if (nav) nav.addEventListener('navigate', onNavigate);

    const { pathname, hash } = location;
    const pageId = extractPageId(pathname);
    console.debug('[revision-diff DEBUG] initial pathname=', pathname, 'pageId=', pageId);
    if (pageId) {
      const revisionId = new URL(location.href).searchParams.get('revisionId') ?? undefined;
      tryFire(pageId, hashToMode(hash), revisionId);
    } else {
      // DEBUG: pageId が取れない場合はURLパターンが合っていない
      console.debug('[revision-diff DEBUG] pageId not extracted from pathname. Trying mountOrUpdate directly...');
      // Growiがページ遷移後にこのスクリプトを実行する場合、pathが /page-path 形式のこともある
      // その場合はpageIdとしてパス全体を渡してみる
      const fallbackPageId = pathname.replace(/^\//, '');
      if (fallbackPageId) {
        console.debug('[revision-diff DEBUG] fallback: using pathname as pageId=', fallbackPageId);
        tryFire(fallbackPageId, hashToMode(hash), undefined);
      }
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
