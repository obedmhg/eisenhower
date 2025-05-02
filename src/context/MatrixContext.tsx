import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, SavedMatrix, QuadrantId } from '../types';

interface MatrixContextType {
  tasks: Task[];
  savedMatrices: SavedMatrix[];
  addTask: (text: string, quadrant: QuadrantId) => void;
  deleteTask: (id: number) => void;
  moveTask: (taskId: number, targetQuadrant: QuadrantId) => void;
  createNewMatrix: () => void;
  saveMatrix: (title: string) => void;
  loadMatrix: (matrixId: number) => void;
  deleteMatrix: (matrixId: number) => void;
  toggleTaskStatus: (taskId: number) => void;
  updateTaskText: (taskId: number, newText: string) => void;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const useMatrix = () => {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error('useMatrix must be used within a MatrixProvider');
  }
  return context;
};

interface MatrixProviderProps {
  children: ReactNode;
}

export const MatrixProvider: React.FC<MatrixProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [savedMatrices, setSavedMatrices] = useState<SavedMatrix[]>([]);

  useEffect(() => {
    const storedState = localStorage.getItem('eisenhowerApp');
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      setTasks(parsedState.tasks || []);
      setSavedMatrices(parsedState.savedMatrices || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eisenhowerApp', JSON.stringify({ tasks, savedMatrices }));
  }, [tasks, savedMatrices]);

  const addTask = (text: string, quadrant: QuadrantId) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      quadrant,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const moveTask = (taskId: number, targetQuadrant: QuadrantId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, quadrant: targetQuadrant } : task
    ));
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const updateTaskText = (taskId: number, newText: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    ));
  };

  const createNewMatrix = () => {
    setTasks([]);
  };

  const saveMatrix = (title: string) => {
    const newMatrix: SavedMatrix = {
      id: Date.now(),
      title,
      tasks: [...tasks]
    };
    setSavedMatrices([...savedMatrices, newMatrix]);
  };

  const loadMatrix = (matrixId: number) => {
    const matrix = savedMatrices.find(m => m.id === matrixId);
    if (matrix) {
      setTasks([...matrix.tasks]);
    }
  };

  const deleteMatrix = (matrixId: number) => {
    setSavedMatrices(savedMatrices.filter(matrix => matrix.id !== matrixId));
  };

  const value = {
    tasks,
    savedMatrices,
    addTask,
    deleteTask,
    moveTask,
    createNewMatrix,
    saveMatrix,
    loadMatrix,
    deleteMatrix,
    toggleTaskStatus,
    updateTaskText
  };

  return (
    <MatrixContext.Provider value={value}>
      {children}
    </MatrixContext.Provider>
  );
};