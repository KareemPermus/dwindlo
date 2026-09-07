export interface Timer {
  id: number;
  title: string;
  duration_seconds: number;
  end_time?: string | null;
  status: string;
  created_at: string;
}

export interface TimerListResponse extends Array<Timer> {}

export interface DeleteResponse {
  success: boolean;
}