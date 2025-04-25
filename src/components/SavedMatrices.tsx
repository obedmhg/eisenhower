import React from 'react';
import { useMatrix } from '../context/MatrixContext';

const SavedMatrices: React.FC = () => {
  const { savedMatrices, loadMatrix } = useMatrix();

  if (savedMatrices.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Saved Matrices</h3>
      <ul className="space-y-2">
        {savedMatrices.map((matrix) => (
          <li 
            key={matrix.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200"
          >
            <span className="text-gray-700">{matrix.title}</span>
            <button
              onClick={() => loadMatrix(matrix.id)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Load
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedMatrices;