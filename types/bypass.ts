export type RedirectMethod = 
  | 'http-redirect'
  | 'meta-refresh'
  | 'javascript-redirect'
  | 'query-parameter'
  | 'direct';

export type AccentColor = 'purple' | 'indigo' | 'blue' | 'pink' | 'orange' | 'green';

export interface RedirectTraceStep {
  url: string;
  status?: number;
  type: 'http' | 'meta' | 'js' | 'param';
  note?: string;
}

export interface DailyQuota {
  limit: number;
  remaining: number;
  resetAt: number;
}

export interface BypassRequest {
  url: string;
  apiKey?: string;
}

export interface BypassSuccessResponse {
  success: true;
  originalUrl: string;
  destinationUrl: string;
  method: RedirectMethod;
  redirectCount: number;
  trace: RedirectTraceStep[];
  durationMs?: number;
  durationText?: string;
  engine?: string;
  quota?: DailyQuota;
}

export interface BypassErrorResponse {
  success: false;
  error: string;
  code?: string;
  originalUrl?: string;
  durationMs?: number;
  durationText?: string;
  engine?: string;
  quota?: DailyQuota;
}

export type BypassResponse = BypassSuccessResponse | BypassErrorResponse;

export interface HistoryItem {
  id: string;
  originalUrl: string;
  destinationUrl: string;
  method: string;
  timestamp: number;
  status: 'success' | 'failed';
  durationText?: string;
  engine?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: AccentColor;
  apiKey: string;
  animations: boolean;
  haptic: boolean;
}
