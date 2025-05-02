import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { X, Check, Pencil } from 'lucide-react';
import { Task } from '../types';
import { useMatrix } from '../context/MatrixContext';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { deleteTask, toggleTaskStatus, updateTaskText } = useMatrix();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleEdit = () => {
    if (isEditing && editText.trim() !== '') {
      updateTaskText(task.id, editText.trim());
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editText.trim() !== '') {
      updateTaskText(task.id, editText.trim());
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditText(task.text);
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
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleEdit}
            className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:text-gray-100 min-w-0"
            autoFocus
          />
        ) : (
          <span className={`text-gray-800 dark:text-gray-100 flex-1 truncate ${
            task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
          }`}>
            {task.text}
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

export default TaskItem