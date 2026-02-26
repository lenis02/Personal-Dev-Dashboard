export interface User {
  id: number;
  email: string;
  name: string;
  height?: number;
  weight?: number;
  squat: number;
  bench: number;
  deadlift: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}
