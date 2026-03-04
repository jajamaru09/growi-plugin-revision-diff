import React, { useEffect, useState } from 'react';
import { diffLines } from 'diff';
import htmldiff from 'htmldiff-js';
import { renderMarkdownToHtml } from '../growiApi';
import type { DiffMode } from '../types';

interface DiffViewerProps {
  leftBody: string;
  rightBody: string;
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

const HtmlDiffView: React.FC<{ leftBody: string; rightBody: string }> = ({
  leftBody,
  rightBody,
}) => {
  const [diffHtml, setDiffHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([renderMarkdownToHtml(leftBody), renderMarkdownToHtml(rightBody)])
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
  }, [leftBody, rightBody]);

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

const DiffViewer: React.FC<DiffViewerProps> = ({ leftBody, rightBody, mode }) => {
  if (!leftBody && !rightBody) {
    return (
      <div className="growi-plugin-revision-diff-empty">
        左右のリビジョンを選択してください
      </div>
    );
  }

  if (mode === 'markdown') {
    return <MarkdownDiffView leftBody={leftBody} rightBody={rightBody} />;
  }

  return <HtmlDiffView leftBody={leftBody} rightBody={rightBody} />;
};

export default DiffViewer;
