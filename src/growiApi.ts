import { unified } from 'unified';
import remarkParse from 'remark-parse';
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
  const res = await fetch(`/api/v3/revisions/list?pageId=${encodeURIComponent(pageId)}&limit=100`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`リビジョン取得に失敗しました: ${res.status}`);
  }
  const data = (await res.json()) as { docs: Revision[] };
  return assignRevisionNos(data.docs);
}

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const growiFacade = (window as unknown as { growiFacade?: {
    markdownRenderer?: {
      optionsGenerators?: {
        generateViewOptions?: () => {
          remarkPlugins?: unknown[];
          rehypePlugins?: unknown[];
        };
      };
    };
  } }).growiFacade;

  const options = growiFacade?.markdownRenderer?.optionsGenerators?.generateViewOptions?.();

  if (options) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let processor = unified() as any;
      if (options.remarkPlugins && Array.isArray(options.remarkPlugins)) {
        for (const plugin of options.remarkPlugins) {
          processor = processor.use(plugin);
        }
      }
      if (options.rehypePlugins && Array.isArray(options.rehypePlugins)) {
        for (const plugin of options.rehypePlugins) {
          processor = processor.use(plugin);
        }
      }
      return String(await processor.process(markdown));
    } catch (e) {
      console.warn('[growi-plugin-revision-diff] growiFacade rendering failed, falling back:', e);
    }
  }

  // フォールバック: 基本的なMarkdown→HTML変換
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(result);
}
