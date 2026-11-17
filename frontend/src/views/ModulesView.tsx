import React, { useEffect, useState } from 'react';
import { Lesson } from '../types';
import { fetchModules, executePlayground } from '../api';
import { TerminalWindow } from '../components/TerminalWindow';
import { QueryVisualizer } from '../components/QueryVisualizer';
import { cyberAudio } from '../components/AudioController';
import {
  BookOpen,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
  Code2,
} from 'lucide-react';

export const ModulesView: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('sqli-fundamentals');
  const [loading, setLoading] = useState(true);

  // In-lesson interactive sandbox state
  const [demoInput, setDemoInput] = useState<string>('');
  const [demoOutput, setDemoOutput] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    fetchModules().then((data) => {
      setLessons(data);
      if (data.length > 0) {
        setActiveSlug(data[0].slug);
        setDemoInput(data[0].interactive_demo.vulnerable_input);
      }
      setLoading(false);
    });
  }, []);

  const currentLesson = lessons.find((l) => l.slug === activeSlug);

  const handleSelectLesson = (lesson: Lesson) => {
    cyberAudio.playClick();
    setActiveSlug(lesson.slug);
    setDemoInput(lesson.interactive_demo.vulnerable_input);
    setDemoOutput(null);
  };

  const handleRunDemo = async (overrideInput?: string) => {
    if (!currentLesson) return;
    cyberAudio.playClick();
    setDemoLoading(true);
    const inputVal = overrideInput !== undefined ? overrideInput : demoInput;

    try {
      const res = await executePlayground({
        query_template: currentLesson.interactive_demo.query_template,
        payload: inputVal,
        target_param: 'input',
        database_type: 'sqlite',
        simulate_waf: false,
      });
      setDemoOutput(res);
      if (res.row_count > 1 || res.status_code === 200) {
        cyberAudio.playExploitSuccess();
      }
    } catch (e: any) {
      setDemoOutput({ error: e.message, status_code: 500, rows: [] });
    } finally {
      setDemoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyber-red-glow font-mono">
        Loading Red Team Curriculum Modules...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-xl border-cyber-border flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyber-red-glow uppercase tracking-widest">
            <BookOpen className="w-4 h-4 text-cyber-red-primary" />
            <span>THEORY & ATTACK SURFACE CURRICULUM</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-mono mt-1">
            SQL INJECTION MASTERY <span className="text-cyber-red-glow">// 13 MODULES</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Comprehensive offensive mechanisms and defensive architectures. Every module includes theory,
            Abstract Syntax Tree (AST) mechanics, code comparisons, and an embedded live executable sandbox.
          </p>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigator + Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Sidebar Navigator */}
        <div className="lg:col-span-1 glass-panel rounded-xl p-3 border-cyber-border space-y-1.5 h-fit max-h-[85vh] overflow-y-auto">
          <div className="text-[11px] font-mono font-bold tracking-wider text-slate-400 px-3 py-2 border-b border-cyber-border">
            CURRICULUM INDEX
          </div>

          {lessons.map((lesson) => {
            const isActive = lesson.slug === activeSlug;
            return (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson)}
                className={`w-full text-left px-3 py-2.5 rounded-lg font-mono text-xs transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-cyber-red-blood/80 text-white font-bold border border-cyber-red-primary shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="truncate">{lesson.title}</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    {lesson.category} // {lesson.difficulty}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-cyber-red-glow translate-x-1' : 'text-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Active Lesson View */}
        {currentLesson && (
          <div className="lg:col-span-3 space-y-6">
            {/* Title & Overview Card */}
            <div className="glass-panel p-6 rounded-xl border-cyber-border space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyber-border pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyber-red-glow px-2.5 py-0.5 rounded bg-cyber-red-blood border border-cyber-red-primary/30">
                  {currentLesson.category} // {currentLesson.difficulty}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  LESSON {currentLesson.id} OF 13
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
                {currentLesson.title}
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                {currentLesson.explanation}
              </p>

              {/* AST Breakdown Callout */}
              <div className="bg-cyber-dark/80 p-4 rounded-lg border border-cyber-border/80 space-y-1.5 font-mono text-xs">
                <div className="flex items-center space-x-2 text-cyber-red-glow font-bold uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-cyber-red-primary" />
                  <span>Abstract Syntax Tree (AST) Parsing Mechanics:</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">
                  {currentLesson.ast_explanation}
                </p>
              </div>
            </div>

            {/* Code Comparison: Vulnerable vs Secure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vulnerable Pattern */}
              <div className="glass-panel p-4 rounded-xl border-cyber-red-primary/40 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyber-red-glow">
                  <AlertTriangle className="w-4 h-4 text-cyber-red-primary" />
                  <span>VULNERABLE ANTI-PATTERN</span>
                </div>
                <pre className="p-3 bg-[#08090d] rounded border border-cyber-red-primary/20 text-xs font-mono text-red-300 overflow-x-auto">
                  <code>{currentLesson.sql_example_vulnerable}</code>
                </pre>
              </div>

              {/* Secure Pattern */}
              <div className="glass-panel p-4 rounded-xl border-green-700/40 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-green-400">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>SECURE PARAMETERIZED PATTERN</span>
                </div>
                <pre className="p-3 bg-[#08090d] rounded border border-green-700/20 text-xs font-mono text-green-300 overflow-x-auto">
                  <code>{currentLesson.sql_example_secure}</code>
                </pre>
              </div>
            </div>

            {/* EMBEDDED INTERACTIVE SANDBOX */}
            <div className="glass-panel-glow p-6 rounded-xl border-cyber-red-primary/50 space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <div className="flex items-center space-x-2 font-mono text-sm font-bold text-white">
                  <Terminal className="w-4 h-4 text-cyber-red-primary animate-pulse" />
                  <span>IN-LESSON INTERACTIVE DEMONSTRATION</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  TARGET TABLE: <strong className="text-cyber-red-glow">{currentLesson.interactive_demo.target_table}</strong>
                </span>
              </div>

              {/* Query Template Preview */}
              <div className="bg-[#06070a] p-3 rounded border border-cyber-border font-mono text-xs text-slate-400">
                <span className="text-slate-500">QUERY TEMPLATE: </span>
                <code className="text-slate-200">{currentLesson.interactive_demo.query_template}</code>
              </div>

              {/* Quick Attack / Defense Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400 mr-1">QUICK TEST:</span>
                <button
                  onClick={() => {
                    setDemoInput(currentLesson.interactive_demo.vulnerable_input);
                    handleRunDemo(currentLesson.interactive_demo.vulnerable_input);
                  }}
                  className="px-2.5 py-1 rounded bg-cyber-red-blood/70 hover:bg-cyber-red-blood border border-cyber-red-primary text-cyber-red-glow font-mono text-xs font-bold transition-colors"
                >
                  ⚡ Inject Attack Payload: "{currentLesson.interactive_demo.vulnerable_input}"
                </button>
                <button
                  onClick={() => {
                    setDemoInput(currentLesson.interactive_demo.secure_input);
                    handleRunDemo(currentLesson.interactive_demo.secure_input);
                  }}
                  className="px-2.5 py-1 rounded bg-green-950/70 hover:bg-green-950 border border-green-600 text-green-400 font-mono text-xs font-bold transition-colors"
                >
                  🛡️ Test Benign Input: "{currentLesson.interactive_demo.secure_input}"
                </button>
              </div>

              {/* Payload Input and Run Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="Enter test payload..."
                    className="w-full bg-[#090b10] border border-cyber-border focus:border-cyber-red-primary px-3 py-2.5 rounded font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyber-red-primary"
                  />
                </div>
                <button
                  onClick={() => handleRunDemo()}
                  disabled={demoLoading}
                  className="px-5 py-2.5 rounded bg-cyber-red-primary hover:bg-cyber-red-dark text-black font-mono text-xs font-extrabold tracking-wider transition-all shadow-[0_0_12px_rgba(239,68,68,0.4)] flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${demoLoading ? 'animate-spin' : ''}`} />
                  <span>{demoLoading ? 'EXECUTING...' : 'RUN LIVE DEMO'}</span>
                </button>
              </div>

              {/* Execution Visualization & Output */}
              {demoOutput && (
                <div className="space-y-3 mt-4 pt-4 border-t border-cyber-border">
                  <QueryVisualizer
                    rawQuery={demoOutput.raw_query}
                    tokens={demoOutput.injected_highlighted}
                    durationMs={demoOutput.duration_ms}
                    rowCount={demoOutput.row_count}
                    isVulnerable={demoOutput.row_count > 1}
                  />

                  {/* Output Table or Error */}
                  {demoOutput.error ? (
                    <div className="p-3 rounded bg-red-950/60 border border-red-700/50 text-red-300 font-mono text-xs">
                      <div className="font-bold">DATABASE ERROR RETURNED:</div>
                      <div>{demoOutput.error}</div>
                    </div>
                  ) : demoOutput.rows && demoOutput.rows.length > 0 ? (
                    <div className="overflow-x-auto rounded border border-cyber-border max-h-56">
                      <table className="w-full font-mono text-xs text-left">
                        <thead className="bg-cyber-dark text-slate-400 border-b border-cyber-border">
                          <tr>
                            {demoOutput.columns.map((c: string) => (
                              <th key={c} className="px-3 py-2">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border/40 bg-[#07090e]">
                          {demoOutput.rows.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-900/50">
                              {demoOutput.columns.map((c: string) => (
                                <td key={c} className="px-3 py-2 text-slate-300 truncate max-w-xs">
                                  {String(row[c])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-400 font-mono text-xs bg-[#08090d] rounded border border-cyber-border">
                      Query returned 0 matching records.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Expected Output, Common Mistakes, and Mitigations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Pitfalls */}
              <div className="glass-panel p-5 rounded-xl border-cyber-border space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-yellow-400">
                  <XCircle className="w-4 h-4" />
                  <span>COMMON MISTAKES & BYPASS VECTORS</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-sans list-disc list-inside">
                  {currentLesson.common_mistakes.map((mistake, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mitigation Techniques */}
              <div className="glass-panel p-5 rounded-xl border-cyber-border space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DEFENSIVE REMEDIATION TECHNIQUES</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-sans list-disc list-inside">
                  {currentLesson.mitigation_techniques.map((mitigation, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {mitigation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

