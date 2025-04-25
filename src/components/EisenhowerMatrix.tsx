import React, { useState } from 'react';
import Quadrant from './Quadrant';
import TaskModal from './TaskModal';
import SavedMatrices from './SavedMatrices';
import Controls from './Controls';
import { QuadrantId, QuadrantInfo } from '../types';
import { useMatrix } from '../context/MatrixContext';

const quadrants: QuadrantInfo[] = [
  { 
    id: 'urgent-important', 
    title: 'Do',
    subtitle: 'Urgent & Important',
    color: 'bg-red-50 border-red-400' 
  },
  { 
    id: 'urgent-not-important', 
    title: 'Delegate',
    subtitle: 'Urgent & Not Important',
    color: 'bg-orange-50 border-orange-400' 
  },
  { 
    id: 'not-urgent-important', 
    title: 'Plan',
    subtitle: 'Not Urgent & Important',
    color: 'bg-blue-50 border-blue-400' 
  },
  { 
    id: 'not-urgent-not-important', 
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    color: 'bg-purple-50 border-purple-400' 
  }
];

const EisenhowerMatrix: React.FC = () => {
  const { tasks } = useMatrix();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeQuadrant, setActiveQuadrant] = useState<QuadrantId | null>(null);

  const openModal = (quadrantId: QuadrantId) => {
    setActiveQuadrant(quadrantId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveQuadrant(null);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quadrants.map(quadrant => (
          <Quadrant
            key={quadrant.id}
            info={quadrant}
            tasks={tasks.filter(task => task.quadrant === quadrant.id)}
            onAddTask={() => openModal(quadrant.id)}
          />
        ))}
      </div>

      <Controls />

      <SavedMatrices />

      {modalOpen && activeQuadrant && (
        <TaskModal 
          isOpen={modalOpen} 
          onClose={closeModal} 
          quadrantId={activeQuadrant} 
        />
      )}
    </div>
  );
};

export default EisenhowerMatrix;