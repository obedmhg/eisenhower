import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import { MatrixProvider } from './context/MatrixContext';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Eisenhower Matrix</h1>
          <MatrixProvider>
            <EisenhowerMatrix />
          </MatrixProvider>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;