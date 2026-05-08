import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useMatrix } from '../context/MatrixContext';

const CurrentMatrixTitle: React.FC = () => {
  const { savedMatrices, currentMatrixId, renameMatrix } = useMatrix();
  const loaded = currentMatrixId !== null
    ? savedMatrices.find((m) => m.id === currentMatrixId)
    : undefined;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setEditing(false);
    setDraft(loaded?.title ?? '');
  }, [currentMatrixId, loaded?.title]);

  if (!loaded) return null;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== loaded.title) {
      renameMatrix(loaded.id, trimmed);
    } else {
      setDraft(loaded.title);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(loaded.title);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {editing ? (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') cancel();
          }}
          autoFocus
          className="text-xl font-semibold text-center px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="group flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
          title="Click to rename"
        >
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {loaded.title}
          </span>
          <Pencil
            size={16}
            className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200"
          />
        </button>
      )}
    </div>
  );
};

export default CurrentMatrixTitle;
