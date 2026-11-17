import React, { useState, useEffect } from 'react';
import {
  EducationalPayload,
  PlaygroundResponse,
} from '../types';
import {
  fetchEducationalPayloads,
  executePlayground,
} from '../api';
import { QueryVisualizer } from '../components/QueryVisualizer';
import { WafShieldAnimation } from '../components/WafShieldAnimation';
import { cyberAudio } from '../components/AudioController';
import {
  Terminal,
  Play,
  RotateCcw,
  Database,
  Cpu,
  Layers,
  Clock,
  Code2,
  HelpCircle,
  Shield,
  History,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const PlaygroundView: React.FC = () => {
  const [payloads, setPayloads] = useState<EducationalPayload[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('single_quote');

  // Query configuration
  const [queryTemplate, setQueryTemplate] = useState<string>(
    "SELECT id, username, role, email FROM users WHERE username = '{INPUT}';"
  );
  const [payloadInput, setPayloadInput] = useState<string>("'");
  const [targetParam, setTargetParam] = useState<string>('username');
  const [databaseType, setDatabaseType] = useState<string>('sqlite');
  const [simulateWaf, setSimulateWaf] = useState<boolean>(false);

  // Execution state
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PlaygroundResponse | null>(null);
  const [history, setHistory] = useState<PlaygroundResponse[]>([]);

  useEffect(() => {
    fetchEducationalPayloads().then((data) => {
      setPayloads(data);
      if (data.length > 0) {
        applyPreset(data[0]);
      }
    });
  }, []);

  const applyPreset = (p: EducationalPayload) => {
    cyberAudio.playClick();
    setSelectedPresetId(p.id);
    setPayloadInput(p.payload);
    setQueryTemplate(p.query_context);
    setTargetParam(p.target_param);
  };

  const handleExecute = async () => {
    cyberAudio.playClick();
    setLoading(true);

    try {
      const res = await executePlayground({
        query_template: queryTemplate,
        payload: payloadInput,
        target_param: targetParam,
        database_type: databaseType,
        simulate_waf: simulateWaf,
      });
      setResult(res);
      setHistory((prev) => [res, ...prev.slice(0, 14)]);

      if (res.status_code === 403) {
        cyberAudio.playWafBlocked();
      } else if (res.row_count > 1 || res.status_code === 200) {
        cyberAudio.playExploitSuccess();
      }
    } catch (e: any) {
      alert(`Execution Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    cyberAudio.playClick();
    setPayloadInput("'");
    setQueryTemplate("SELECT id, username, role, email FROM users WHERE username = '{INPUT}';");
    setTargetParam('username');
    setResult(null);
  };

  const activePayloadBreakdown =
    result?.educational_breakdown ||
    payloads.find((p) => p.id === selectedPresetId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-xl border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyber-red-glow uppercase tracking-widest">
            <Terminal className="w-4 h-4 text-cyber-red-primary" />
            <span>INTERACTIVE TESTING INTERFACE // ISOLATED LOCAL DB</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-mono mt-1">
            SQL PAYLOAD PLAYGROUND <span className="text-cyber-red-glow">// WORKBENCH</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
            Test and dissect SQL injection payloads in real time against a simulated local SQLite database.
            Inspect token generation, syntax tree changes, HTTP requests, responses, and defensive mitigations.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <label className="flex items-center space-x-2 cursor-pointer bg-[#090b10] px-3 py-2 rounded-lg border border-cyber-border font-mono text-xs text-slate-300">
            <input
              type="checkbox"
              checked={simulateWaf}
              onChange={(e) => setSimulateWaf(e.target.checked)}
              className="rounded bg-cyber-dark border-cyber-border text-cyber-red-primary focus:ring-cyber-red-primary"
            />
            <span className="flex items-center gap-1.5 font-bold">
              <Shield className={`w-3.5 h-3.5 ${simulateWaf ? 'text-cyber-red-glow' : 'text-slate-500'}`} />
              Simulate WAF Shield
            </span>
          </label>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-400 hover:text-white transition-colors"
            title="Reset playground inputs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Workbench Console + Educational Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Workbench (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Preset Selector */}
          <div className="glass-panel p-4 rounded-xl border-cyber-border space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                EDUCATIONAL PAYLOAD PRESETS:
              </span>
              <span className="text-cyber-red-glow">{payloads.length} available</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {payloads.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`p-2 rounded-lg text-left font-mono text-xs transition-all border ${
                      isSelected
                        ? 'bg-cyber-red-blood/80 border-cyber-red-primary text-white font-bold shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                        : 'bg-[#090b10] border-cyber-border text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {p.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Toolbar: Dialect, Parameter, Query Context */}
          <div className="glass-panel p-4 rounded-xl border-cyber-border grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            {/* Database Engine Dialect Selector */}
            <div>
              <label className="block text-slate-400 mb-1 font-bold">DATABASE DIALECT:</label>
              <select
                value={databaseType}
                onChange={(e) => setDatabaseType(e.target.value)}
                className="w-full bg-[#08090d] border border-cyber-border rounded px-3 py-2 text-white focus:outline-none focus:border-cyber-red-primary"
              >
                <option value="sqlite">SQLite (Active Engine)</option>
                <option value="mysql">MySQL Dialect</option>
                <option value="postgresql">PostgreSQL Dialect</option>
                <option value="mssql">Microsoft SQL Server</option>
              </select>
            </div>

            {/* Input Parameter Selector */}
            <div>
              <label className="block text-slate-400 mb-1 font-bold">TARGET PARAMETER:</label>
              <select
                value={targetParam}
                onChange={(e) => setTargetParam(e.target.value)}
                className="w-full bg-[#08090d] border border-cyber-border rounded px-3 py-2 text-white focus:outline-none focus:border-cyber-red-primary"
              >
                <option value="username">username (String)</option>
                <option value="id">id (Numeric SKU)</option>
                <option value="search_query">query (LIKE wildcard)</option>
                <option value="department">department (UNION target)</option>
                <option value="pin">pin (Blind Boolean)</option>
              </select>
            </div>

            {/* Query Template Selector */}
            <div>
              <label className="block text-slate-400 mb-1 font-bold">QUERY TEMPLATE:</label>
              <select
                value={queryTemplate}
                onChange={(e) => setQueryTemplate(e.target.value)}
                className="w-full bg-[#08090d] border border-cyber-border rounded px-3 py-2 text-white focus:outline-none focus:border-cyber-red-primary"
              >
                <option value="SELECT id, username, role, email FROM users WHERE username = '{INPUT}';">
                  Users Auth Table
                </option>
                <option value="SELECT id, sku, name, price, stock FROM products WHERE id = {INPUT};">
                  Products (Numeric ID)
                </option>
                <option value="SELECT id, sku, name, price FROM products WHERE name LIKE '%{INPUT}%';">
                  Products (Search LIKE)
                </option>
                <option value="SELECT badge_id, full_name, department FROM employees WHERE department = '{INPUT}';">
                  Employees Directory
                </option>
                <option value="SELECT id, username FROM users WHERE username = 'admin' AND pin = '{INPUT}';">
                  Admin PIN Check
                </option>
              </select>
            </div>
          </div>

          {/* Payload Editor & Execution Bar */}
          <div className="glass-panel-glow p-5 rounded-xl border-cyber-red-primary/50 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyber-red-primary" />
                <span>PAYLOAD EDITOR:</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Placeholder <code className="text-cyber-red-glow">&#123;INPUT&#125;</code> will be replaced
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
                placeholder="Enter SQL injection payload string..."
                className="w-full bg-[#07080c] border border-cyber-border focus:border-cyber-red-primary rounded-lg p-3 font-mono text-sm text-cyber-red-glow font-bold focus:outline-none focus:ring-1 focus:ring-cyber-red-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs font-mono text-slate-400">
                Target: <strong className="text-white">127.0.0.1:8000/api/playground</strong>
              </div>

              <button
                onClick={handleExecute}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyber-red-primary hover:bg-cyber-red-dark text-black font-mono text-xs font-extrabold tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Play className={`w-4 h-4 text-black ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'EXECUTING QUERY...' : 'EXECUTE SQL PAYLOAD'}</span>
              </button>
            </div>
          </div>

          {/* WAF Intercept Display (if active & triggered) */}
          {result?.waf_result && result.waf_result.verdict === 'BLOCKED' && (
            <WafShieldAnimation result={result.waf_result} />
          )}

          {/* AST Query Visualizer */}
          {result && (
            <QueryVisualizer
              rawQuery={result.raw_query}
              tokens={result.injected_highlighted}
              durationMs={result.duration_ms}
              rowCount={result.row_count}
              isVulnerable={result.row_count > 1 || result.error !== null}
            />
          )}

          {/* Request / Response Telemetry Tabs */}
          {result && (
            <div className="glass-panel rounded-xl p-5 border-cyber-border space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyber-red-primary" />
                  DATABASE RESPONSE INSPECTOR
                </span>
                <span className="text-xs font-mono text-slate-400">
                  STATUS: <strong className={result.status_code === 200 ? 'text-green-400' : 'text-cyber-red-glow'}>HTTP {result.status_code}</strong> | LATENCY: <strong className="text-white">{result.duration_ms}ms</strong>
                </span>
              </div>

              {/* Error Output */}
              {result.error && (
                <div className="bg-red-950/60 p-4 rounded-lg border border-red-700/50 text-xs font-mono text-red-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-cyber-red-glow">
                    <AlertTriangle className="w-4 h-4" />
                    <span>DATABASE EXCEPTION DISCLOSURE:</span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap">{result.error}</pre>
                </div>
              )}

              {/* Rows Output Table */}
              {result.rows && result.rows.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400">
                    RETURNED DATASET: <strong>{result.row_count} rows</strong>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-cyber-border max-h-72">
                    <table className="w-full font-mono text-xs text-left">
                      <thead className="bg-cyber-dark text-slate-300 border-b border-cyber-border">
                        <tr>
                          {result.columns.map((col) => (
                            <th key={col} className="px-3.5 py-2.5">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyber-border/40 bg-[#07080c]">
                        {result.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-900/60">
                            {result.columns.map((col) => (
                              <td key={col} className="px-3.5 py-2 text-slate-200 truncate max-w-sm">
                                {String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                !result.error && (
                  <div className="p-4 rounded bg-[#090b10] border border-cyber-border text-center text-xs font-mono text-slate-400">
                    Query completed with 0 records returned.
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Right Column: Deep Educational Breakdown & Execution History (1 col) */}
        <div className="space-y-5">
          {/* Educational Breakdown Card */}
          {activePayloadBreakdown && (
            <div className="glass-panel p-5 rounded-xl border-cyber-border space-y-3.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
                <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-cyber-red-primary" />
                  PAYLOAD DEEP DIVE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-red-blood text-cyber-red-glow border border-cyber-red-primary/30 uppercase font-bold">
                  {activePayloadBreakdown.category}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-cyber-red-glow text-sm">
                  {activePayloadBreakdown.name}
                </h4>
                <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
                  {activePayloadBreakdown.description}
                </p>
              </div>

              <div className="space-y-3 pt-2 text-[11px] font-sans">
                <div className="bg-[#090b10] p-2.5 rounded border border-cyber-border">
                  <strong className="text-white block font-mono text-xs mb-0.5 uppercase tracking-wider">
                    ⚙️ What it does:
                  </strong>
                  <span className="text-slate-300">{activePayloadBreakdown.what_it_does}</span>
                </div>

                <div className="bg-[#090b10] p-2.5 rounded border border-cyber-border">
                  <strong className="text-white block font-mono text-xs mb-0.5 uppercase tracking-wider">
                    💡 Why it works:
                  </strong>
                  <span className="text-slate-300">{activePayloadBreakdown.why_it_works}</span>
                </div>

                <div className="bg-[#090b10] p-2.5 rounded border border-cyber-border">
                  <strong className="text-white block font-mono text-xs mb-0.5 uppercase tracking-wider">
                    🎯 Expected response:
                  </strong>
                  <span className="text-slate-300">{activePayloadBreakdown.expected_response}</span>
                </div>

                <div className="bg-green-950/20 p-2.5 rounded border border-green-800/40">
                  <strong className="text-green-400 block font-mono text-xs mb-0.5 uppercase tracking-wider">
                    🛡️ How to fix (Defense):
                  </strong>
                  <span className="text-slate-300">{activePayloadBreakdown.how_to_fix}</span>
                </div>
              </div>
            </div>
          )}

          {/* Execution History */}
          <div className="glass-panel p-5 rounded-xl border-cyber-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
              <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <History className="w-4 h-4 text-cyber-red-primary" />
                EXECUTION HISTORY
              </span>
              <span className="text-[10px] text-slate-500">{history.length} records</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      cyberAudio.playClick();
                      setResult(item);
                    }}
                    className="p-2.5 rounded bg-[#090b10] border border-cyber-border hover:border-cyber-red-primary/40 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={item.status_code === 200 ? 'text-green-400' : 'text-cyber-red-glow'}>
                        HTTP {item.status_code} ({item.duration_ms}ms)
                      </span>
                      <span className="text-slate-500">{item.timestamp.slice(11, 19)}</span>
                    </div>
                    <div className="truncate text-slate-300 text-[11px]">
                      <code>{item.raw_query}</code>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-center py-4 text-[11px]">
                  No executions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

