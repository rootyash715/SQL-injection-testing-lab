import React, { useState, useEffect } from 'react';
import {
  WafRule,
  WafInspectionResult,
  WafLogEntry,
} from '../types';
import {
  fetchWafRules,
  toggleWafRule,
  setWafSensitivity,
  inspectWafPayload,
  fetchWafLogs,
  clearWafLogs,
  resetWaf,
  addCustomWafRule,
} from '../api';
import { WafShieldAnimation } from '../components/WafShieldAnimation';
import { cyberAudio } from '../components/AudioController';
import {
  Shield,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  XCircle,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Activity,
  Trash2,
  Send,
  HelpCircle,
} from 'lucide-react';

export const WafLabView: React.FC = () => {
  const [rules, setRules] = useState<WafRule[]>([]);
  const [sensitivity, setSensitivity] = useState<string>('MEDIUM');
  const [logs, setLogs] = useState<WafLogEntry[]>([]);

  // Test Console state
  const [testPayload, setTestPayload] = useState<string>("' UNION SELECT 1,2,3 --");
  const [testContext, setTestContext] = useState<string>('query_parameter');
  const [inspectResult, setInspectResult] = useState<WafInspectionResult | null>(null);
  const [inspecting, setInspecting] = useState(false);

  // Custom Rule form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState('HIGH');

  const loadWafData = async () => {
    try {
      const [r, l] = await Promise.all([fetchWafRules(), fetchWafLogs()]);
      setRules(r);
      setLogs(l);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWafData();
  }, []);

  const handleSensitivityChange = async (level: string) => {
    cyberAudio.playClick();
    setSensitivity(level);
    await setWafSensitivity(level);
    loadWafData();
  };

  const handleToggleRule = async (ruleId: string, currentEnabled: boolean) => {
    cyberAudio.playClick();
    const updated = await toggleWafRule(ruleId, !currentEnabled);
    setRules((prev) => prev.map((r) => (r.rule_id === ruleId ? updated : r)));
  };

  const handleInspect = async (overrideText?: string) => {
    cyberAudio.playClick();
    setInspecting(true);
    const textToInspect = overrideText !== undefined ? overrideText : testPayload;

    try {
      const res = await inspectWafPayload(textToInspect, testContext);
      setInspectResult(res);
      if (res.verdict === 'BLOCKED') {
        cyberAudio.playWafBlocked();
      } else {
        cyberAudio.playClick();
      }
      loadWafData();
    } catch (e: any) {
      alert(`Inspection error: ${e.message}`);
    } finally {
      setInspecting(false);
    }
  };

  const handleClearLogs = async () => {
    cyberAudio.playClick();
    await clearWafLogs();
    setLogs([]);
  };

  const handleResetWaf = async () => {
    if (!window.confirm('Reset all WAF rules and sensitivity to default factory settings?')) return;
    cyberAudio.playClick();
    await resetWaf();
    setSensitivity('MEDIUM');
    setInspectResult(null);
    loadWafData();
  };

  const handleSaveCustomRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRulePattern.trim()) {
      alert('Please provide a rule name and regex pattern.');
      return;
    }
    cyberAudio.playClick();
    try {
      await addCustomWafRule({
        name: newRuleName.trim(),
        pattern: newRulePattern.trim(),
        severity: newRuleSeverity,
        category: 'Custom Rule',
      });
      setShowAddModal(false);
      setNewRuleName('');
      setNewRulePattern('');
      loadWafData();
      alert('Custom rule successfully deployed into the WAF engine!');
    } catch (err: any) {
      alert(`Failed to add rule: ${err.message}`);
    }
  };

  // Educational False Positive Scenarios
  const falsePositiveScenarios = [
    {
      title: "Legitimate Name with Apostrophe",
      input: "Dr. Sean O'Connor",
      expectedUnderParanoid: "BLOCKED (False Positive!)",
      description: "Triggers on single quote rule (Rule 107). Breaks legitimate user signups.",
    },
    {
      title: "Union Labor Representative Search",
      input: "Search for local union representative candidates",
      expectedUnderParanoid: "BLOCKED if keyword matcher lacks boundary checks",
      description: "Innocent search containing the English word 'union'.",
    },
    {
      title: "Boolean Logical Conjunction in Text",
      input: "Comparison of product A and product B or alternatives",
      expectedUnderParanoid: "May trigger tautology heuristic if words 'and'/'or' are overzealously flagged.",
      description: "Standard English sentence containing boolean connectors.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-xl border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyber-red-glow uppercase tracking-widest">
            <Shield className="w-4 h-4 text-cyber-red-primary" />
            <span>LAYER-7 APPLICATION FIREWALL SIMULATOR</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-mono mt-1">
            SIMULATED WAF LAB <span className="text-cyber-red-glow">// DEFENSE & BYPASS MATRIX</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
            Inspect live request streams, toggle signature detection rules, analyze false positives on innocent inputs,
            and understand why a WAF is a defense-in-depth shield rather than a substitute for parameterized code.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleResetWaf}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET WAF</span>
          </button>
        </div>
      </div>

      {/* Sensitivity Profile Toolbar */}
      <div className="glass-panel p-5 rounded-xl border-cyber-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyber-red-primary" />
          <span className="font-bold text-white uppercase tracking-wider">
            FIREWALL SENSITIVITY PROFILE:
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {['LOW', 'MEDIUM', 'HIGH', 'PARANOID'].map((lvl) => {
            const isSelected = sensitivity === lvl;
            return (
              <button
                key={lvl}
                onClick={() => handleSensitivityChange(lvl)}
                className={`px-3 py-1.5 rounded font-mono font-bold tracking-wider transition-all ${
                  isSelected
                    ? lvl === 'PARANOID'
                      ? 'bg-purple-900 border border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : 'bg-cyber-red-blood border border-cyber-red-primary text-cyber-red-glow shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    : 'bg-[#090b10] border border-cyber-border text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Inspection Console + Rules Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Inspection Console & False Positive Lab */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Inspection Workbench */}
          <div className="glass-panel-glow p-5 rounded-xl border-cyber-red-primary/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-cyber-red-primary animate-pulse" />
                LIVE REQUEST INSPECTION CONSOLE
              </span>
              <div className="flex items-center space-x-2 font-mono text-xs text-slate-400">
                <span>CONTEXT:</span>
                <select
                  value={testContext}
                  onChange={(e) => setTestContext(e.target.value)}
                  className="bg-[#090b10] border border-cyber-border rounded px-2 py-1 text-white text-[11px] focus:outline-none"
                >
                  <option value="query_parameter">Query Parameter (?q=)</option>
                  <option value="json_body">JSON POST Body</option>
                  <option value="http_header">HTTP Header (User-Agent)</option>
                  <option value="cookie">Cookie Field</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                placeholder="Enter string, payload, or innocent text to inspect..."
                className="w-full bg-[#07080c] border border-cyber-border focus:border-cyber-red-primary rounded-lg p-3 font-mono text-sm text-cyber-red-glow font-bold focus:outline-none focus:ring-1 focus:ring-cyber-red-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {/* Quick sample attacks */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500">PROBES:</span>
                <button
                  onClick={() => {
                    const p = "' UNION SELECT 1,2,3 --";
                    setTestPayload(p);
                    handleInspect(p);
                  }}
                  className="px-2 py-0.5 rounded bg-[#090b10] hover:bg-slate-800 text-slate-300 border border-cyber-border"
                >
                  UNION SELECT
                </button>
                <button
                  onClick={() => {
                    const p = "admin' OR 1=1 --";
                    setTestPayload(p);
                    handleInspect(p);
                  }}
                  className="px-2 py-0.5 rounded bg-[#090b10] hover:bg-slate-800 text-slate-300 border border-cyber-border"
                >
                  OR 1=1 Tautology
                </button>
                <button
                  onClick={() => {
                    const p = "'; SELECT sleep(2); --";
                    setTestPayload(p);
                    handleInspect(p);
                  }}
                  className="px-2 py-0.5 rounded bg-[#090b10] hover:bg-slate-800 text-slate-300 border border-cyber-border"
                >
                  Time Delay (Sleep)
                </button>
              </div>

              <button
                onClick={() => handleInspect()}
                disabled={inspecting}
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-cyber-red-primary hover:bg-cyber-red-dark text-black font-mono text-xs font-extrabold tracking-wider transition-all shadow-[0_0_12px_rgba(239,68,68,0.4)] flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span>{inspecting ? 'INSPECTING...' : 'INSPECT REQUEST'}</span>
              </button>
            </div>

            {/* Inspection Result Animation Shield */}
            {inspectResult && (
              <div className="pt-2">
                <WafShieldAnimation result={inspectResult} />
              </div>
            )}
          </div>

          {/* FALSE POSITIVE DEMONSTRATOR */}
          <div className="glass-panel p-5 rounded-xl border-cyber-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-2 text-sm font-mono font-bold text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span>FALSE POSITIVE DEMONSTRATION WORKBENCH</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Compare strictness vs business disruption
              </span>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              When WAF rules are tuned too aggressively (e.g. banning apostrophes or generic words), benign
              users are blocked. Click any scenario below to test how the current WAF profile handles innocent data:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {falsePositiveScenarios.map((sc, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setTestPayload(sc.input);
                    handleInspect(sc.input);
                  }}
                  className="p-3 rounded-lg bg-[#090b10] border border-cyber-border hover:border-yellow-500/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="text-xs font-mono font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {sc.title}
                  </div>
                  <div className="bg-[#050608] p-2 rounded border border-cyber-border text-xs font-mono text-slate-300 truncate">
                    <code>"{sc.input}"</code>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    {sc.description}
                  </div>
                  <div className="text-[10px] font-mono text-yellow-400/80 pt-1 border-t border-cyber-border/40">
                    Test Payload &gt;
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked and Allowed Logs Stream */}
          <div className="glass-panel rounded-xl p-5 border-cyber-border space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-cyber-red-primary" />
                INSPECTION AUDIT LOGS ({logs.length})
              </span>
              <button
                onClick={handleClearLogs}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Logs</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded bg-[#090b10] border border-cyber-border flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.verdict === 'BLOCKED'
                            ? 'bg-cyber-red-blood text-cyber-red-glow border border-cyber-red-primary/40'
                            : 'bg-green-950 text-green-400 border border-green-700/40'
                        }`}
                      >
                        {log.verdict}
                      </span>
                      <div className="truncate max-w-md">
                        <code className="text-white font-bold">{log.input_sample}</code>
                        {log.rule_name && (
                          <div className="text-[10px] text-slate-400">
                            Triggered: {log.rule_id} ({log.rule_name})
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 shrink-0">
                      <div>{log.timestamp.slice(11, 19)}</div>
                      <div>Risk: {log.risk_score}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No inspection logs recorded. Test inputs above to generate audit telemetry.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: WAF Rules Configuration */}
        <div className="glass-panel p-5 rounded-xl border-cyber-border space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyber-red-primary" />
              ACTIVE SIGNATURE RULES
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-2 py-1 rounded bg-cyber-red-blood hover:bg-cyber-red-primary text-cyber-red-glow hover:text-black font-mono text-[10px] font-bold border border-cyber-red-primary/60 transition-colors flex items-center gap-1"
                title="Create custom regex signature"
              >
                <PlusCircle className="w-3 h-3" />
                <span>+ ADD RULE</span>
              </button>
              <span className="text-slate-400 text-[10px]">
                {rules.filter((r) => r.is_enabled).length} / {rules.length} ON
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div
                key={rule.rule_id}
                className={`p-3.5 rounded-lg border transition-all ${
                  rule.is_enabled
                    ? 'bg-[#090b10] border-cyber-border hover:border-cyber-red-primary/40'
                    : 'bg-[#06070a] border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-cyber-red-glow">{rule.rule_id}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-300'
                          : rule.severity === 'HIGH'
                          ? 'bg-orange-950 text-orange-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggleRule(rule.rule_id, rule.is_enabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.is_enabled ? 'bg-cyber-red-primary' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                        rule.is_enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="font-bold text-white text-xs mb-1">{rule.name}</div>
                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {rule.description}
                </div>

                <div className="mt-2 pt-2 border-t border-cyber-border/40 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Pattern: <code className="text-slate-400">{rule.pattern.slice(0, 18)}...</code></span>
                  <span>Hits: <strong className="text-cyber-red-glow">{rule.trigger_count}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Rule Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-glow max-w-md w-full p-6 rounded-xl border-cyber-red-primary/60 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-sm">
                <PlusCircle className="w-4 h-4 text-cyber-red-primary" />
                DEPLOY CUSTOM WAF SIGNATURE
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomRule} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">SIGNATURE NAME:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hex Encoding Filter"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2 rounded text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">REGEX PATTERN:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. (?i)0x[0-9a-f]+"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2 rounded text-cyber-red-glow font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">SEVERITY LEVEL:</label>
                <select
                  value={newRuleSeverity}
                  onChange={(e) => setNewRuleSeverity(e.target.value)}
                  className="w-full bg-[#08090d] border border-cyber-border rounded px-3 py-2 text-white focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Always inspected)</option>
                  <option value="HIGH">HIGH (Inspected on Medium, High, Paranoid)</option>
                  <option value="MEDIUM">MEDIUM (Inspected on High, Paranoid)</option>
                  <option value="LOW">LOW (Inspected on Paranoid only)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-cyber-red-primary hover:bg-cyber-red-dark text-black font-extrabold tracking-wider"
                >
                  DEPLOY RULE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

