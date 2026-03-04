export type PageMode = 'view' | 'edit';

export interface GrowiPageContext {
  pageId: string;
  mode: PageMode;
  revisionId?: string;
}

const PAGE_ID_PATTERN = /^\/([0-9a-f]{24})$/i;

export function isPageIdUrl(pathname: string): boolean {
  return PAGE_ID_PATTERN.test(pathname);
}

export function extractPageId(pathname: string): string | null {
  const match = PAGE_ID_PATTERN.exec(pathname);
  return match ? match[1] : null;
}
