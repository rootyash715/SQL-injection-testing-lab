import React, { useEffect, useState } from 'react';
import {
  DashboardStats,
  ChallengeRecord,
} from '../types';
import { fetchDashboardStats, fetchChallenges } from '../api';
import {
  ShieldAlert,
  BookOpen,
  Trophy,
  Flame,
  Shield,
  Activity,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { cyberAudio } from '../components/AudioController';

interface DashboardViewProps {
  onNavigate: (tab: string, subParam?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, c] = await Promise.all([
        fetchDashboardStats(),
        fetchChallenges(),
      ]);
      setStats(s);
      setChallenges(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000); // Live telemetry polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Red Team Mission Banner */}
      <div className="glass-panel-glow rounded-xl p-6 relative overflow-hidden border-cyber-red-primary/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyber-red-primary/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyber-red-glow uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyber-red-primary animate-ping" />
              <span>OFFENSIVE APPSEC & DEFENSIVE SIMULATION LAB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 tracking-tight">
              CYBERPUNK RED TEAM <span className="text-cyber-red-glow">// SQLi MATRIX</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1.5 leading-relaxed">
              Master SQL injection from Abstract Syntax Tree (AST) exploitation to cryptographic defense.
              Test 7 local vulnerable scenarios, bypass and configure simulated Layer-7 WAFs, and inspect live payload executions.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                cyberAudio.playClick();
                onNavigate('labs');
              }}
              className="px-4 py-2.5 rounded-lg bg-cyber-red-primary hover:bg-cyber-red-dark text-black font-mono text-xs font-extrabold tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center space-x-2"
            >
              <Flame className="w-4 h-4 text-black" />
              <span>LAUNCH LABS</span>
            </button>
            <button
              onClick={() => {
                cyberAudio.playClick();
                onNavigate('playground');
              }}
              className="px-4 py-2.5 rounded-lg bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-slate-200 font-mono text-xs font-bold tracking-wider transition-all flex items-center space-x-2"
            >
              <Terminal className="w-4 h-4 text-cyber-red-primary" />
              <span>PLAYGROUND</span>
            </button>
          </div>
        </div>

        {/* Learning Progress Bar */}
        <div className="mt-6 pt-4 border-t border-cyber-border/70">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">
              LEARNING PROGRESSION: <strong className="text-white">{stats?.current_level || 'LVL 1 // RECON OPERATOR'}</strong>
            </span>
            <span className="text-cyber-red-glow font-bold">
              {stats?.completed_challenges || 0} / {stats?.total_challenges || 7} CHALLENGES ({stats?.learning_progress_pct || 0}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#080a0f] p-0.5 border border-cyber-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyber-red-blood via-cyber-red-primary to-cyber-red-glow transition-all duration-700 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              style={{ width: `${Math.max(5, stats?.learning_progress_pct || 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Lessons */}
        <div
          onClick={() => {
            cyberAudio.playClick();
            onNavigate('modules');
          }}
          className="glass-panel p-4 rounded-xl border-cyber-border hover:border-cyber-red-primary/50 cursor-pointer transition-all duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider">LESSONS</span>
            <BookOpen className="w-4 h-4 text-cyber-red-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {stats?.total_lessons || 13}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Core Modules</span>
            <ArrowRight className="w-3 h-3 text-cyber-red-primary" />
          </div>
        </div>

        {/* Card 2: Completed Challenges */}
        <div
          onClick={() => {
            cyberAudio.playClick();
            onNavigate('labs');
          }}
          className="glass-panel p-4 rounded-xl border-cyber-border hover:border-cyber-red-primary/50 cursor-pointer transition-all duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider">FLAGS CAPTURED</span>
            <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-cyber-red-glow font-mono">
            {stats?.completed_challenges || 0} / {stats?.total_challenges || 7}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {(stats?.total_challenges || 7) - (stats?.completed_challenges || 0)} Remaining
          </div>
        </div>

        {/* Card 3: Vulnerable Instances */}
        <div
          onClick={() => {
            cyberAudio.playClick();
            onNavigate('labs');
          }}
          className="glass-panel p-4 rounded-xl border-cyber-border hover:border-cyber-red-primary/50 cursor-pointer transition-all duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider">LAB TARGETS</span>
            <Flame className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {stats?.active_lab_instances || 7} ONLINE
          </div>
          <div className="text-[11px] text-green-400 mt-1 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>SQLite Ready</span>
          </div>
        </div>

        {/* Card 4: WAF Simulation Status */}
        <div
          onClick={() => {
            cyberAudio.playClick();
            onNavigate('waf');
          }}
          className="glass-panel p-4 rounded-xl border-cyber-border hover:border-cyber-red-primary/50 cursor-pointer transition-all duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono tracking-wider">WAF SHIELD</span>
            <Shield className="w-4 h-4 text-cyber-red-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono uppercase">
            {stats?.waf_sensitivity || 'MEDIUM'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {stats?.waf_active_rules || 7} Active Rules
          </div>
        </div>
      </div>

      {/* Two Column Layout: Vulnerable Lab Status & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 7 Vulnerable Lab Instances Tracker (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border-cyber-border">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
            <div className="flex items-center space-x-2 text-sm font-mono font-bold text-white">
              <Layers className="w-4 h-4 text-cyber-red-primary" />
              <span>VULNERABLE APPLICATION LAB TARGETS</span>
            </div>
            <button
              onClick={() => onNavigate('labs')}
              className="text-xs font-mono text-cyber-red-glow hover:underline flex items-center gap-1"
            >
              <span>View All Labs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {challenges.length > 0 ? (
              challenges.map((lab, idx) => (
                <div
                  key={lab.id}
                  onClick={() => {
                    cyberAudio.playClick();
                    onNavigate('labs', lab.lab_id);
                  }}
                  className="bg-[#090c12] hover:bg-slate-900/80 p-3.5 rounded-lg border border-cyber-border hover:border-cyber-red-primary/40 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded bg-cyber-dark font-mono text-xs flex items-center justify-center font-bold text-slate-400 border border-cyber-border">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
                        <span>{lab.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.2 rounded uppercase ${
                            lab.difficulty === 'Beginner'
                              ? 'bg-blue-950 text-blue-400'
                              : lab.difficulty === 'Intermediate'
                              ? 'bg-yellow-950 text-yellow-400'
                              : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {lab.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Category: {lab.category} | Attempts: {lab.attempts}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {lab.completed ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-green-400 bg-green-950/60 px-2.5 py-1 rounded border border-green-700/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        FLAG CAPTURED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-cyber-border hover:border-cyber-red-primary/40">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 font-mono text-xs">
                Loading vulnerable instances...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live WAF & Testing Audit History (1 col) */}
        <div className="glass-panel rounded-xl p-5 border-cyber-border flex flex-col">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
            <div className="flex items-center space-x-2 text-sm font-mono font-bold text-white">
              <Activity className="w-4 h-4 text-cyber-red-primary animate-pulse" />
              <span>TESTING AUDIT STREAM</span>
            </div>
            <button
              onClick={loadData}
              title="Refresh telemetry"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[380px] font-mono text-xs pr-1">
            {stats?.recent_testing_history && stats.recent_testing_history.length > 0 ? (
              stats.recent_testing_history.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#090c12] p-2.5 rounded border border-cyber-border/70 flex flex-col space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        log.verdict === 'BLOCKED'
                          ? 'bg-cyber-red-blood text-cyber-red-glow border border-cyber-red-primary/40'
                          : 'bg-green-950 text-green-400 border border-green-800/40'
                      }`}
                    >
                      {log.verdict}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.timestamp.slice(11, 19)}</span>
                  </div>
                  <div className="text-slate-300 truncate text-[11px]">
                    Payload: <code className="text-cyber-red-glow">{log.input_sample}</code>
                  </div>
                  {log.rule_name && (
                    <div className="text-[10px] text-slate-400 truncate">
                      Matched: {log.rule_id} ({log.rule_name})
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500 text-xs">
                No recent WAF intercepts. Execute test queries in the Playground or Labs to populate telemetry.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-cyber-border/70 text-center">
            <button
              onClick={() => onNavigate('waf')}
              className="text-xs font-mono text-cyber-red-glow hover:underline flex items-center justify-center gap-1 w-full"
            >
              <span>Open Simulated WAF Console</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

