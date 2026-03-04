import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import RevisionDiffButton from './components/RevisionDiffButton';

const MOUNT_ID = 'growi-plugin-revision-diff-mount';
const CSS_CLASS_PREFIX = 'PageAccessoriesControl_btn-page-accessories__';

function getContainer(): HTMLElement | null {
  const anchor =
    document.querySelector<HTMLElement>('[data-testid="pageListButton"]') ??
    document.querySelector<HTMLElement>('[data-testid="page-comment-button"]');

  if (!anchor) return null;
  return anchor.parentElement;
}

function getCssModuleClass(container: HTMLElement): string {
  const btn = container.querySelector('button');
  if (!btn) return '';
  const cls = Array.from(btn.classList).find((c) => c.startsWith(CSS_CLASS_PREFIX));
  return cls ?? '';
}

function ensureRoot(container: HTMLElement): { el: HTMLElement; isNew: boolean } {
  const existing = document.getElementById(MOUNT_ID);
  if (existing) return { el: existing, isNew: false };

  const el = document.createElement('div');
  el.id = MOUNT_ID;
  container.appendChild(el);
  return { el, isNew: true };
}

let root: Root | null = null;

export function mountOrUpdate(pageId: string): void {
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
