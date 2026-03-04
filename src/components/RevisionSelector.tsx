import React from 'react';
import type { RevisionWithNo } from '../types';

interface RevisionSelectorProps {
  revisions: RevisionWithNo[];
  selectedId: string | null;
  onChange: (id: string) => void;
}

const RevisionSelector: React.FC<RevisionSelectorProps> = ({ revisions, selectedId, onChange }) => {
  return (
    <select
      className="growi-plugin-revision-diff-selector form-select form-select-sm"
      value={selectedId ?? ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        リビジョンを選択...
      </option>
      {revisions.map((rev) => (
        <option key={rev._id} value={rev._id}>
          {rev.label}
        </option>
      ))}
    </select>
  );
};

export default RevisionSelector;
