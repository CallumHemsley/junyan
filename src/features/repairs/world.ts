import type { Action, Job } from './rules';

const benchJobs: Record<string, Job> = { 'repair-lamp': 'lamp', 'repair-toy': 'toy' };
export function repairActionForWorldAnchor(interactionId: string): Action | null {
  const job = benchJobs[interactionId];
  return job ? { type: 'switch', job } : null;
}
