import React from 'react';
import { Trash2, ClipboardCopy, Download } from 'lucide-react';
import { useMatrix } from '../context/MatrixContext';
import { SavedMatrix, Task, QuadrantId } from '../types';

interface SavedMatricesProps {
  variant?: 'inline' | 'sidebar';
}

const SavedMatrices: React.FC<SavedMatricesProps> = ({ variant = 'inline' }) => {
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

  const sumHours = (tasks: Task[]) =>
    tasks.reduce((sum, t) => sum + (typeof t.hours === 'number' ? t.hours : 0), 0);

  const tasksGrouped = groupTasksByQuadrant(matrix.tasks);
  let markdown = `# ${matrix.title}\n\n`;

  Object.entries(quadrantTitles).forEach(([quadrantId, { title, subtitle }]) => {
    const tasks = tasksGrouped[quadrantId as QuadrantId] || [];
    if (tasks.length > 0) {
      markdown += `## ${title} (${subtitle})\n\n`;
      tasks.forEach(task => {
        const taskText = task.completed ? `~~${task.text}~~` : task.text;
        const hoursSuffix = typeof task.hours === 'number' ? ` (${task.hours}h)` : '';
        markdown += `- ${taskText}${hoursSuffix}\n`;
      });
      markdown += `\n**Total: ${sumHours(tasks)}h**\n\n`;
    }
  });

  markdown += `---\n\n**Matrix Total: ${sumHours(matrix.tasks)}h**\n`;

  return markdown;
};

  const escapeCsvField = (value: string | number | boolean) => {
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const formatAllMatricesToCsv = () => {
    const quadrantTitles: Record<QuadrantId, { title: string, subtitle: string }> = {
      'urgent-important': { title: 'Do', subtitle: 'Urgent & Important' },
      'urgent-not-important': { title: 'Delegate', subtitle: 'Urgent & Not Important' },
      'not-urgent-important': { title: 'Plan', subtitle: 'Not Urgent & Important' },
      'not-urgent-not-important': { title: 'Eliminate', subtitle: 'Not Urgent & Not Important' }
    };

    const header = ['Matrix', 'Quadrant', 'Quadrant Description', 'Task', 'Completed', 'Hours'];
    const rows: string[] = [header.join(',')];

    savedMatrices.forEach(matrix => {
      matrix.tasks.forEach(task => {
        const q = quadrantTitles[task.quadrant];
        rows.push([
          escapeCsvField(matrix.title),
          escapeCsvField(q?.title ?? task.quadrant),
          escapeCsvField(q?.subtitle ?? ''),
          escapeCsvField(task.text),
          escapeCsvField(task.completed),
          escapeCsvField(typeof task.hours === 'number' ? task.hours : '')
        ].join(','));
      });

      const matrixTotal = matrix.tasks.reduce(
        (sum, t) => sum + (typeof t.hours === 'number' ? t.hours : 0),
        0
      );
      rows.push([
        escapeCsvField(matrix.title),
        'Total',
        '',
        '',
        '',
        escapeCsvField(matrixTotal)
      ].join(','));
    });

    return rows.join('\n');
  };

  const exportAllMatrices = () => {
    const allMarkdown = savedMatrices.map(matrix => formatMatrixToMarkdown(matrix)).join('\n---\n\n');
    navigator.clipboard.writeText(allMarkdown);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllMatricesAsCsv = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(`﻿${formatAllMatricesToCsv()}`, `timesheet.csv`, 'text/csv;charset=utf-8;');
  };

  const exportMatrix = (matrix: SavedMatrix) => {
    const markdown = formatMatrixToMarkdown(matrix);
    navigator.clipboard.writeText(markdown);
  };

  if (savedMatrices.length === 0) {
    if (variant !== 'sidebar') {
      return null;
    }
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Saved Matrices</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No saved matrices yet.</p>
      </div>
    );
  }

  return (
    <div className={`${variant === 'sidebar' ? '' : 'mt-8 '}p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm`}>
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
      {savedMatrices.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          {savedMatrices.length > 1 && (
            <button
              onClick={exportAllMatrices}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <ClipboardCopy size={16} />
              <span>Export All Matrices</span>
            </button>
          )}
          <button
            onClick={downloadAllMatricesAsCsv}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            title="Download CSV of all matrices"
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedMatrices