import React from 'react';
import { QueryToken } from '../types';
import { Cpu, Database, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface QueryVisualizerProps {
  rawQuery: string;
  tokens?: QueryToken[];
  durationMs?: number;
  rowCount?: number;
  isVulnerable?: boolean;
}

export const QueryVisualizer: React.FC<QueryVisualizerProps> = ({
  rawQuery,
  tokens = [],
  durationMs = 0,
  rowCount = 0,
  isVulnerable = true,
}) => {
  return (
    <div className="glass-panel-glow rounded-lg p-4 space-y-4 font-mono">
      {/* Header telemetry */}
      <div className="flex items-center justify-between border-b border-cyber-border/80 pb-2.5">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Cpu className="w-4 h-4 text-cyber-red-primary animate-pulse" />
          <span>AST QUERY EXECUTION PIPELINE</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400">
            LATENCY: <strong className="text-white">{durationMs}ms</strong>
          </span>
          <span className="text-slate-400">
            ROWS: <strong className="text-cyber-red-glow">{rowCount}</strong>
          </span>
          {isVulnerable ? (
            <span className="flex items-center gap-1 text-[11px] text-cyber-red-glow bg-cyber-red-blood/70 px-2 py-0.5 rounded border border-cyber-red-primary/40">
              <AlertTriangle className="w-3 h-3" />
              AST MUTATED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-700/40">
              <ShieldCheck className="w-3 h-3" />
              PREPARED (SECURE)
            </span>
          )}
        </div>
      </div>

      {/* Visual Token Decomposition */}
      <div className="space-y-1.5">
        <div className="text-[11px] uppercase tracking-wider text-slate-400">
          RECONSTRUCTED SQL STATEMENT:
        </div>
        <div className="bg-[#06070a] p-3.5 rounded border border-cyber-border text-sm leading-relaxed overflow-x-auto select-text">
          {tokens && tokens.length > 0 ? (
            tokens.map((tok, i) => {
              if (tok.token_type === 'injected_payload') {
                return (
                  <span
                    key={i}
                    className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-cyber-red-blood text-cyber-red-glow border border-cyber-red-primary font-bold shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse"
                    title="INJECTED PAYLOAD FRAGMENT: Altered SQL Syntax Tree"
                  >
                    {tok.text}
                  </span>
                );
              }
              return (
                <span key={i} className="text-slate-300">
                  {tok.text}
                </span>
              );
            })
          ) : (
            <span className="text-slate-300">{rawQuery}</span>
          )}
        </div>
      </div>

      {/* Pipeline Stages Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-xs">
        <div className="bg-cyber-dark/80 p-2.5 rounded border border-cyber-border/70 flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-cyber-red-blood text-cyber-red-glow text-[10px] flex items-center justify-center font-bold">
            1
          </span>
          <div className="truncate">
            <div className="text-slate-300 font-bold truncate">LEXER / SCANNER</div>
            <div className="text-[10px] text-slate-400 truncate">Tokenization into symbols</div>
          </div>
        </div>

        <div className="bg-cyber-dark/80 p-2.5 rounded border border-cyber-border/70 flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-cyber-red-blood text-cyber-red-glow text-[10px] flex items-center justify-center font-bold">
            2
          </span>
          <div className="truncate">
            <div className="text-slate-300 font-bold truncate">GRAMMAR PARSER</div>
            <div className="text-[10px] text-slate-400 truncate">Abstract Syntax Tree (AST)</div>
          </div>
        </div>

        <div className="bg-cyber-dark/80 p-2.5 rounded border border-cyber-border/70 flex items-center space-x-2">
          <span className="w-5 h-5 rounded-full bg-cyber-red-blood text-cyber-red-glow text-[10px] flex items-center justify-center font-bold">
            3
          </span>
          <div className="truncate">
            <div className="text-slate-300 font-bold truncate">ENGINE DISPATCH</div>
            <div className="text-[10px] text-slate-400 truncate">Storage page row evaluation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

