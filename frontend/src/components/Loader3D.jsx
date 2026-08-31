import { useState, useEffect } from 'react';

const STEPS = ['Reading resume…', 'Comparing skills…', 'Scoring match…', 'Writing feedback…'];

export default function Loader3D({ isDark, label }) {
  const [stepIndex, setStepIndex] = useState(0);
  const chipLabel = label || 'Loading';

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 sm:py-20 animate-fade-slide-up">
      <div className="chip-loader" style={{ width: '100%', maxWidth: '560px' }}>
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="chipGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d2d2d" />
              <stop offset="100%" stopColor="#0f0f0f" />
            </linearGradient>

            <linearGradient id="pinGradient" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#bbbbbb" />
              <stop offset="50%" stopColor="#888888" />
              <stop offset="100%" stopColor="#555555" />
            </linearGradient>
          </defs>

          <g id="traces">
            <path d="M100 100 H200 V210 H326" className="trace-bg" />
            <path d="M100 100 H200 V210 H326" className="trace-flow purple" />

            <path d="M80 180 H180 V230 H326" className="trace-bg" />
            <path d="M80 180 H180 V230 H326" className="trace-flow blue" />

            <path d="M60 260 H150 V250 H326" className="trace-bg" />
            <path d="M60 260 H150 V250 H326" className="trace-flow yellow" />

            <path d="M100 350 H200 V270 H326" className="trace-bg" />
            <path d="M100 350 H200 V270 H326" className="trace-flow green" />

            <path d="M700 90 H560 V210 H474" className="trace-bg" />
            <path d="M700 90 H560 V210 H474" className="trace-flow blue" />

            <path d="M740 160 H580 V230 H474" className="trace-bg" />
            <path d="M740 160 H580 V230 H474" className="trace-flow green" />

            <path d="M720 250 H590 V250 H474" className="trace-bg" />
            <path d="M720 250 H590 V250 H474" className="trace-flow red" />

            <path d="M680 340 H570 V270 H474" className="trace-bg" />
            <path d="M680 340 H570 V270 H474" className="trace-flow yellow" />
          </g>

          <rect
            x="330"
            y="190"
            width="140"
            height="100"
            rx="20"
            ry="20"
            fill="url(#chipGradient)"
            stroke="#222"
            strokeWidth="3"
            filter="drop-shadow(0 0 6px rgba(0,0,0,0.8))"
          />

          <g>
            <rect x="322" y="205" width="8" height="10" fill="url(#pinGradient)" rx="2" />
            <rect x="322" y="225" width="8" height="10" fill="url(#pinGradient)" rx="2" />
            <rect x="322" y="245" width="8" height="10" fill="url(#pinGradient)" rx="2" />
            <rect x="322" y="265" width="8" height="10" fill="url(#pinGradient)" rx="2" />
          </g>

          <g>
            <rect x="470" y="205" width="8" height="10" fill="url(#pinGradient)" rx="2" />
            <rect x="470" y="225" width="8" height="10" fill="url(#pinGradient)" rx="2" />
            <rect x="470" y="245" width="8" height="10" fill="url(#pinGradient)" rx="2" />
            <rect x="470" y="265" width="8" height="10" fill="url(#pinGradient)" rx="2" />
          </g>

          <foreignObject x="336" y="196" width="128" height="88">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 4px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 600,
                lineHeight: 1.15,
                fontSize: chipLabel.length > 14 ? '13px' : '20px',
                background: 'linear-gradient(180deg, #eeeeee 0%, #888888 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                overflow: 'hidden',
                wordBreak: 'break-word',
              }}
            >
              {chipLabel}
            </div>
          </foreignObject>

          <circle cx="100" cy="100" r="5" fill="black" />
          <circle cx="80" cy="180" r="5" fill="black" />
          <circle cx="60" cy="260" r="5" fill="black" />
          <circle cx="100" cy="350" r="5" fill="black" />

          <circle cx="700" cy="90" r="5" fill="black" />
          <circle cx="740" cy="160" r="5" fill="black" />
          <circle cx="720" cy="250" r="5" fill="black" />
          <circle cx="680" cy="340" r="5" fill="black" />
        </svg>
      </div>

      <style>{`
        .trace-bg {
          stroke: #333;
          stroke-width: 2;
          fill: none;
        }
        .trace-flow {
          stroke-width: 3;
          stroke-linecap: round;
          fill: none;
          stroke-dasharray: 70 370;
          stroke-dashoffset: 438;
          opacity: 0.35;
          filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 10px currentColor);
          animation: chipFlow 3s cubic-bezier(0.5, 0, 0.9, 1) infinite, chipPulse 3s cubic-bezier(0.5, 0, 0.9, 1) infinite;
        }
        .trace-flow.yellow { stroke: #fff34d; color: #fff34d; }
        .trace-flow.blue { stroke: #4de6ff; color: #4de6ff; }
        .trace-flow.green { stroke: #4dff6a; color: #4dff6a; }
        .trace-flow.purple { stroke: #c877ff; color: #c877ff; }
        .trace-flow.red { stroke: #ff6a4d; color: #ff6a4d; }

        @keyframes chipPulse {
          0%, 100% { opacity: 0.35; }
          20%, 55% { opacity: 1; }
        }

        @keyframes chipFlow {
          to { stroke-dashoffset: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .trace-flow { animation: none; }
        }
      `}</style>

      <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {STEPS[stepIndex]}
      </p>
    </div>
  );
}