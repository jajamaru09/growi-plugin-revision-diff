import React, { useState, useEffect } from 'react';
import RevisionDiffModal from './RevisionDiffModal';

interface RevisionDiffButtonProps {
  pageId: string;
  cssClass: string;
}

const RevisionDiffButton: React.FC<RevisionDiffButtonProps> = ({ pageId, cssClass }) => {
  const [isOpen, setIsOpen] = useState(false);

  // ページ遷移時にモーダルを閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pageId]);

  return (
    <>
      <button
        type="button"
        className={`btn btn-outline-neutral-secondary rounded-pill py-1 px-lg-3 ${cssClass}`}
        onClick={() => setIsOpen(true)}
        title="リビジョン差分確認"
      >
        <span className="material-symbols-outlined">difference</span>
        <span className="d-none d-lg-inline ms-1">差分確認</span>
      </button>
      <RevisionDiffModal
        pageId={pageId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default RevisionDiffButton;
