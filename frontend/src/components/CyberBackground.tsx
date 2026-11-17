import React, { useEffect, useRef } from 'react';

interface CyberBackgroundProps {
  showRain?: boolean;
}

export const CyberBackground: React.FC<CyberBackgroundProps> = ({ showRain = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!showRain) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle matrix/rain drops
    const columns = Math.floor(width / 24);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);
    const chars = '01アイウエオカキクケコサシスセソタチツテトSQL_INJECT_ERR_403';

    let lastTime = 0;
    const fps = 24; // Low CPU footprint, smooth visual
    const interval = 1000 / fps;

    const render = (time: number) => {
      animationId = requestAnimationFrame(render);
      const delta = time - lastTime;
      if (delta < interval) return;
      lastTime = time - (delta % interval);

      // Very light trail clear
      ctx.fillStyle = 'rgba(7, 8, 11, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '11px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 24;
        const y = drops[i] * 20;

        // Red and silver rain accents
        if (Math.random() > 0.85) {
          ctx.fillStyle = 'rgba(255, 42, 81, 0.6)'; // Neon Red lead glyph
        } else if (Math.random() > 0.5) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; // Crimson trail
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.15)'; // Slate silver
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [showRain]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Base dark graphite gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080B] via-[#0B0D13] to-[#050608]" />

      {/* 2. Cyber Hex / Dot Grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-20" />

      {/* 3. Original Anime Cyberpunk Hacker Illustration (High-Detail SVG Artwork) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-screen overflow-hidden">
        <svg
          viewBox="0 0 1600 900"
          className="w-full h-full object-cover scale-105 filter drop-shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cyberSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f1118" />
              <stop offset="70%" stopColor="#180a0e" />
              <stop offset="100%" stopColor="#07080B" />
            </linearGradient>

            <linearGradient id="neonRedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2A51" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>

            <linearGradient id="monitorScreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#220b12" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0c0407" stopOpacity="0.95" />
            </linearGradient>

            <radialGradient id="hackerHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF2A51" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#EF4444" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#07080B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Cyber City Skyline */}
          <rect width="1600" height="900" fill="url(#cyberSky)" />

          {/* Megacity Distant Skyscrapers */}
          <g fill="#0b0e14" opacity="0.7">
            <rect x="120" y="240" width="90" height="480" />
            <rect x="230" y="180" width="130" height="540" />
            <rect x="380" y="280" width="80" height="440" />
            <rect x="1100" y="200" width="110" height="520" />
            <rect x="1230" y="160" width="140" height="560" />
            <rect x="1390" y="260" width="90" height="460" />
          </g>

          {/* Hologram neon lines on skyscrapers */}
          <g stroke="#EF4444" strokeWidth="1.5" opacity="0.3" strokeDasharray="6 14">
            <line x1="295" y1="180" x2="295" y2="600" />
            <line x1="1300" y1="160" x2="1300" y2="600" />
          </g>

          {/* Red Team Central Ambient Glow */}
          <circle cx="800" cy="500" r="500" fill="url(#hackerHalo)" />

          {/* Multi-Monitor Command Workstation Console */}
          {/* Left Angle Monitor */}
          <g transform="translate(260, 240) skewY(10) scale(0.95)">
            <rect width="280" height="220" rx="8" fill="#121622" stroke="#EF4444" strokeWidth="2" opacity="0.6" />
            <rect x="10" y="10" width="260" height="200" rx="4" fill="url(#monitorScreen)" />
            {/* Monitor telemetry graph */}
            <path d="M 20 160 L 50 140 L 90 170 L 140 100 L 190 130 L 250 80" fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.8" />
            <text x="25" y="40" fill="#EF4444" fontFamily="monospace" fontSize="12" opacity="0.8">SYSTEM RECON // BGP AS15169</text>
            <text x="25" y="60" fill="#94A3B8" fontFamily="monospace" fontSize="9" opacity="0.6">&gt; SQL_INJECTION_ENGINE: ACTIVE</text>
            <text x="25" y="75" fill="#94A3B8" fontFamily="monospace" fontSize="9" opacity="0.6">&gt; PROBING PARAM: [username]</text>
          </g>

          {/* Center Main High-Res Ultrawide Display */}
          <g transform="translate(600, 180)">
            <rect width="400" height="260" rx="8" fill="#141824" stroke="#FF2A51" strokeWidth="2.5" opacity="0.8" />
            <rect x="12" y="12" width="376" height="236" rx="4" fill="url(#monitorScreen)" />
            {/* Screen Header Bar */}
            <rect x="12" y="12" width="376" height="26" fill="#2d0f18" />
            <circle cx="30" cy="25" r="4" fill="#EF4444" />
            <circle cx="45" cy="25" r="4" fill="#64748B" />
            <circle cx="60" cy="25" r="4" fill="#64748B" />
            <text x="80" y="28" fill="#F1F5F9" fontFamily="monospace" fontSize="10" fontWeight="bold">TARGET: REDCORP_MAINFRAME.INTERNAL</text>

            {/* Simulated Exploit Terminal Text in Screen */}
            <g fill="#EF4444" fontFamily="monospace" fontSize="11" opacity="0.85">
              <text x="30" y="65">&gt; SELECT * FROM credentials</text>
              <text x="30" y="85">&gt; WHERE user = 'admin' --'</text>
              <text x="30" y="110" fill="#F1F5F9">&gt; [+] AST PARSE: AUTH_BYPASS TRUE</text>
              <text x="30" y="130" fill="#22C55E">&gt; [OK] SESSION PRIVILEGE: ROOT_ADMIN</text>
              <text x="30" y="150" fill="#94A3B8">&gt; EXTRACTING: TOP_SECRET_KEYS...</text>
            </g>
            {/* Pulsing Target Grid */}
            <circle cx="320" cy="180" r="35" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="320" cy="180" r="18" fill="none" stroke="#FF2A51" strokeWidth="1.5" />
            <line x1="320" y1="135" x2="320" y2="225" stroke="#EF4444" strokeWidth="1" opacity="0.6" />
            <line x1="275" y1="180" x2="365" y2="180" stroke="#EF4444" strokeWidth="1" opacity="0.6" />
          </g>

          {/* Right Angle Monitor */}
          <g transform="translate(1060, 240) skewY(-10) scale(0.95)">
            <rect width="280" height="220" rx="8" fill="#121622" stroke="#EF4444" strokeWidth="2" opacity="0.6" />
            <rect x="10" y="10" width="260" height="200" rx="4" fill="url(#monitorScreen)" />
            <text x="25" y="40" fill="#EF4444" fontFamily="monospace" fontSize="12" opacity="0.8">L7 WAF DEFENSE TELEMETRY</text>
            <rect x="25" y="60" width="220" height="15" rx="3" fill="#35101a" />
            <rect x="25" y="60" width="165" height="15" rx="3" fill="#EF4444" opacity="0.8" />
            <text x="30" y="72" fill="#F1F5F9" fontFamily="monospace" fontSize="9">FILTER SENSITIVITY: HIGH</text>
            <text x="25" y="110" fill="#94A3B8" fontFamily="monospace" fontSize="9">&gt; RULE_101: UNION_SELECT (ON)</text>
            <text x="25" y="130" fill="#94A3B8" fontFamily="monospace" fontSize="9">&gt; RULE_102: TAUTOLOGY (ON)</text>
            <text x="25" y="150" fill="#22C55E" fontFamily="monospace" fontSize="9">&gt; INTERCEPTOR SHIELD: ACTIVE</text>
          </g>

          {/* Mysterious Anime Cyber Hacker Silhouette */}
          <g id="hackerCharacter" transform="translate(800, 520)">
            {/* Cyber Desk Contour */}
            <path d="M -450 160 L 450 160 L 380 320 L -380 320 Z" fill="#0d1017" stroke="#252b3b" strokeWidth="2" />
            {/* Glowing neon edge on desk */}
            <line x1="-420" y1="165" x2="420" y2="165" stroke="#EF4444" strokeWidth="3" opacity="0.7" />

            {/* Hacker Torso & Techwear Hoodie */}
            <path
              d="M -110 260 C -120 180, -90 90, -55 70 C -35 55, 35 55, 55 70 C 90 90, 120 180, 110 260 Z"
              fill="#080a0e"
              stroke="#252b3b"
              strokeWidth="2"
            />
            {/* Red LED Seam Accents on Techwear Jacket */}
            <path d="M -75 140 Q -30 200 -20 260" fill="none" stroke="#EF4444" strokeWidth="2.5" opacity="0.8" />
            <path d="M 75 140 Q 30 200 20 260" fill="none" stroke="#EF4444" strokeWidth="2.5" opacity="0.8" />

            {/* Hacker Head with Hood */}
            <path
              d="M -45 50 C -55 10, -40 -35, 0 -45 C 40 -35, 55 10, 45 50 C 40 70, -40 70, -45 50 Z"
              fill="#06070a"
            />

            {/* Cyber Over-Ear Headphones with Crimson LED Ring */}
            <circle cx="-50" cy="15" r="14" fill="#121622" stroke="#EF4444" strokeWidth="2.5" />
            <circle cx="-50" cy="15" r="6" fill="#FF2A51" opacity="0.9" />
            <circle cx="50" cy="15" r="14" fill="#121622" stroke="#EF4444" strokeWidth="2.5" />
            <circle cx="50" cy="15" r="6" fill="#FF2A51" opacity="0.9" />
            <path d="M -48 2 C -30 -30, 30 -30, 48 2" fill="none" stroke="#252b3b" strokeWidth="5" />

            {/* Glowing Cybernetic Visor / Eye Reflection (Red Glow) */}
            <path d="M -26 12 L 26 12 L 20 22 L -20 22 Z" fill="#FF2A51" opacity="0.95" />
            <line x1="-24" y1="17" x2="24" y2="17" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />

            {/* Hands on Mechanical Keyboard */}
            <rect x="-85" y="195" width="170" height="45" rx="5" fill="#151926" stroke="#252b3b" strokeWidth="1.5" />
            {/* Key glow points */}
            <g fill="#EF4444" opacity="0.8">
              <circle cx="-60" cy="210" r="2" />
              <circle cx="-40" cy="210" r="2" />
              <circle cx="-20" cy="210" r="2" />
              <circle cx="0" cy="210" r="2" />
              <circle cx="20" cy="210" r="2" />
              <circle cx="40" cy="210" r="2" />
              <circle cx="60" cy="210" r="2" />
            </g>
          </g>
        </svg>
      </div>

      {/* 4. Canvas-based Matrix / Cyber Rain Layer */}
      {showRain && <canvas ref={canvasRef} className="absolute inset-0 opacity-25" />}

      {/* 5. Subtle CRT scanline effect */}
      <div className="absolute inset-0 scanlines-overlay opacity-30" />

      {/* 6. Soft radial gradient overlay so foreground text is crystal-clear */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/75 to-transparent" />
    </div>
  );
};

