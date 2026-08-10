import type { DailyInsightState } from './dailyState';

export type DailyContinuity = {
  state: DailyInsightState;
  lastSeenTitle?: string;
  lastSeenDate?: string;
  additions: Array<{ id: string; title: string; summary: string }>;
  judgmentTitle: string;
  judgmentSummary: string;
  changedSinceLastVisit: boolean;
};
