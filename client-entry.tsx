import { createPageChangeListener } from './src/growiNavigation';
import type { GrowiPageContext } from './src/pageContext';
import { mountSidebar, unmountSidebar } from './src/sidebarMount';

declare global {
  interface Window {
    pluginActivators?: Record<string, { activate(): void; deactivate(): void }>;
  }
}

const PLUGIN_NAME = 'growi-plugin-revision-diff';

// DEBUG
console.log('[revision-diff DEBUG] client-entry loaded');

async function handlePageChange(ctx: GrowiPageContext): Promise<void> {
  console.log('[revision-diff DEBUG] handlePageChange', ctx);
  const pageId = ctx.pageId.replace('/', '');
  mountSidebar(pageId);
}

const { start, stop } = createPageChangeListener(handlePageChange);

function activate(): void {
  console.log('[revision-diff DEBUG] activate() called');
  start();
}

function deactivate(): void {
  stop();
  unmountSidebar();
}

if (window.pluginActivators == null) {
  window.pluginActivators = {};
}
window.pluginActivators[PLUGIN_NAME] = { activate, deactivate };
