import { create } from 'zustand';

interface FlowState {
  isDrawing: boolean;
  currentPath: [number, number][];
  mousePosition: { x: number, y: number };
  setDrawing: (val: boolean) => void;
  addPoint: (point: [number, number]) => void;
  updateMouse: (pos: { x: number, y: number }) => void;
  clear: () => void;
}

export const useFlowState = create<FlowState>((set) => ({
  isDrawing: false,
  currentPath: [],
  mousePosition: { x: 0, y: 0 },
  setDrawing: (val) => set({ isDrawing: val }),
  addPoint: (point) => set((state) => ({ currentPath: [...state.currentPath, point] })),
  updateMouse: (pos) => set({ mousePosition: pos }),
  clear: () => set({ isDrawing: false, currentPath: [], mousePosition: { x: 0, y: 0 } }),
}));
