export interface BentoLayoutItem {
  i: string;    // unique instance UUID
  type: string; // key in widget registry
  x: number;
  y: number;
  w: number;
  h: number;
  data?: any;   // persistent widget configuration
}
