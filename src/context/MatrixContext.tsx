import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { Task, SavedMatrix, QuadrantId } from '../types';
import { useAuth } from './AuthContext';
import { api, Snapshot } from '../lib/api';

interface MatrixContextType {
  tasks: Task[];
  savedMatrices: SavedMatrix[];
  syncing: boolean;
  syncError: string | null;
  addTask: (text: string, quadrant: QuadrantId, hours?: number) => void;
  deleteTask: (id: number) => void;
  moveTask: (taskId: number, targetQuadrant: QuadrantId) => void;
  createNewMatrix: () => void;
  saveMatrix: (title: string) => void;
  loadMatrix: (matrixId: number) => void;
  deleteMatrix: (matrixId: number) => void;
  toggleTaskStatus: (taskId: number) => void;
  updateTaskText: (taskId: number, newText: string) => void;
  updateTaskHours: (taskId: number, newHours: number | undefined) => void;
  getLocalSnapshot: () => Snapshot;
  applyServerSnapshot: (snapshot: Snapshot) => void;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

const LS_KEY = 'eisenhowerApp';
const SYNC_DEBOUNCE_MS = 600;

export const useMatrix = () => {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error('useMatrix must be used within a MatrixProvider');
  }
  return context;
};

function readLocalSnapshot(): Snapshot {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { tasks: [], savedMatrices: [] };
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      savedMatrices: Array.isArray(parsed.savedMatrices) ? parsed.savedMatrices : [],
    };
  } catch {
    return { tasks: [], savedMatrices: [] };
  }
}

export const MatrixProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => readLocalSnapshot().tasks);
  const [savedMatrices, setSavedMatrices] = useState<SavedMatrix[]>(
    () => readLocalSnapshot().savedMatrices
  );
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const userIdRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksRef = useRef(tasks);
  const matricesRef = useRef(savedMatrices);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  useEffect(() => {
    matricesRef.current = savedMatrices;
  }, [savedMatrices]);

  useEffect(() => {
    if (authLoading) return;

    const previousUserId = userIdRef.current;
    const currentUserId = user?.id ?? null;

    if (currentUserId === previousUserId && hydratedRef.current) return;

    userIdRef.current = currentUserId;

    if (currentUserId === null) {
      hydratedRef.current = true;
      const snap = readLocalSnapshot();
      setTasks(snap.tasks);
      setSavedMatrices(snap.savedMatrices);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const snap = await api.getState();
        if (cancelled) return;
        setTasks(snap.tasks);
        setSavedMatrices(snap.savedMatrices);
        localStorage.removeItem(LS_KEY);
        hydratedRef.current = true;
      } catch (err) {
        if (cancelled) return;
        setSyncError('Failed to load your saved data.');
        hydratedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    if (!user) {
      localStorage.setItem(LS_KEY, JSON.stringify({ tasks, savedMatrices }));
      return;
    }

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      setSyncing(true);
      setSyncError(null);
      api
        .replaceState({ tasks: tasksRef.current, savedMatrices: matricesRef.current })
        .catch(() => setSyncError('Sync failed. Changes kept locally.'))
        .finally(() => setSyncing(false));
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [tasks, savedMatrices, user]);

  const addTask = (text: string, quadrant: QuadrantId, hours?: number) => {
    const newTask: Task = { id: Date.now(), text, quadrant, completed: false };
    if (hours !== undefined) newTask.hours = hours;
    setTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const moveTask = (taskId: number, targetQuadrant: QuadrantId) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, quadrant: targetQuadrant } : task))
    );
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  const updateTaskText = (taskId: number, newText: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, text: newText } : task))
    );
  };

  const updateTaskHours = (taskId: number, newHours: number | undefined) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const { hours: _omit, ...rest } = task;
        return newHours === undefined ? rest : { ...rest, hours: newHours };
      })
    );
  };

  const createNewMatrix = () => setTasks([]);

  const saveMatrix = (title: string) => {
    const newMatrix: SavedMatrix = { id: Date.now(), title, tasks: [...tasksRef.current] };
    setSavedMatrices((prev) => [...prev, newMatrix]);
  };

  const loadMatrix = (matrixId: number) => {
    const matrix = matricesRef.current.find((m) => m.id === matrixId);
    if (matrix) setTasks([...matrix.tasks]);
  };

  const deleteMatrix = (matrixId: number) => {
    setSavedMatrices((prev) => prev.filter((m) => m.id !== matrixId));
  };

  const getLocalSnapshot = useCallback(
    (): Snapshot => ({ tasks: tasksRef.current, savedMatrices: matricesRef.current }),
    []
  );

  const applyServerSnapshot = useCallback((snap: Snapshot) => {
    setTasks(snap.tasks);
    setSavedMatrices(snap.savedMatrices);
    localStorage.removeItem(LS_KEY);
  }, []);

  const value: MatrixContextType = {
    tasks,
    savedMatrices,
    syncing,
    syncError,
    addTask,
    deleteTask,
    moveTask,
    createNewMatrix,
    saveMatrix,
    loadMatrix,
    deleteMatrix,
    toggleTaskStatus,
    updateTaskText,
    updateTaskHours,
    getLocalSnapshot,
    applyServerSnapshot,
  };

  return <MatrixContext.Provider value={value}>{children}</MatrixContext.Provider>;
};
