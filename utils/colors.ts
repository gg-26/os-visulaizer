
import { Process } from '../types';

const PREDEFINED_COLORS = [
  'hsl(210, 70%, 50%)', // Blue
  'hsl(150, 70%, 50%)', // Green
  'hsl(30, 70%, 50%)',  // Orange
  'hsl(270, 70%, 50%)', // Purple
  'hsl(0, 70%, 50%)',   // Red
  'hsl(60, 70%, 50%)',  // Yellow
  'hsl(180, 70%, 50%)', // Cyan
  'hsl(330, 70%, 50%)', // Pink
];

export const assignProcessColors = (processes: Process[]): Process[] => {
  return processes.map((process, index) => ({
    ...process,
    color: process.color || PREDEFINED_COLORS[index % PREDEFINED_COLORS.length],
  }));
};
