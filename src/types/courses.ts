export interface Course {
  id?: string;
  userId?: string;
  day: string; // "Senin", "Selasa", etc.
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  courseCode: string;
  courseName: string;
  className?: string | null;
  lecturer?: string | null;
  room?: string | null;
  priority?: "low" | "medium" | "high";
  color?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
