import { createRoot, type Root } from 'react-dom/client';
import RevisionDiffButton from './components/RevisionDiffButton';

const MOUNT_ID = 'growi-plugin-revision-diff-mount';

let root: Root | null = null;
let updatePageId: ((id: string) => void) | null = null;

function getSidebarContainer(): Element | null {
  const primary = document.querySelector('[data-testid="pageListButton"]');
  const fallback = document.querySelector('[data-testid="page-comment-button"]');
  // DEBUG
  console.log('[revision-diff DEBUG] getSidebarContainer: primary=', primary, 'fallback=', fallback);
  return (primary ?? fallback)?.parentElement ?? null;
}

function getButtonClass(): string {
  const existingBtn = document.querySelector('[data-testid="pageListButton"] button');
  // DEBUG
  console.log('[revision-diff DEBUG] getButtonClass: existingBtn=', existingBtn, 'className=', existingBtn?.className);
  return (
    existingBtn?.className ??
    'btn btn-outline-neutral-secondary rounded-pill py-1 px-lg-3'
  );
}

export function mountSidebar(pageId: string): void {
  console.log('[revision-diff DEBUG] mountSidebar called, pageId=', pageId);

  if (document.getElementById(MOUNT_ID) != null) {
    console.log('[revision-diff DEBUG] already mounted, updating pageId');
    updatePageId?.(pageId);
    return;
  }

  const container = getSidebarContainer();
  if (container == null) {
    console.warn('[growi-plugin-revision-diff] Sidebar container not found');
    return;
  }

  const mountPoint = document.createElement('div');
  mountPoint.id = MOUNT_ID;
  container.appendChild(mountPoint);
  root = createRoot(mountPoint);
  root.render(
    <RevisionDiffButton
      initialPageId={pageId}
      buttonClass={getButtonClass()}
      onRegisterUpdater={(fn) => {
        updatePageId = fn;
      }}
    />,
  );
}

export function unmountSidebar(): void {
  root?.unmount();
  root = null;
  updatePageId = null;
  document.getElementById(MOUNT_ID)?.remove();
}
