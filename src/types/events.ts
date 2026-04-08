export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string | null;
  start: string | Date; // Use string for API transport, Date for local
  end: string | Date;
  category?: string | null;
  color?: string | null;
  userId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // UI only
  syncToTasks?: boolean;
}
