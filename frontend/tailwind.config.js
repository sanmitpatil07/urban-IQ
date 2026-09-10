/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0B1220',
          panel: '#131B2E',
          raised: '#1B2740',
        },
        border: {
          subtle: '#263349',
          bright: '#3A4D6E',
        },
        text: {
          primary: '#EDF1F7',
          secondary: '#8793A8',
          muted: '#5A677D',
        },
        heat: {
          safe: '#2FB8AC',
          moderate: '#F2A93B',
          high: '#E8632B',
          critical: '#C81E3A',
        },
        accent: {
          DEFAULT: '#2FB8AC',
          hover: '#269B91',
          glow: 'rgba(47, 184, 172, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'heat-pulse-critical': 'pulseHeatCritical 2.2s infinite ease-in-out',
        'heat-pulse-high': 'pulseHeatHigh 3s infinite ease-in-out',
        'heat-pulse-moderate': 'pulseHeatModerate 4s infinite ease-in-out',
        'heat-pulse-safe': 'pulseHeatSafe 5s infinite ease-in-out',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'telemetry-ping': 'telemetryPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        pulseHeatCritical: {
          '0%, 100%': { opacity: '0.85', filter: 'drop-shadow(0 0 14px rgba(200, 30, 58, 0.8))' },
          '50%': { opacity: '0.45', filter: 'drop-shadow(0 0 4px rgba(200, 30, 58, 0.3))' },
        },
        pulseHeatHigh: {
          '0%, 100%': { opacity: '0.8', filter: 'drop-shadow(0 0 10px rgba(232, 99, 43, 0.7))' },
          '50%': { opacity: '0.4', filter: 'drop-shadow(0 0 3px rgba(232, 99, 43, 0.25))' },
        },
        pulseHeatModerate: {
          '0%, 100%': { opacity: '0.75', filter: 'drop-shadow(0 0 8px rgba(242, 169, 59, 0.6))' },
          '50%': { opacity: '0.35', filter: 'drop-shadow(0 0 2px rgba(242, 169, 59, 0.2))' },
        },
        pulseHeatSafe: {
          '0%, 100%': { opacity: '0.65', filter: 'drop-shadow(0 0 5px rgba(47, 184, 172, 0.4))' },
          '50%': { opacity: '0.3', filter: 'drop-shadow(0 0 1px rgba(47, 184, 172, 0.1))' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        telemetryPing: {
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        }
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'panel-raised': '0 8px 30px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'cyan-glow': '0 0 15px rgba(47, 184, 172, 0.35)',
      }
    },
  },
  plugins: [],
}
