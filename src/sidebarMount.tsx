import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import RevisionDiffButton from './components/RevisionDiffButton';

const MOUNT_ID = 'growi-plugin-revision-diff-mount';
const CSS_CLASS_PREFIX = 'PageAccessoriesControl_btn-page-accessories__';

function getContainer(): HTMLElement | null {
  // DEBUG: Sidebarのアンカー要素を探す
  const byPageList = document.querySelector<HTMLElement>('[data-testid="pageListButton"]');
  const byComment = document.querySelector<HTMLElement>('[data-testid="page-comment-button"]');
  console.debug('[revision-diff DEBUG] getContainer: pageListButton=', byPageList, 'page-comment-button=', byComment);

  const anchor = byPageList ?? byComment;
  if (!anchor) {
    // DEBUG: data-testid を持つ全要素を列挙
    const allTestIds = Array.from(document.querySelectorAll('[data-testid]')).map(
      (el) => `${el.tagName}[data-testid="${el.getAttribute('data-testid')}"]`,
    );
    console.debug('[revision-diff DEBUG] 既存の data-testid 一覧:', allTestIds);
    return null;
  }
  console.debug('[revision-diff DEBUG] anchor found:', anchor, 'parent:', anchor.parentElement);
  return anchor.parentElement;
}

function getCssModuleClass(container: HTMLElement): string {
  const btn = container.querySelector('button');
  if (!btn) {
    console.debug('[revision-diff DEBUG] getCssModuleClass: button not found in container', container);
    return '';
  }
  console.debug('[revision-diff DEBUG] button classes:', Array.from(btn.classList));
  const cls = Array.from(btn.classList).find((c) => c.startsWith(CSS_CLASS_PREFIX));
  console.debug('[revision-diff DEBUG] matched cssClass:', cls);
  return cls ?? '';
}

function ensureRoot(container: HTMLElement): { el: HTMLElement; isNew: boolean } {
  const existing = document.getElementById(MOUNT_ID);
  if (existing) return { el: existing, isNew: false };

  const el = document.createElement('div');
  el.id = MOUNT_ID;
  container.appendChild(el);
  console.debug('[revision-diff DEBUG] mount div appended to:', container);
  return { el, isNew: true };
}

let root: Root | null = null;

export function mountOrUpdate(pageId: string): void {
  console.debug('[revision-diff DEBUG] mountOrUpdate called, pageId=', pageId);
  const container = getContainer();
  if (!container) {
    console.warn('[growi-plugin-revision-diff] Sidebar container not found');
    return;
  }

  const cssClass = getCssModuleClass(container);
  const { el, isNew } = ensureRoot(container);

  if (!root || isNew) {
    root = createRoot(el);
  }

  root.render(
    <React.StrictMode>
      <RevisionDiffButton pageId={pageId} cssClass={cssClass} />
    </React.StrictMode>,
  );
}

export function unmount(): void {
  root?.unmount();
  root = null;
  document.getElementById(MOUNT_ID)?.remove();
}
