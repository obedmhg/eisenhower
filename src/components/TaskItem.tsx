import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { X, Check, Pencil } from 'lucide-react';
import { Task } from '../types';
import { useMatrix } from '../context/MatrixContext';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { deleteTask, toggleTaskStatus, updateTaskText, updateTaskHours } = useMatrix();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editHours, setEditHours] = useState<string>(
    task.hours !== undefined ? String(task.hours) : ''
  );

  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const commitEdit = () => {
    if (editText.trim() === '') return;
    updateTaskText(task.id, editText.trim());
    const trimmed = editHours.trim();
    if (trimmed === '') {
      updateTaskHours(task.id, undefined);
    } else {
      const parsed = Number(trimmed);
      updateTaskHours(
        task.id,
        Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
      );
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isEditing) {
      commitEdit();
    } else {
      setEditText(task.text);
      setEditHours(task.hours !== undefined ? String(task.hours) : '');
      setIsEditing(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editText.trim() !== '') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setEditHours(task.hours !== undefined ? String(task.hours) : '');
      setIsEditing(false);
    }
  };

  return (
    <li
      ref={drag}
      className={`flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } cursor-move hover:shadow-md`}
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={() => toggleTaskStatus(task.id)}
          className={`flex-shrink-0 w-5 h-5 border rounded mr-3 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <Check size={14} />}
        </button>
        
        {isEditing ? (
          <div
            className="flex flex-1 min-w-0 items-center gap-2"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                commitEdit();
              }
            }}
          >
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:text-gray-100 min-w-0"
              autoFocus
            />
            <input
              type="number"
              value={editHours}
              onChange={(e) => setEditHours(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="hrs"
              min="0"
              step="0.25"
              inputMode="decimal"
              className="w-16 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:text-gray-100"
            />
          </div>
        ) : (
          <span className={`text-gray-800 dark:text-gray-100 flex-1 truncate ${
            task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
          }`}>
            {task.text}
            {task.hours !== undefined && (
              <span className="ml-1 text-gray-500 dark:text-gray-400">({task.hours} hrs)</span>
            )}
          </span>
        )}
      </div>
      
      <div className="flex items-center ml-2 space-x-2">
        <button
          onClick={handleEdit}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label={isEditing ? "Save task" : "Edit task"}
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
          aria-label="Delete task"
        >
          <X size={18} />
        </button>
      </div>
    </li>
  );
};

export default TaskItem;