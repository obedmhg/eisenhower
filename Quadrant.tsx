import React from 'react';
import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import { Task, QuadrantInfo } from '../types';
import { useMatrix } from '../context/MatrixContext';

interface QuadrantProps {
  info: QuadrantInfo;
  tasks: Task[];
  onAddTask: () => void;
}

const getBackgroundImage = (quadrantId: string) => {
  const images: Record<string, string> = {
    'urgent-important': '/images/do.png',
    'urgent-not-important': '/images/delegate.png',
    'not-urgent-important': '/images/schedule.png',
    'not-urgent-not-important': '/images/delete.png'
  };
  return images[quadrantId];
};

const Quadrant: React.FC<QuadrantProps> = ({ info, tasks, onAddTask }) => {
  const { moveTask } = useMatrix();
  
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: number }) => {
      moveTask(item.id, info.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`border-2 rounded-lg p-4 min-h-[300px] relative ${info.color} dark:bg-opacity-10 ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src={getBackgroundImage(info.id)} 
          alt={info.title} 
          width={50} 
          height={50} 
          className="opacity-50"
        />
      </div>

      <div className="mb-4 relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{info.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{info.subtitle}</p>
      </div>
      
      <div className="relative z-10">
        <ul className="space-y-2">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      </div>
      
      <button
        onClick={onAddTask}
        className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white p-2 rounded-full flex items-center justify-center transition-colors duration-200 z-10"
        aria-label="Add task"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};

export default Quadrant;