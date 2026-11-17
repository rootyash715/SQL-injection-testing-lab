import React, { useState } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  BookOpen,
  Terminal,
  Shield,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  CloudRain,
  Cpu,
} from 'lucide-react';
import { resetDatabase } from '../api';
import { cyberAudio } from './AudioController';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRank: string;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  rainEnabled: boolean;
  setRainEnabled: (val: boolean) => void;
  onDatabaseReset?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRank,
  soundEnabled,
  setSoundEnabled,
  rainEnabled,
  setRainEnabled,
  onDatabaseReset,
}) => {
  const [resetting, setResetting] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'modules', label: 'MODULES (13)', icon: BookOpen },
    { id: 'playground', label: 'PLAYGROUND', icon: Terminal },
    { id: 'waf', label: 'WAF LAB', icon: Shield },
    { id: 'labs', label: 'VULNERABLE LABS (7)', icon: Flame },
  ];

  const handleReset = async () => {
    if (
      !window.confirm(
        'FACTORY RESET LAB DATABASE?\n\nThis will restore all SQLite tables, credentials, and fictional targets to their initial clean state.'
      )
    ) {
      return;
    }
    try {
      setResetting(true);
      cyberAudio.playClick();
      await resetDatabase();
      alert('Lab database and fictional targets have been reset.');
      if (onDatabaseReset) onDatabaseReset();
    } catch (e: any) {
      alert(`Reset failed: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    cyberAudio.enabled = next;
    if (next) cyberAudio.playClick();
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyber-border/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-cyber-red-blood/80 border border-cyber-red-primary flex items-center justify-center text-cyber-red-glow shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-widest text-white font-mono">
                  RED TEAM
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-red-blood text-cyber-red-glow border border-cyber-red-primary/50 font-bold">
                  SQLi LAB
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                127.0.0.1 // LOCALHOST ENVIRONMENT
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    cyberAudio.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md font-mono text-xs font-semibold tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-cyber-red-blood/90 text-cyber-red-glow border border-cyber-red-primary shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyber-red-glow' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Red Team HUD & Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Rank Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#090b10] border border-cyber-border text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyber-red-primary" />
              <span className="text-[11px] font-bold text-cyber-red-glow tracking-wider">
                {currentRank}
              </span>
            </div>

            {/* Matrix Rain Toggle */}
            <button
              onClick={() => setRainEnabled(!rainEnabled)}
              title={rainEnabled ? 'Disable Matrix Rain' : 'Enable Matrix Rain'}
              className={`p-2 rounded border text-xs font-mono transition-colors ${
                rainEnabled
                  ? 'border-cyber-red-primary/40 bg-cyber-red-blood/40 text-cyber-red-glow'
                  : 'border-cyber-border bg-[#090b10] text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Cyber Audio' : 'Enable Cyber Audio FX'}
              className={`p-2 rounded border text-xs font-mono transition-colors ${
                soundEnabled
                  ? 'border-cyber-red-primary/40 bg-cyber-red-blood/40 text-cyber-red-glow'
                  : 'border-cyber-border bg-[#090b10] text-slate-400 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Emergency DB Reset */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset Database to Default Factory State"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyber-red-blood/60 hover:bg-cyber-red-blood border border-cyber-red-primary/60 text-cyber-red-glow text-xs font-mono font-semibold transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">RESET LAB</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-cyber-border/70 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  cyberAudio.playClick();
                  setActiveTab(item.id);
                }}
                className={`flex flex-col items-center px-2 py-1 text-[10px] font-mono font-bold ${
                  isActive ? 'text-cyber-red-glow' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

