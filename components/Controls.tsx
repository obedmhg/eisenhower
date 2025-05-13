import React, { useState } from 'react';
import { useMatrix } from '../context/MatrixContext';

const Controls: React.FC = () => {
  const { createNewMatrix, saveMatrix } = useMatrix();
  const [isSaving, setIsSaving] = useState(false);
  const [matrixTitle, setMatrixTitle] = useState('');

  const handleNewMatrix = () => {
    if (window.confirm('Are you sure you want to create a new matrix? This will clear all current tasks.')) {
      createNewMatrix();
    }
  };

  const handleSaveClick = () => {
    setIsSaving(true);
    setMatrixTitle(`Matrix - ${new Date().toLocaleDateString()}`);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matrixTitle.trim()) {
      saveMatrix(matrixTitle.trim());
      setIsSaving(false);
      setMatrixTitle('');
    }
  };

  const handleCancel = () => {
    setIsSaving(false);
    setMatrixTitle('');
  };

  return (
    <div className="flex justify-center my-8 space-x-4">
      {!isSaving ? (
        <>
          <button
            onClick={handleNewMatrix}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            New Matrix
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
          >
            Save Matrix
          </button>
        </>
      ) : (
        <form onSubmit={handleSaveSubmit} className="flex space-x-3 items-center">
          <input
            type="text"
            value={matrixTitle}
            onChange={(e) => setMatrixTitle(e.target.value)}
            placeholder="Enter matrix title..."
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default Controls;