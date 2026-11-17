import React, { useState, useEffect } from 'react';
import { CyberBackground } from './components/CyberBackground';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { ModulesView } from './views/ModulesView';
import { PlaygroundView } from './views/PlaygroundView';
import { WafLabView } from './views/WafLabView';
import { VulnerableLabsView } from './views/VulnerableLabsView';
import { fetchDashboardStats } from './api';
import { cyberAudio } from './components/AudioController';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetLabId, setTargetLabId] = useState<string | undefined>(undefined);
  const [currentRank, setCurrentRank] = useState<string>('LVL 1 // RECON OPERATOR');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [rainEnabled, setRainEnabled] = useState<boolean>(true);

  const refreshRank = async () => {
    try {
      const stats = await fetchDashboardStats();
      setCurrentRank(stats.current_level);
    } catch {}
  };

  useEffect(() => {
    refreshRank();
  }, []);

  const handleNavigate = (tab: string, subParam?: string) => {
    setActiveTab(tab);
    if (subParam && tab === 'labs') {
      setTargetLabId(subParam);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darkest text-cyber-light font-sans relative selection:bg-cyber-red-dark selection:text-white">
      {/* Anime Cyberpunk Background with Multi-Monitor Hacker Illustration & Rain */}
      <CyberBackground showRain={rainEnabled} />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentRank={currentRank}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          rainEnabled={rainEnabled}
          setRainEnabled={setRainEnabled}
          onDatabaseReset={refreshRank}
        />

        <main className="flex-1 pb-16">
          {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {activeTab === 'modules' && <ModulesView />}
          {activeTab === 'playground' && <PlaygroundView />}
          {activeTab === 'waf' && <WafLabView />}
          {activeTab === 'labs' && (
            <VulnerableLabsView
              initialLabId={targetLabId}
              onFlagCaptured={refreshRank}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="glass-panel border-t border-cyber-border py-4 px-6 text-center text-xs font-mono text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>ISOLATED ENVIRONMENT // LOCALHOST 127.0.0.1</span>
            </div>
            <div className="text-slate-500">
              STRICTLY DEFENSIVE EDUCATIONAL SECURITY LAB • ZERO OUTBOUND SCANNING
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

