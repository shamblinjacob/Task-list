export type GoalStatus = "active" | "paused" | "completed" | "archived";

export interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  title: string;
  notes: string | null;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  goal_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ReflectionRow {
  id: string;
  entry_date: string;
  intention: string | null;
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: GoalRow;
        Insert: Partial<GoalRow> & Pick<GoalRow, "title">;
        Update: Partial<GoalRow>;
      };
      tasks: {
        Row: TaskRow;
        Insert: Partial<TaskRow> & Pick<TaskRow, "title" | "due_date">;
        Update: Partial<TaskRow>;
      };
      reflections: {
        Row: ReflectionRow;
        Insert: Partial<ReflectionRow> & Pick<ReflectionRow, "entry_date">;
        Update: Partial<ReflectionRow>;
      };
    };
  };
}
