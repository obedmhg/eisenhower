export interface Task {
  id: number;
  text: string;
  quadrant: QuadrantId;
  completed: boolean;
  hours?: number;
}

export interface SavedMatrix {
  id: number;
  title: string;
  tasks: Task[];
}

export type QuadrantId = 
  | 'urgent-important'
  | 'urgent-not-important'
  | 'not-urgent-important'
  | 'not-urgent-not-important';

export interface QuadrantInfo {
  id: QuadrantId;
  title: string;
  subtitle: string;
  color: string;
}