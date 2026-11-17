import {
  DashboardStats,
  Lesson,
  PlaygroundResponse,
  EducationalPayload,
  WafRule,
  WafInspectionResult,
  WafLogEntry,
  LabResponse,
  LabMetadata,
  ChallengeRecord,
} from './types';

const API_BASE = '/api';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchModules(): Promise<Lesson[]> {
  const res = await fetch(`${API_BASE}/modules`);
  if (!res.ok) throw new Error('Failed to fetch curriculum modules');
  return res.json();
}

export async function fetchModule(slug: string): Promise<Lesson> {
  const res = await fetch(`${API_BASE}/modules/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch module');
  return res.json();
}

export async function fetchEducationalPayloads(): Promise<EducationalPayload[]> {
  const res = await fetch(`${API_BASE}/playground/payloads`);
  if (!res.ok) throw new Error('Failed to fetch playground payloads');
  return res.json();
}

export async function executePlayground(req: {
  query_template: string;
  payload: string;
  target_param: string;
  database_type: string;
  simulate_waf: boolean;
}): Promise<PlaygroundResponse> {
  const res = await fetch(`${API_BASE}/playground/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return res.json();
}

export async function fetchWafRules(): Promise<WafRule[]> {
  const res = await fetch(`${API_BASE}/waf/rules`);
  if (!res.ok) throw new Error('Failed to fetch WAF rules');
  return res.json();
}

export async function toggleWafRule(rule_id: string, is_enabled: boolean): Promise<WafRule> {
  const res = await fetch(`${API_BASE}/waf/rules/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rule_id, is_enabled }),
  });
  return res.json();
}

export async function addCustomWafRule(rule: {
  name: string;
  pattern: string;
  category?: string;
  severity?: string;
  description?: string;
}): Promise<WafRule> {
  const res = await fetch(`${API_BASE}/waf/rules/custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to add custom WAF rule');
  }
  return res.json();
}

export async function setWafSensitivity(sensitivity: string): Promise<{ sensitivity: string }> {
  const res = await fetch(`${API_BASE}/waf/sensitivity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sensitivity }),
  });
  return res.json();
}

export async function inspectWafPayload(payload: string, context: string = 'test_console'): Promise<WafInspectionResult> {
  const res = await fetch(`${API_BASE}/waf/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, context }),
  });
  return res.json();
}

export async function fetchWafLogs(): Promise<WafLogEntry[]> {
  const res = await fetch(`${API_BASE}/waf/logs`);
  if (!res.ok) throw new Error('Failed to fetch WAF logs');
  return res.json();
}

export async function clearWafLogs(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/waf/logs/clear`, { method: 'POST' });
  return res.json();
}

export async function resetWaf(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/waf/reset`, { method: 'POST' });
  return res.json();
}

export async function fetchLabsCatalog(): Promise<LabMetadata[]> {
  const res = await fetch(`${API_BASE}/labs/catalog`);
  if (!res.ok) throw new Error('Failed to fetch labs catalog');
  return res.json();
}

export async function fetchChallenges(): Promise<ChallengeRecord[]> {
  const res = await fetch(`${API_BASE}/challenges/list`);
  if (!res.ok) throw new Error('Failed to fetch challenge list');
  return res.json();
}

export async function submitFlag(lab_id: string, flag: string): Promise<{
  success: boolean;
  message: string;
  lab_id: string;
  completed_count: number;
  rank: string;
}> {
  const res = await fetch(`${API_BASE}/challenges/submit-flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lab_id, flag }),
  });
  return res.json();
}

export async function resetDatabase(): Promise<{ status: string; message: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/system/reset-database`, { method: 'POST' });
  return res.json();
}

