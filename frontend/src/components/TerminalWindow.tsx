import React, { useState } from 'react';
import { Terminal, Copy, Check, Maximize2 } from 'lucide-react';

interface TerminalWindowProps {
  title?: string;
  badge?: string;
  children: React.ReactNode;
  copyText?: string;
  className?: string;
  showCursor?: boolean;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title = 'TERMINAL // RED_TEAM_CONSOLE',
  badge = 'BASH',
  children,
  copyText,
  className = '',
  showCursor = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`glass-panel rounded-lg overflow-hidden border border-cyber-border shadow-2xl transition-all duration-300 hover:border-cyber-red-primary/40 ${className}`}
    >
      {/* Terminal Title Bar */}
      <div className="bg-cyber-dark px-4 py-2.5 flex items-center justify-between border-b border-cyber-border">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-red-primary/90 inline-block shadow-[0_0_8px_#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600/70 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700/60 inline-block" />
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyber-red-primary" />
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-cyber-red-blood/80 text-cyber-red-glow border border-cyber-red-primary/30">
              {badge}
            </span>
          )}
          {copyText && (
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 font-mono text-sm leading-relaxed text-slate-200 bg-[#090b10]/90 overflow-x-auto">
        {children}
        {showCursor && <span className="terminal-cursor ml-1" />}
      </div>
    </div>
  );
};

