export interface DashboardStats {
  total_lessons: number;
  completed_challenges: number;
  total_challenges: number;
  current_level: string;
  learning_progress_pct: number;
  active_lab_instances: number;
  total_lab_instances: number;
  waf_status: string;
  waf_sensitivity: string;
  waf_active_rules: number;
  waf_blocked_count: number;
  recent_testing_history: WafLogEntry[];
  system_health: string;
}

export interface LessonInteractiveDemo {
  query_template: string;
  vulnerable_input: string;
  secure_input: string;
  target_table: string;
  expected_output_vulnerable: string;
  expected_output_secure: string;
  live_test_api: string;
}

export interface Lesson {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  summary: string;
  explanation: string;
  sql_example_vulnerable: string;
  sql_example_secure: string;
  ast_explanation: string;
  interactive_demo: LessonInteractiveDemo;
  expected_output: string;
  common_mistakes: string[];
  mitigation_techniques: string[];
}

export interface QueryToken {
  text: string;
  token_type: 'base_sql' | 'injected_payload' | 'operator' | 'comment';
}

export interface EducationalPayload {
  id: string;
  name: string;
  category: string;
  payload: string;
  database_type: string;
  target_param: string;
  query_context: string;
  description: string;
  what_it_does: string;
  why_it_works: string;
  expected_response: string;
  vulnerability_demonstrated: string;
  how_to_fix: string;
}

export interface PlaygroundResponse {
  raw_query: string;
  injected_highlighted: QueryToken[];
  status_code: number;
  duration_ms: number;
  row_count: number;
  columns: string[];
  rows: Record<string, any>[];
  error?: string | null;
  waf_result?: WafInspectionResult | null;
  educational_breakdown?: EducationalPayload | null;
  timestamp: string;
}

export interface WafRule {
  rule_id: string;
  name: string;
  category: string;
  pattern: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_enabled: boolean;
  trigger_count: number;
}

export interface WafInspectionResult {
  verdict: 'ALLOWED' | 'BLOCKED';
  status_code: number;
  risk_score: number;
  matched_rule?: WafRule | null;
  matched_string?: string | null;
  inspected_text: string;
  decoded_text: string;
  sensitivity_level: string;
  explanation: string;
  mitigation_tip: string;
  timestamp: string;
  pipeline_steps: string[];
}

export interface WafLogEntry {
  id: number;
  timestamp: string;
  verdict: string;
  input_sample: string;
  rule_id?: string | null;
  rule_name?: string | null;
  severity?: string | null;
  risk_score: number;
  client_ip: string;
}

export interface LabResponse {
  lab_id: string;
  mode: 'vulnerable' | 'secure';
  success: boolean;
  status_code: number;
  duration_ms: number;
  raw_query: string;
  message: string;
  data?: any;
  error?: string | null;
  flag?: string | null;
  waf_alert?: WafInspectionResult | null;
}

export interface LabMetadata {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  target_endpoint: string;
  scenario: string;
  learning_objective: string;
  testing_instructions: string[];
  expected_behavior: string;
  solution_explanation: string;
  secure_coding_alternative: string;
  flag: string;
}

export interface ChallengeRecord {
  id: number;
  lab_id: string;
  title: string;
  category: string;
  difficulty: string;
  completed: boolean;
  attempts: number;
  flag: string;
  completed_at?: string | null;
}

