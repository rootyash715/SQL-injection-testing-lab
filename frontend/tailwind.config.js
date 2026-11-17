/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          darkest: "#07080B",
          darker: "#0B0D13",
          dark: "#11141E",
          card: "#161A26",
          border: "#252B3B",
          muted: "#64748B",
          silver: "#94A3B8",
          light: "#F1F5F9",
          red: {
            glow: "#FF2A51",
            primary: "#EF4444",
            dark: "#B91C1C",
            deep: "#7F1D1D",
            blood: "#450A0A"
          }
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 1s infinite linear alternate-reverse',
        'laser-sweep': 'laserSweep 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        laserSweep: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}

