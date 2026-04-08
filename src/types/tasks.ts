export interface Subtask {
  id?: string;
  title: string;
  isDone: boolean;
  position: number;
}

export interface Task {
  id?: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  category?: string | null;
  dueDate?: Date | null;
  subtasks: Subtask[];
  isArchived?: boolean;
  position?: number;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  archivedAt?: Date | null;
  archivedReason?: string | null;
}
