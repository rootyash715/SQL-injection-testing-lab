import React, { useState, useEffect } from 'react';
import {
  LabMetadata,
  LabResponse,
  ChallengeRecord,
} from '../types';
import {
  fetchLabsCatalog,
  fetchChallenges,
  submitFlag,
} from '../api';
import { QueryVisualizer } from '../components/QueryVisualizer';
import { WafShieldAnimation } from '../components/WafShieldAnimation';
import { cyberAudio } from '../components/AudioController';
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Code2,
  HelpCircle,
  Eye,
  Lock,
  Search,
  Users,
  Key,
  Clock,
  Send,
  Shield,
  Layers,
} from 'lucide-react';

interface VulnerableLabsViewProps {
  initialLabId?: string;
  onFlagCaptured?: () => void;
}

export const VulnerableLabsView: React.FC<VulnerableLabsViewProps> = ({
  initialLabId,
  onFlagCaptured,
}) => {
  const [labs, setLabs] = useState<LabMetadata[]>([]);
  const [activeLabId, setActiveLabId] = useState<string>(initialLabId || 'lab1_auth');
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);

  // Mode and Security Toggles
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [enableWaf, setEnableWaf] = useState<boolean>(false);

  // Lab Input States
  const [lab1User, setLab1User] = useState<string>("admin' --");
  const [lab1Pass, setLab1Pass] = useState<string>('random_password');

  const [lab2Query, setLab2Query] = useState<string>("' OR 1=1 --");

  const [lab3Id, setLab3Id] = useState<string>('1 OR 1=1');

  const [lab4Dept, setLab4Dept] = useState<string>(
    "' UNION SELECT id, access_key, secret_token FROM secret_credentials --"
  );

  const [lab5Pin, setLab5Pin] = useState<string>('7492');
  const [lab5Username, setLab5Username] = useState<string>('admin');

  const [lab6OrderCode, setLab6OrderCode] = useState<string>("'");

  const [lab7Author, setLab7Author] = useState<string>('RedTeamOperator');
  const [lab7Comments, setLab7Comments] = useState<string>(
    "test'); SELECT sleep(2); --"
  );

  // Result and Flag Submission states
  const [result, setResult] = useState<LabResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [flagInput, setFlagInput] = useState<string>('');
  const [flagStatusMessage, setFlagStatusMessage] = useState<string | null>(null);

  // Tabs within active lab
  const [activeTab, setActiveTab] = useState<'workbench' | 'code' | 'solution'>('workbench');

  const loadData = async () => {
    try {
      const [l, c] = await Promise.all([fetchLabsCatalog(), fetchChallenges()]);
      setLabs(l);
      setChallenges(c);
      if (!activeLabId && l.length > 0) {
        setActiveLabId(l[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialLabId) {
      setActiveLabId(initialLabId);
    }
  }, [initialLabId]);

  const activeLab = labs.find((l) => l.id === activeLabId) || labs[0];
  const activeChallenge = challenges.find((c) => c.lab_id === activeLabId);

  const handleSelectLab = (labId: string) => {
    cyberAudio.playClick();
    setActiveLabId(labId);
    setResult(null);
    setFlagStatusMessage(null);
    setFlagInput('');
  };

  // Execution Handlers for the 7 Labs
  const handleExecuteActiveLab = async () => {
    cyberAudio.playClick();
    setLoading(true);
    setFlagStatusMessage(null);

    let url = '';
    let method = 'GET';
    let body: any = null;

    if (activeLabId === 'lab1_auth') {
      url = '/api/labs/login';
      method = 'POST';
      body = { username: lab1User, password: lab1Pass, mode, enable_waf: enableWaf };
    } else if (activeLabId === 'lab2_search') {
      url = `/api/labs/search?query=${encodeURIComponent(lab2Query)}&mode=${mode}&enable_waf=${enableWaf}`;
    } else if (activeLabId === 'lab3_numeric') {
      url = `/api/labs/product?id=${encodeURIComponent(lab3Id)}&mode=${mode}&enable_waf=${enableWaf}`;
    } else if (activeLabId === 'lab4_union') {
      url = `/api/labs/employees?department=${encodeURIComponent(lab4Dept)}&mode=${mode}&enable_waf=${enableWaf}`;
    } else if (activeLabId === 'lab5_blind_bool') {
      url = `/api/labs/user-check?username=${encodeURIComponent(lab5Username)}&pin_guess=${encodeURIComponent(lab5Pin)}&mode=${mode}&enable_waf=${enableWaf}`;
    } else if (activeLabId === 'lab6_error') {
      url = `/api/labs/order-status?order_code=${encodeURIComponent(lab6OrderCode)}&mode=${mode}&enable_waf=${enableWaf}`;
    } else if (activeLabId === 'lab7_blind_time') {
      url = '/api/labs/feedback';
      method = 'POST';
      body = { author: lab7Author, comments: lab7Comments, mode, enable_waf: enableWaf };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data: LabResponse = await res.json();
      setResult(data);

      if (data.status_code === 403) {
        cyberAudio.playWafBlocked();
      } else if (data.flag) {
        cyberAudio.playFlagCapture();
        setFlagInput(data.flag);
      } else if (data.success) {
        cyberAudio.playExploitSuccess();
      }
    } catch (e: any) {
      alert(`Lab execution error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFlag = async () => {
    if (!flagInput.trim()) return;
    cyberAudio.playClick();
    try {
      const res = await submitFlag(activeLabId, flagInput.trim());
      setFlagStatusMessage(res.message);
      if (res.success) {
        cyberAudio.playFlagCapture();
        loadData();
        if (onFlagCaptured) onFlagCaptured();
      }
    } catch (e: any) {
      setFlagStatusMessage(`Submission error: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-xl border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyber-red-glow uppercase tracking-widest">
            <Flame className="w-4 h-4 text-cyber-red-primary" />
            <span>AUTHENTIC OFFENSIVE EXPLOITATION TARGETS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-mono mt-1">
            VULNERABLE APPLICATION LABS <span className="text-cyber-red-glow">// 7 MISSIONS</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
            Intentionally vulnerable targets backed by an isolated local SQLite database. Toggle between
            vulnerable and secure code, test WAF resistance, inspect raw SQL expressions, and capture flags.
          </p>
        </div>

        {/* Challenge Completion Badge */}
        <div className="bg-[#090b10] px-4 py-2 rounded-xl border border-cyber-border font-mono text-xs flex items-center space-x-3 shrink-0">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-slate-400 text-[10px]">TOTAL PROGRESS</div>
            <div className="font-extrabold text-white">
              {challenges.filter((c) => c.completed).length} / {challenges.length || 7} COMPLETED
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Lab Chooser + Active Lab Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: 7 Labs Chooser */}
        <div className="lg:col-span-1 glass-panel rounded-xl p-3 border-cyber-border space-y-1.5 h-fit">
          <div className="text-[11px] font-mono font-bold tracking-wider text-slate-400 px-3 py-2 border-b border-cyber-border">
            MISSION DIRECTORY
          </div>

          {labs.map((lab, idx) => {
            const isSelected = lab.id === activeLabId;
            const challengeRec = challenges.find((c) => c.lab_id === lab.id);
            const isCompleted = challengeRec?.completed;

            return (
              <button
                key={lab.id}
                onClick={() => handleSelectLab(lab.id)}
                className={`w-full text-left p-3 rounded-lg font-mono text-xs transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyber-red-blood/80 border-cyber-red-primary text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'bg-[#090b10] border-cyber-border text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-cyber-red-glow">0{idx + 1}</span>
                    <span className="truncate">{lab.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    {lab.difficulty} // {lab.category}
                  </div>
                </div>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right 3 Columns: Active Lab Target */}
        {activeLab && (
          <div className="lg:col-span-3 space-y-6">
            {/* Scenario & Objective Briefing */}
            <div className="glass-panel p-6 rounded-xl border-cyber-border space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyber-border pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyber-red-glow px-2.5 py-0.5 rounded bg-cyber-red-blood border border-cyber-red-primary/30">
                    {activeLab.category} // {activeLab.difficulty}
                  </span>
                  {activeChallenge?.completed && (
                    <span className="text-xs font-mono font-bold text-green-400 flex items-center gap-1 bg-green-950/60 px-2 py-0.5 rounded border border-green-700/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      COMPLETED
                    </span>
                  )}
                </div>

                {/* Mode Switcher & WAF Toggle */}
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <button
                    onClick={() => {
                      cyberAudio.playClick();
                      setMode('vulnerable');
                    }}
                    className={`px-3 py-1 rounded font-bold transition-all ${
                      mode === 'vulnerable'
                        ? 'bg-cyber-red-primary text-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Vulnerable Mode
                  </button>
                  <button
                    onClick={() => {
                      cyberAudio.playClick();
                      setMode('secure');
                    }}
                    className={`px-3 py-1 rounded font-bold transition-all ${
                      mode === 'secure'
                        ? 'bg-green-500 text-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Secure Mode
                  </button>

                  <label className="flex items-center space-x-1.5 cursor-pointer ml-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableWaf}
                      onChange={(e) => setEnableWaf(e.target.checked)}
                      className="rounded bg-cyber-dark text-cyber-red-primary"
                    />
                    <span className="text-[11px]">Enable WAF</span>
                  </label>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
                {activeLab.title}
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed font-sans">
                {activeLab.scenario}
              </p>

              <div className="p-3.5 rounded-lg bg-cyber-dark/80 border border-cyber-border font-mono text-xs space-y-1">
                <div className="text-cyber-red-glow font-bold uppercase tracking-wider">
                  MISSION OBJECTIVE:
                </div>
                <div className="text-slate-200">{activeLab.learning_objective}</div>
              </div>

              {/* Sub-tab navigation */}
              <div className="flex space-x-2 border-b border-cyber-border pt-2 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('workbench')}
                  className={`pb-2 px-3 font-bold border-b-2 transition-colors ${
                    activeTab === 'workbench'
                      ? 'border-cyber-red-primary text-cyber-red-glow'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Interactive Target Workbench
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`pb-2 px-3 font-bold border-b-2 transition-colors ${
                    activeTab === 'code'
                      ? 'border-cyber-red-primary text-cyber-red-glow'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Vulnerable vs Secure Code
                </button>
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`pb-2 px-3 font-bold border-b-2 transition-colors ${
                    activeTab === 'solution'
                      ? 'border-cyber-red-primary text-cyber-red-glow'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Walkthrough & Hints
                </button>
              </div>
            </div>

            {/* TAB 1: INTERACTIVE TARGET WORKBENCH */}
            {activeTab === 'workbench' && (
              <div className="space-y-6">
                <div className="glass-panel-glow p-6 rounded-xl border-cyber-red-primary/50 space-y-5">
                  <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Play className="w-4 h-4 text-cyber-red-primary animate-pulse" />
                      SIMULATED TARGET APPLICATION UI
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ENDPOINT: <code className="text-cyber-red-glow">{activeLab.target_endpoint}</code>
                    </span>
                  </div>

                  {/* Dynamic Inputs according to Lab Type */}
                  {activeLabId === 'lab1_auth' && (
                    <div className="space-y-4 max-w-md mx-auto py-2">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          USERNAME PARAMETER:
                        </label>
                        <input
                          type="text"
                          value={lab1User}
                          onChange={(e) => setLab1User(e.target.value)}
                          placeholder="admin' --"
                          className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-cyber-red-glow font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          PASSWORD PARAMETER:
                        </label>
                        <input
                          type="text"
                          value={lab1Pass}
                          onChange={(e) => setLab1Pass(e.target.value)}
                          placeholder="any password"
                          className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeLabId === 'lab2_search' && (
                    <div className="space-y-3 max-w-lg mx-auto py-2">
                      <label className="block text-xs font-mono text-slate-300 font-bold">
                        CATALOG SEARCH KEYWORD:
                      </label>
                      <input
                        type="text"
                        value={lab2Query}
                        onChange={(e) => setLab2Query(e.target.value)}
                        placeholder="' OR 1=1 --"
                        className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-cyber-red-glow font-bold focus:outline-none"
                      />
                    </div>
                  )}

                  {activeLabId === 'lab3_numeric' && (
                    <div className="space-y-3 max-w-lg mx-auto py-2">
                      <label className="block text-xs font-mono text-slate-300 font-bold">
                        PRODUCT SKU / NUMERIC ID (UNQUOTED PARAMETER):
                      </label>
                      <input
                        type="text"
                        value={lab3Id}
                        onChange={(e) => setLab3Id(e.target.value)}
                        placeholder="1 OR 1=1"
                        className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-cyber-red-glow font-bold focus:outline-none"
                      />
                    </div>
                  )}

                  {activeLabId === 'lab4_union' && (
                    <div className="space-y-3 max-w-xl mx-auto py-2">
                      <label className="block text-xs font-mono text-slate-300 font-bold">
                        STAFF DIRECTORY DEPARTMENT FILTER:
                      </label>
                      <input
                        type="text"
                        value={lab4Dept}
                        onChange={(e) => setLab4Dept(e.target.value)}
                        placeholder="' UNION SELECT id, access_key, secret_token FROM secret_credentials --"
                        className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-cyber-red-glow font-bold focus:outline-none"
                      />
                    </div>
                  )}

                  {activeLabId === 'lab5_blind_bool' && (
                    <div className="space-y-4 max-w-md mx-auto py-2">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          TARGET USERNAME:
                        </label>
                        <input
                          type="text"
                          value={lab5Username}
                          onChange={(e) => setLab5Username(e.target.value)}
                          className="w-full bg-[#08090d] border border-cyber-border px-3 py-2 rounded font-mono text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          PIN GUESS / BOOLEAN EXPRESSION:
                        </label>
                        <input
                          type="text"
                          value={lab5Pin}
                          onChange={(e) => setLab5Pin(e.target.value)}
                          placeholder="7492"
                          className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-cyber-red-glow font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeLabId === 'lab6_error' && (
                    <div className="space-y-3 max-w-lg mx-auto py-2">
                      <label className="block text-xs font-mono text-slate-300 font-bold">
                        ORDER CODE (DIAGNOSTIC TRACKING):
                      </label>
                      <input
                        type="text"
                        value={lab6OrderCode}
                        onChange={(e) => setLab6OrderCode(e.target.value)}
                        placeholder="'"
                        className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-cyber-red-glow font-bold focus:outline-none"
                      />
                    </div>
                  )}

                  {activeLabId === 'lab7_blind_time' && (
                    <div className="space-y-4 max-w-lg mx-auto py-2">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          AUTHOR IDENTIFIER:
                        </label>
                        <input
                          type="text"
                          value={lab7Author}
                          onChange={(e) => setLab7Author(e.target.value)}
                          className="w-full bg-[#08090d] border border-cyber-border px-3 py-2 rounded font-mono text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 font-bold">
                          COMMENTS (PAYLOAD INJECTION FIELD):
                        </label>
                        <textarea
                          rows={2}
                          value={lab7Comments}
                          onChange={(e) => setLab7Comments(e.target.value)}
                          placeholder="test'); SELECT sleep(2); --"
                          className="w-full bg-[#08090d] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-cyber-red-glow font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Execute Button */}
                  <div className="text-center pt-2">
                    <button
                      onClick={handleExecuteActiveLab}
                      disabled={loading}
                      className="px-8 py-3 rounded-lg bg-cyber-red-primary hover:bg-cyber-red-dark text-black font-mono text-xs font-extrabold tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send className={`w-4 h-4 text-black ${loading ? 'animate-spin' : ''}`} />
                      <span>{loading ? 'SENDING REQUEST...' : 'SUBMIT REQUEST TO LAB'}</span>
                    </button>
                  </div>

                  {/* WAF Alert if blocked */}
                  {result?.waf_alert && result.waf_alert.verdict === 'BLOCKED' && (
                    <WafShieldAnimation result={result.waf_alert} />
                  )}

                  {/* Reconstructed SQL Query & Response */}
                  {result && (
                    <div className="space-y-4 pt-4 border-t border-cyber-border font-mono text-xs">
                      {/* Query preview */}
                      <div className="bg-[#06070a] p-3.5 rounded border border-cyber-border">
                        <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">
                          GENERATED BACKEND SQL STATEMENT:
                        </div>
                        <code className="text-cyber-red-glow font-bold text-sm break-all">
                          {result.raw_query}
                        </code>
                      </div>

                      {/* Result summary banner */}
                      <div
                        className={`p-3.5 rounded-lg border flex items-center justify-between ${
                          result.success
                            ? 'bg-green-950/60 border-green-700/60 text-green-300'
                            : 'bg-red-950/60 border-red-700/60 text-red-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-cyber-red-primary" />
                          )}
                          <span className="font-bold">{result.message}</span>
                        </div>
                        <div className="text-right text-[10px] text-slate-400">
                          LATENCY: <strong className="text-white">{result.duration_ms}ms</strong> | HTTP {result.status_code}
                        </div>
                      </div>

                      {/* Error trace disclosure (for lab 6 or general errors) */}
                      {result.error && (
                        <div className="p-3 bg-[#08090d] rounded border border-red-700/50 text-red-300 text-xs">
                          <strong className="text-red-400 block mb-1">ERROR OUTPUT:</strong>
                          <pre className="whitespace-pre-wrap">{result.error}</pre>
                        </div>
                      )}

                      {/* Data table or response dump */}
                      {result.data && (
                        <div className="bg-[#08090d] p-3 rounded border border-cyber-border overflow-x-auto max-h-60">
                          <pre className="text-slate-300 text-xs">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Captured Flag Banner */}
                      {result.flag && (
                        <div className="glass-panel-glow p-4 rounded-xl border-green-500 bg-green-950/40 text-center space-y-2 animate-bounce">
                          <div className="flex items-center justify-center space-x-2 text-green-400 font-bold uppercase tracking-wider text-sm">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span>EXPLOIT SUCCESSFUL! FLAG CAPTURED:</span>
                          </div>
                          <div className="bg-[#050608] px-4 py-2 rounded border border-green-500 font-mono text-base font-extrabold text-green-300 select-all">
                            {result.flag}
                          </div>
                          <p className="text-xs text-slate-300">
                            Submit this flag into the verification box below to register challenge completion.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Flag Verification Box */}
                <div className="glass-panel p-5 rounded-xl border-cyber-border space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-cyber-border pb-2.5">
                    <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      FLAG VERIFICATION TERMINAL
                    </span>
                    <span className="text-slate-400">
                      FLAG FORMAT: <code>FLAG&#123;...&#125;</code>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      placeholder="Paste captured FLAG{...} here"
                      className="flex-1 bg-[#090b10] border border-cyber-border px-3 py-2.5 rounded font-mono text-sm text-green-400 font-bold focus:outline-none focus:border-green-500"
                    />
                    <button
                      onClick={handleSubmitFlag}
                      className="px-6 py-2.5 rounded bg-green-500 hover:bg-green-600 text-black font-mono text-xs font-bold tracking-wider transition-colors shrink-0"
                    >
                      VERIFY & SUBMIT FLAG
                    </button>
                  </div>

                  {flagStatusMessage && (
                    <div className="text-xs text-slate-300 p-2 rounded bg-[#08090d] border border-cyber-border font-bold">
                      {flagStatusMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: VULNERABLE VS SECURE CODE */}
            {activeTab === 'code' && (
              <div className="glass-panel p-6 rounded-xl border-cyber-border space-y-4 font-mono text-xs">
                <div className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider border-b border-cyber-border pb-3">
                  <Code2 className="w-4 h-4 text-cyber-red-primary" />
                  <span>SOURCE CODE COMPARISON (SIDE-BY-SIDE)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vulnerable Code */}
                  <div className="bg-[#08090d] p-4 rounded-lg border border-red-800/40 space-y-2">
                    <span className="font-bold text-red-400 uppercase tracking-wider">
                      ❌ Intentionally Vulnerable Implementation:
                    </span>
                    <pre className="text-red-300 text-[11px] overflow-x-auto leading-relaxed">
                      <code>{activeLab.expected_behavior}</code>
                    </pre>
                  </div>

                  {/* Secure Code */}
                  <div className="bg-[#08090d] p-4 rounded-lg border border-green-800/40 space-y-2">
                    <span className="font-bold text-green-400 uppercase tracking-wider">
                      ✅ Secure Parameterized Implementation:
                    </span>
                    <pre className="text-green-300 text-[11px] overflow-x-auto leading-relaxed">
                      <code>{activeLab.secure_coding_alternative}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WALKTHROUGH & HINTS */}
            {activeTab === 'solution' && (
              <div className="glass-panel p-6 rounded-xl border-cyber-border space-y-4 text-xs font-mono">
                <div className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider border-b border-cyber-border pb-3">
                  <HelpCircle className="w-4 h-4 text-yellow-400" />
                  <span>EXPLOITATION WALKTHROUGH & HINTS</span>
                </div>

                <div className="space-y-3 font-sans text-slate-300 leading-relaxed text-xs">
                  <div>
                    <strong className="text-white font-mono block mb-1">
                      Step-by-Step Testing Instructions:
                    </strong>
                    <ol className="list-decimal list-inside space-y-1 pl-2">
                      {activeLab.testing_instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-2 border-t border-cyber-border">
                    <strong className="text-white font-mono block mb-1">
                      Theoretical Solution Explanation:
                    </strong>
                    <p>{activeLab.solution_explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

