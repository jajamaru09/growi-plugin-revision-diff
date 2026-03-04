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

window.pluginActivators = window.pluginActivators ?? {};
window.pluginActivators[PLUGIN_NAME] = {
  activate() {
    listener = createPageChangeListener(onPageChange);
    listener.start();
  },
  deactivate() {
    listener?.stop();
    listener = null;
    sidebarMount.unmount();
  },
};
