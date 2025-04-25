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
      className={`border-2 rounded-lg p-4 min-h-[300px] relative ${info.color} ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{info.title}</h2>
      
      <ul className="space-y-2">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
      
      <button
        onClick={onAddTask}
        className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full flex items-center justify-center transition-colors duration-200"
        aria-label="Add task"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};

export default Quadrant;