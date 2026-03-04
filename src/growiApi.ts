import type { Revision, RevisionWithNo } from './types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

function assignRevisionNos(revisions: Revision[]): RevisionWithNo[] {
  const sorted = [...revisions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return sorted.map((rev, index) => ({
    ...rev,
    revisionNo: index + 1,
    label: `${index + 1} - ${rev._id.slice(0, 8)} - ${formatDate(rev.createdAt)}`,
  }));
}

export async function fetchRevisions(pageId: string): Promise<RevisionWithNo[]> {
  const res = await fetch(`/_api/v3/revisions/list?pageId=${encodeURIComponent(pageId)}&limit=100`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`リビジョン取得に失敗しました: ${res.status}`);
  }
  const data = (await res.json()) as { revisions: Revision[] };
  return assignRevisionNos(data.revisions);
}

const CONTENT_SELECTORS = [
  '.growi-page-content',
  '.wiki',
  '[data-testid="page-body"]',
  'main',
];

async function waitForContent(
  iframe: HTMLIFrameElement,
  timeout = 15000,
): Promise<Element> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const sel of CONTENT_SELECTORS) {
      const el = iframe.contentDocument?.querySelector(sel);
      if (el && el.innerHTML.trim() !== '') return el;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('コンテンツの読み込みがタイムアウトしました');
}

export async function extractRevisionHtml(pageId: string, revisionId: string): Promise<string> {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1280px;height:900px;visibility:hidden';
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve, reject) => {
      iframe.onload = () => resolve();
      iframe.onerror = () => reject(new Error('iframe 読み込みエラー'));
      iframe.src = `${pageId}?revisionId=${encodeURIComponent(revisionId)}`;
    });

    const content = await waitForContent(iframe);
    return content.innerHTML;
  } finally {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  }
}
