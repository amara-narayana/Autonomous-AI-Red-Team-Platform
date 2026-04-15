export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface Target {
  id: number;
  name: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: number;
  name: string;
  scan_type: string;
  target_id: number;
  status: string;
  results?: string;
  created_at: string;
  updated_at: string;
}

export interface Vulnerability {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss_score?: number;
  target_id: number;
  scan_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
