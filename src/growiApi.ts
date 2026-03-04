import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
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

  try {
    const options = growiFacade?.markdownRenderer?.optionsGenerators?.generateViewOptions?.(
      '',
      { plantumlUri: null },
      () => {},
    );
    if (options) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let processor = unified() as any;
      if (Array.isArray(options.remarkPlugins)) {
        for (const plugin of options.remarkPlugins) {
          processor = processor.use(plugin);
        }
      }
      if (Array.isArray(options.rehypePlugins)) {
        for (const plugin of options.rehypePlugins) {
          processor = processor.use(plugin);
        }
      }
      return String(await processor.process(markdown));
    }
  } catch {
    // growiFacade が利用できない場合はフォールバック
  }

  // フォールバック: remark-gfm を含む基本パイプライン
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(result);
}
