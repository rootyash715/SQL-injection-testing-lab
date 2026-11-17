import React from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { WafInspectionResult } from '../types';

interface WafShieldAnimationProps {
  result: WafInspectionResult;
  onDismiss?: () => void;
}

export const WafShieldAnimation: React.FC<WafShieldAnimationProps> = ({
  result,
  onDismiss,
}) => {
  const isBlocked = result.verdict === 'BLOCKED';

  return (
    <div
      className={`rounded-xl p-5 border transition-all duration-300 relative overflow-hidden ${
        isBlocked
          ? 'bg-[#180a0e]/90 border-cyber-red-primary shadow-[0_0_30px_rgba(239,68,68,0.25)]'
          : 'bg-[#08140c]/90 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
      }`}
    >
      {/* Background Laser Sweep Line */}
      {isBlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-red-primary/10 to-transparent animate-laser-sweep pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyber-border/70 pb-4">
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
              isBlocked
                ? 'bg-cyber-red-blood/80 border-cyber-red-primary text-cyber-red-glow shadow-[0_0_15px_#ef4444]'
                : 'bg-green-950/80 border-green-500 text-green-400'
            }`}
          >
            {isBlocked ? (
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-7 h-7" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded ${
                  isBlocked
                    ? 'bg-cyber-red-primary text-black font-extrabold'
                    : 'bg-green-500 text-black font-extrabold'
                }`}
              >
                {result.verdict} // HTTP {result.status_code}
              </span>
              <span className="text-xs font-mono text-slate-400">
                PROFILE: {result.sensitivity_level}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              {isBlocked
                ? 'Simulated Cyber Shield: Threat Intercepted'
                : 'Simulated Cyber Shield: Request Cleared'}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-[#090b10] px-3 py-1.5 rounded border border-cyber-border">
            <span className="text-slate-400">RISK INDEX: </span>
            <span
              className={`font-bold ${
                result.risk_score > 70
                  ? 'text-cyber-red-glow'
                  : result.risk_score > 40
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}
            >
              {result.risk_score} / 100
            </span>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Details & Explanation */}
      <div className="mt-4 space-y-3 font-mono text-xs">
        {result.matched_rule && (
          <div className="bg-cyber-dark/80 p-3 rounded border border-cyber-red-primary/30 flex items-start space-x-2">
            <AlertOctagon className="w-4 h-4 text-cyber-red-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-cyber-red-glow">
                MATCHED RULE: {result.matched_rule.rule_id} — {result.matched_rule.name}
              </div>
              <div className="text-slate-300 mt-1">{result.explanation}</div>
              {result.matched_string && (
                <div className="mt-2 text-[11px] text-slate-400">
                  FLAGGED TOKEN PATTERN:
                  <code className="ml-1 px-1.5 py-0.5 rounded bg-[#06070a] text-cyber-red-glow border border-cyber-red-primary/40 font-bold">
                    {result.matched_string}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pipeline Telemetry Steps */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            INSPECTION PIPELINE TRACE:
          </div>
          <div className="bg-[#06070a] p-2.5 rounded border border-cyber-border space-y-1 text-slate-300">
            {result.pipeline_steps.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="text-cyber-red-primary">&gt;</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Defensive Remediation Note */}
        <div className="p-2.5 rounded bg-blue-950/20 border border-blue-900/40 text-slate-300 text-[11px]">
          <strong className="text-blue-400 uppercase tracking-wider">
            Defensive Guidance:
          </strong>{' '}
          {result.mitigation_tip}
        </div>
      </div>
    </div>
  );
};

