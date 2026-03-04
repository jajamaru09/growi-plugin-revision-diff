import { unified } from 'unified';
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

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const growiFacade = (window as unknown as {
    growiFacade?: {
      markdownRenderer?: {
        optionsGenerators?: {
          generateViewOptions?: (path: string, options: Record<string, unknown>, toc: () => void) => {
            remarkPlugins?: unknown[];
            rehypePlugins?: unknown[];
          };
        };
      };
    };
  }).growiFacade;

  const options = growiFacade?.markdownRenderer?.optionsGenerators?.generateViewOptions?.(
    '',
    { plantumlUri: null },
    () => {},
  );
  if (options == null) {
    throw new Error('growiFacade が利用できません');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let processor = unified() as any;
  for (const plugin of options.remarkPlugins ?? []) {
    try { processor = processor.use(plugin); } catch { /* 無効なプラグインはスキップ */ }
  }
  for (const plugin of options.rehypePlugins ?? []) {
    try { processor = processor.use(plugin); } catch { /* 無効なプラグインはスキップ */ }
  }
  return String(await processor.process(markdown));
}
