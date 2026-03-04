import { createPageChangeListener } from './src/growiNavigation';
import * as sidebarMount from './src/sidebarMount';
import type { PageChangeCallback } from './src/growiNavigation';

const PLUGIN_NAME = 'growi-plugin-revision-diff';

declare global {
  interface Window {
    pluginActivators: Record<
      string,
      {
        activate: () => void;
        deactivate: () => void;
      }
    >;
  }
}

let listener: ReturnType<typeof createPageChangeListener> | null = null;

const onPageChange: PageChangeCallback = (ctx) => {
  if (ctx.mode === 'edit') {
    sidebarMount.unmount();
  } else {
    sidebarMount.mountOrUpdate(ctx.pageId);
  }
};

// DEBUG: スクリプトのロード確認（console.log = Verboseフィルタ不要）
console.log('[revision-diff DEBUG] client-entry loaded, registering pluginActivators');

window.pluginActivators = window.pluginActivators ?? {};
window.pluginActivators[PLUGIN_NAME] = {
  activate() {
    console.log('[revision-diff DEBUG] activate() called');
    listener = createPageChangeListener(onPageChange);
    listener.start();
  },
  deactivate() {
    listener?.stop();
    listener = null;
    sidebarMount.unmount();
  },
};
