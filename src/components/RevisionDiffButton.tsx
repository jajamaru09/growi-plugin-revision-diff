import React, { useState, useEffect } from 'react';
import RevisionDiffModal from './RevisionDiffModal';

interface RevisionDiffButtonProps {
  initialPageId: string;
  buttonClass: string;
  onRegisterUpdater: (fn: (id: string) => void) => void;
}

const RevisionDiffButton: React.FC<RevisionDiffButtonProps> = ({
  initialPageId,
  buttonClass,
  onRegisterUpdater,
}) => {
  const [pageId, setPageId] = useState(initialPageId);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onRegisterUpdater((newId) => {
      setPageId(newId);
      setIsOpen(false);
    });
  }, [onRegisterUpdater]);

  return (
    <>
      <button
        type="button"
        className={buttonClass.replace(/\bundefined\b/g, '').trim()}
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
