export type StatusCallback = (step: {
  chain?: string;
  goal?: string;
  label?: string;
  status: string;
}) => void;

export interface PipelineStep {
  chain: string;
  goal?: string;
  label?: string;
  status: string;
}
