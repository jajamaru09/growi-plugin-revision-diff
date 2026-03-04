import React, { useEffect, useState } from 'react';
import { diffLines } from 'diff';
import htmldiff from 'htmldiff-js';
import { extractRevisionHtml } from '../growiApi';
import type { DiffMode, RevisionWithNo } from '../types';

interface DiffViewerProps {
  leftRevision: RevisionWithNo;
  rightRevision: RevisionWithNo;
  pageId: string;
  mode: DiffMode;
}

const MarkdownDiffView: React.FC<{ leftBody: string; rightBody: string }> = ({
  leftBody,
  rightBody,
}) => {
  const changes = diffLines(leftBody, rightBody);

  return (
    <pre className="growi-plugin-revision-diff-markdown-diff">
      {changes.map((change, i) => {
        let className = 'growi-plugin-revision-diff-line';
        if (change.added) className += ' growi-plugin-revision-diff-added';
        if (change.removed) className += ' growi-plugin-revision-diff-removed';
        return (
          <span key={i} className={className}>
            {change.value}
          </span>
        );
      })}
    </pre>
  );
};

const HtmlDiffView: React.FC<{
  leftRevision: RevisionWithNo;
  rightRevision: RevisionWithNo;
  pageId: string;
}> = ({ leftRevision, rightRevision, pageId }) => {
  const [diffHtml, setDiffHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      extractRevisionHtml(pageId, leftRevision._id),
      extractRevisionHtml(pageId, rightRevision._id),
    ])
      .then(([leftHtml, rightHtml]) => {
        if (cancelled) return;
        const diff = htmldiff.execute(leftHtml, rightHtml);
        setDiffHtml(diff);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('[growi-plugin-revision-diff] HTML diff error:', e);
        setError('HTMLレンダリングに失敗しました。');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageId, leftRevision._id, rightRevision._id]);

  if (loading) {
    return (
      <div className="growi-plugin-revision-diff-loading">レンダリング中...</div>
    );
  }
  if (error) {
    return <div className="growi-plugin-revision-diff-error">{error}</div>;
  }

  return (
    <div
      className="growi-plugin-revision-diff-html-diff"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: diffHtml }}
    />
  );
};

const DiffViewer: React.FC<DiffViewerProps> = ({ leftRevision, rightRevision, pageId, mode }) => {
  if (mode === 'markdown') {
    return <MarkdownDiffView leftBody={leftRevision.body} rightBody={rightRevision.body} />;
  }

  return <HtmlDiffView leftRevision={leftRevision} rightRevision={rightRevision} pageId={pageId} />;
};

export default DiffViewer;
