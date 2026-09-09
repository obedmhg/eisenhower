import { sql } from './db';

export interface Task {
  id: number;
  text: string;
  quadrant: string;
  completed: boolean;
  hours?: number;
}

export interface SavedMatrix {
  id: number;
  title: string;
  tasks: Task[];
}

export interface Snapshot {
  tasks: Task[];
  savedMatrices: SavedMatrix[];
  version: number;
}

export async function loadSnapshot(userId: number): Promise<Snapshot> {
  const tasks = await sql`
    SELECT id, text, quadrant, completed, hours
    FROM tasks
    WHERE user_id = ${userId}
    ORDER BY id ASC
  `;
  const matrices = await sql`
    SELECT id, title, tasks
    FROM saved_matrices
    WHERE user_id = ${userId}
    ORDER BY id ASC
  `;
  const versionRows = await sql`
    SELECT version FROM user_state WHERE user_id = ${userId}
  `;
  return {
    tasks: tasks.map((t: any) => {
      const out: Task = {
        id: Number(t.id),
        text: t.text,
        quadrant: t.quadrant,
        completed: t.completed,
      };
      if (t.hours !== null && t.hours !== undefined) out.hours = Number(t.hours);
      return out;
    }),
    savedMatrices: matrices.map((m: any) => ({
      id: Number(m.id),
      title: m.title,
      tasks: m.tasks,
    })),
    version: versionRows.length ? Number(versionRows[0].version) : 0,
  };
}

/**
 * Compare-and-swap the user's state version. Returns the new version when
 * `baseVersion` matches the stored one (or no row exists yet), null otherwise.
 */
export async function bumpVersion(userId: number, baseVersion: number): Promise<number | null> {
  const rows = await sql`
    INSERT INTO user_state (user_id, version)
    VALUES (${userId}, ${baseVersion + 1})
    ON CONFLICT (user_id) DO UPDATE
      SET version = user_state.version + 1
      WHERE user_state.version = ${baseVersion}
    RETURNING version
  `;
  return rows.length ? Number(rows[0].version) : null;
}
