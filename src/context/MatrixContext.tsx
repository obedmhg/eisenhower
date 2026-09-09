import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Task, SavedMatrix, QuadrantId } from '../types';
import { useAuth } from './AuthContext';
import { api, ApiError, Snapshot } from '../lib/api';

interface MatrixContextType {
  tasks: Task[];
  savedMatrices: SavedMatrix[];
  currentMatrixId: number | null;
  syncing: boolean;
  syncError: string | null;
  addTask: (text: string, quadrant: QuadrantId, hours?: number) => void;
  deleteTask: (id: number) => void;
  moveTask: (taskId: number, targetQuadrant: QuadrantId) => void;
  createNewMatrix: () => void;
  saveMatrix: (title: string, overwriteId?: number) => void;
  loadMatrix: (matrixId: number) => void;
  deleteMatrix: (matrixId: number) => void;
  renameMatrix: (matrixId: number, title: string) => void;
  toggleTaskStatus: (taskId: number) => void;
  updateTaskText: (taskId: number, newText: string) => void;
  updateTaskHours: (taskId: number, newHours: number | undefined) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface HistoryEntry {
  tasks: Task[];
  savedMatrices: SavedMatrix[];
  currentMatrixId: number | null;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

const LS_KEY = 'eisenhowerApp';
const SYNC_DEBOUNCE_MS = 600;
const MAX_HISTORY = 50;

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
  const [currentMatrixId, setCurrentMatrixId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const userIdRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);
  const versionRef = useRef(0);
  const refreshingRef = useRef(false);
  // State arrays last received from the server; syncing them back is a no-op
  // write that only serves to bump the version and conflict with other tabs.
  const adoptedRef = useRef<{ tasks: Task[]; savedMatrices: SavedMatrix[] } | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksRef = useRef(tasks);
  const matricesRef = useRef(savedMatrices);
  const currentIdRef = useRef<number | null>(null);
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  useEffect(() => {
    matricesRef.current = savedMatrices;
  }, [savedMatrices]);
  useEffect(() => {
    currentIdRef.current = currentMatrixId;
  }, [currentMatrixId]);

  const syncHistoryFlags = () => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  };

  const currentSnapshot = (): HistoryEntry => ({
    tasks: tasksRef.current,
    savedMatrices: matricesRef.current,
    currentMatrixId: currentIdRef.current,
  });

  const pushHistory = () => {
    const snap = currentSnapshot();
    const top = undoStackRef.current[undoStackRef.current.length - 1];
    // Two mutators fired from one gesture (TaskItem's commitEdit calls
    // updateTaskText AND updateTaskHours) capture identical refs because
    // the refs only advance in a post-commit effect — skip the duplicate
    // so a single gesture costs a single undo entry.
    if (
      top &&
      top.tasks === snap.tasks &&
      top.savedMatrices === snap.savedMatrices &&
      top.currentMatrixId === snap.currentMatrixId
    ) {
      return;
    }
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > MAX_HISTORY) undoStackRef.current.shift();
    redoStackRef.current = [];
    syncHistoryFlags();
  };

  const resetHistory = () => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    syncHistoryFlags();
  };

  const applyEntry = (entry: HistoryEntry) => {
    setTasks(entry.tasks);
    setSavedMatrices(entry.savedMatrices);
    setCurrentMatrixId(entry.currentMatrixId);
  };

  const undo = () => {
    const entry = undoStackRef.current.pop();
    if (!entry) return;
    redoStackRef.current.push(currentSnapshot());
    applyEntry(entry);
    syncHistoryFlags();
  };

  const redo = () => {
    const entry = redoStackRef.current.pop();
    if (!entry) return;
    undoStackRef.current.push(currentSnapshot());
    applyEntry(entry);
    syncHistoryFlags();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key !== 'z' && key !== 'y') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || (key === 'y' && e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // undo/redo only touch stable refs and setState functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setCurrentMatrixId(null);
      resetHistory();
      return;
    }

    hydratedRef.current = false;
    let cancelled = false;
    (async () => {
      try {
        const snap = await api.getState();
        if (cancelled) return;
        adoptServerSnapshot(snap);
        localStorage.removeItem(LS_KEY);
        hydratedRef.current = true;
      } catch (err) {
        if (cancelled) return;
        setSyncError('Failed to load your saved data.');
      }
    })();

    return () => {
      cancelled = true;
    };
    // resetHistory only touches stable refs and setState functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Replace all in-memory state with what the server holds. Used on hydration,
  // on a 409 from replaceState (another tab wrote first), and on tab focus.
  const adoptServerSnapshot = (snap: Snapshot) => {
    versionRef.current = snap.version ?? 0;
    adoptedRef.current = { tasks: snap.tasks, savedMatrices: snap.savedMatrices };
    setTasks(snap.tasks);
    setSavedMatrices(snap.savedMatrices);
    setCurrentMatrixId(null);
    resetHistory();
  };

  // When a tab regains focus, pull the latest server state so a long-idle tab
  // never edits on top of a stale snapshot.
  useEffect(() => {
    if (!user) return;
    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      if (!hydratedRef.current || refreshingRef.current || syncTimerRef.current) return;
      refreshingRef.current = true;
      try {
        const snap = await api.getState();
        if ((snap.version ?? 0) !== versionRef.current) adoptServerSnapshot(snap);
      } catch {
        // ignore; next sync will surface a real error
      } finally {
        refreshingRef.current = false;
      }
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
    // adoptServerSnapshot only touches refs and setState functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    if (!user) {
      localStorage.setItem(LS_KEY, JSON.stringify({ tasks, savedMatrices }));
      return;
    }

    if (
      adoptedRef.current &&
      adoptedRef.current.tasks === tasks &&
      adoptedRef.current.savedMatrices === savedMatrices
    ) {
      return;
    }

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      setSyncing(true);
      setSyncError(null);
      api
        .replaceState(
          { tasks: tasksRef.current, savedMatrices: matricesRef.current },
          versionRef.current
        )
        .then((res) => {
          versionRef.current = res.version;
        })
        .catch((err) => {
          if (err instanceof ApiError && err.status === 409 && err.data) {
            // Another tab/device wrote newer data. Drop this stale write and
            // show what the server has, rather than overwriting it.
            adoptServerSnapshot(err.data as Snapshot);
            setSyncError('Updated elsewhere. Loaded the latest version.');
            return;
          }
          setSyncError('Sync failed. Changes kept locally.');
        })
        .finally(() => setSyncing(false));
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [tasks, savedMatrices, user]);

  const addTask = (text: string, quadrant: QuadrantId, hours?: number) => {
    pushHistory();
    const newTask: Task = { id: Date.now(), text, quadrant, completed: false };
    if (hours !== undefined) newTask.hours = hours;
    setTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (id: number) => {
    pushHistory();
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const moveTask = (taskId: number, targetQuadrant: QuadrantId) => {
    pushHistory();
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, quadrant: targetQuadrant } : task))
    );
  };

  const toggleTaskStatus = (taskId: number) => {
    pushHistory();
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  const updateTaskText = (taskId: number, newText: string) => {
    pushHistory();
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, text: newText } : task))
    );
  };

  const updateTaskHours = (taskId: number, newHours: number | undefined) => {
    pushHistory();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const { hours: _omit, ...rest } = task;
        return newHours === undefined ? rest : { ...rest, hours: newHours };
      })
    );
  };

  const createNewMatrix = () => {
    pushHistory();
    setTasks([]);
    setCurrentMatrixId(null);
  };

  const saveMatrix = (title: string, overwriteId?: number) => {
    pushHistory();
    const tasksCopy = [...tasksRef.current];
    const id = overwriteId ?? currentIdRef.current;
    if (id !== null && matricesRef.current.some((m) => m.id === id)) {
      setSavedMatrices((prev) =>
        prev.map((m) => (m.id === id ? { ...m, title, tasks: tasksCopy } : m))
      );
      setCurrentMatrixId(id);
      return;
    }
    const newId = Date.now();
    setSavedMatrices((prev) => [...prev, { id: newId, title, tasks: tasksCopy }]);
    setCurrentMatrixId(newId);
  };

  const loadMatrix = (matrixId: number) => {
    const matrix = matricesRef.current.find((m) => m.id === matrixId);
    if (matrix) {
      pushHistory();
      setTasks([...matrix.tasks]);
      setCurrentMatrixId(matrixId);
    }
  };

  const deleteMatrix = (matrixId: number) => {
    pushHistory();
    setSavedMatrices((prev) => prev.filter((m) => m.id !== matrixId));
    if (currentIdRef.current === matrixId) setCurrentMatrixId(null);
  };

  const renameMatrix = (matrixId: number, title: string) => {
    pushHistory();
    setSavedMatrices((prev) =>
      prev.map((m) => (m.id === matrixId ? { ...m, title } : m))
    );
  };

  const value: MatrixContextType = {
    tasks,
    savedMatrices,
    currentMatrixId,
    syncing,
    syncError,
    addTask,
    deleteTask,
    moveTask,
    createNewMatrix,
    saveMatrix,
    loadMatrix,
    deleteMatrix,
    renameMatrix,
    toggleTaskStatus,
    updateTaskText,
    updateTaskHours,
    undo,
    redo,
    canUndo,
    canRedo,
  };

  return <MatrixContext.Provider value={value}>{children}</MatrixContext.Provider>;
};
