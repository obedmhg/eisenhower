import React from 'react';
import { Trash2, ClipboardCopy } from 'lucide-react';
import { useMatrix } from '../context/MatrixContext';
import { SavedMatrix, Task, QuadrantId } from '../types';

const SavedMatrices: React.FC = () => {
  const { savedMatrices, loadMatrix, deleteMatrix } = useMatrix();

  const formatMatrixToMarkdown = (matrix: SavedMatrix) => {
    const quadrantTitles: Record<QuadrantId, { title: string, subtitle: string }> = {
      'urgent-important': { title: 'Do', subtitle: 'Urgent & Important' },
      'urgent-not-important': { title: 'Delegate', subtitle: 'Urgent & Not Important' },
      'not-urgent-important': { title: 'Plan', subtitle: 'Not Urgent & Important' },
      'not-urgent-not-important': { title: 'Eliminate', subtitle: 'Not Urgent & Not Important' }
    };

    const groupTasksByQuadrant = (tasks: Task[]) => {
      return tasks.reduce((acc, task) => {
        if (!acc[task.quadrant]) {
          acc[task.quadrant] = [];
        }
        acc[task.quadrant].push(task);
        return acc;
      }, {} as Record<QuadrantId, Task[]>);
    };

    const tasksGrouped = groupTasksByQuadrant(matrix.tasks);
    let markdown = `# ${matrix.title}\n\n`;

    Object.entries(quadrantTitles).forEach(([quadrantId, { title, subtitle }]) => {
      const tasks = tasksGrouped[quadrantId as QuadrantId] || [];
      if (tasks.length > 0) {
        markdown += `## ${title} (${subtitle})\n\n`;
        tasks.forEach(task => {
          markdown += `- ${task.text}\n`;
        });
        markdown += '\n';
      }
    });

    return markdown;
  };

  const exportAllMatrices = () => {
    const allMarkdown = savedMatrices.map(matrix => formatMatrixToMarkdown(matrix)).join('\n---\n\n');
    navigator.clipboard.writeText(allMarkdown);
  };

  const exportMatrix = (matrix: SavedMatrix) => {
    const markdown = formatMatrixToMarkdown(matrix);
    navigator.clipboard.writeText(markdown);
  };

  if (savedMatrices.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Saved Matrices</h3>
      <ul className="space-y-2">
        {savedMatrices.map((matrix) => (
          <li 
            key={matrix.id}
            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
          >
            <span className="text-gray-700 dark:text-gray-300">{matrix.title}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadMatrix(matrix.id)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
              >
                Load
              </button>
              <button
                onClick={() => exportMatrix(matrix)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                title="Export as Markdown"
              >
                <ClipboardCopy size={18} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this matrix?')) {
                    deleteMatrix(matrix.id);
                  }
                }}
                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                aria-label="Delete matrix"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {savedMatrices.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={exportAllMatrices}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <ClipboardCopy size={16} />
            <span>Export All Matrices</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedMatrices