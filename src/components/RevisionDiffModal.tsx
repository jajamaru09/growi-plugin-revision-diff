import React, { useEffect, useState, useCallback } from 'react';
import { fetchRevisions } from '../growiApi';
import type { DiffMode, RevisionWithNo } from '../types';
import RevisionSelector from './RevisionSelector';
import DiffViewer from './DiffViewer';
import '../styles/modal.css';

interface RevisionDiffModalProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RevisionDiffModal: React.FC<RevisionDiffModalProps> = ({ pageId, isOpen, onClose }) => {
  const [revisions, setRevisions] = useState<RevisionWithNo[]>([]);
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);
  const [mode, setMode] = useState<DiffMode>('markdown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setRevisions([]);
    setLeftId(null);
    setRightId(null);

    fetchRevisions(pageId)
      .then((data) => {
        setRevisions(data);
        if (data.length >= 2) {
          setLeftId(data[data.length - 2]._id);
          setRightId(data[data.length - 1]._id);
        } else if (data.length === 1) {
          setLeftId(data[0]._id);
          setRightId(data[0]._id);
        }
      })
      .catch((e) => {
        console.error('[growi-plugin-revision-diff]', e);
        setError('リビジョン一覧の取得に失敗しました。');
      })
      .finally(() => setLoading(false));
  }, [isOpen, pageId]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const leftRevision = revisions.find((r) => r._id === leftId) ?? null;
  const rightRevision = revisions.find((r) => r._id === rightId) ?? null;

  if (!isOpen) return null;

  return (
    <div
      className="growi-plugin-revision-diff-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="リビジョン差分確認"
      onClick={handleOverlayClick}
    >
      <div className="growi-plugin-revision-diff-modal">
        {/* ヘッダー */}
        <div className="growi-plugin-revision-diff-header">
          <span className="growi-plugin-revision-diff-title">リビジョン差分確認</span>
          <div className="growi-plugin-revision-diff-mode-tabs">
            <button
              type="button"
              className={`growi-plugin-revision-diff-tab${mode === 'markdown' ? ' active' : ''}`}
              onClick={() => setMode('markdown')}
            >
              Markdown
            </button>
            <button
              type="button"
              className={`growi-plugin-revision-diff-tab${mode === 'html' ? ' active' : ''}`}
              onClick={() => setMode('html')}
            >
              HTML
            </button>
          </div>
          <button
            type="button"
            className="growi-plugin-revision-diff-close"
            aria-label="閉じる"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* セレクター行 */}
        {!loading && !error && (
          <div className="growi-plugin-revision-diff-selectors">
            <div className="growi-plugin-revision-diff-selector-group">
              <span className="growi-plugin-revision-diff-selector-label">比較元</span>
              <RevisionSelector
                revisions={revisions}
                selectedId={leftId}
                onChange={setLeftId}
              />
            </div>
            <span className="growi-plugin-revision-diff-arrow">→</span>
            <div className="growi-plugin-revision-diff-selector-group">
              <span className="growi-plugin-revision-diff-selector-label">比較先</span>
              <RevisionSelector
                revisions={revisions}
                selectedId={rightId}
                onChange={setRightId}
              />
            </div>
          </div>
        )}

        {/* コンテンツ */}
        <div className="growi-plugin-revision-diff-body">
          {loading && (
            <div className="growi-plugin-revision-diff-loading">読み込み中...</div>
          )}
          {error && (
            <div className="growi-plugin-revision-diff-error">{error}</div>
          )}
          {!loading && !error && leftRevision && rightRevision && (
            <DiffViewer
              leftBody={leftRevision.body}
              rightBody={rightRevision.body}
              mode={mode}
            />
          )}
          {!loading && !error && (!leftRevision || !rightRevision) && (
            <div className="growi-plugin-revision-diff-empty">
              比較するリビジョンを選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevisionDiffModal;
