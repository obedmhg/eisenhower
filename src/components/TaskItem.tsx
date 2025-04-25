import React from 'react';
import { useDrag } from 'react-dnd';
import { X } from 'lucide-react';
import { Task } from '../types';
import { useMatrix } from '../context/MatrixContext';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { deleteTask } = useMatrix();
  
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <li
      ref={drag}
      className={`flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } cursor-move hover:shadow-md dark:text-gray-100`}
      style={{ touchAction: 'none' }}
    >
      <span className="text-gray-800 dark:text-gray-100">{task.text}</span>
      <button
        onClick={() => deleteTask(task.id)}
        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
        aria-label="Delete task"
      >
        <X size={18} />
      </button>
    </li>
  );
};

export default TaskItem