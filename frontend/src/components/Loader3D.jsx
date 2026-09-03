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
      <div className="box-loader" aria-label={chipLabel} role="status">
        <div className="box1"></div>
        <div className="box2"></div>
        <div className="box3"></div>
      </div>

      <style>{`
        .box-loader {
          width: 112px;
          height: 112px;
          position: relative;
        }
        .box1, .box2, .box3 {
          border: 16px solid ${isDark ? '#e5e7eb' : '#1e293b'};
          box-sizing: border-box;
          position: absolute;
          display: block;
        }
        .box1 {
          width: 112px;
          height: 48px;
          margin-top: 64px;
          margin-left: 0px;
          animation: abox1 4s 1s forwards ease-in-out infinite;
        }
        .box2 {
          width: 48px;
          height: 48px;
          margin-top: 0px;
          margin-left: 0px;
          animation: abox2 4s 1s forwards ease-in-out infinite;
        }
        .box3 {
          width: 48px;
          height: 48px;
          margin-top: 0px;
          margin-left: 64px;
          animation: abox3 4s 1s forwards ease-in-out infinite;
        }

        @keyframes abox1 {
          0% { width: 112px; height: 48px; margin-top: 64px; margin-left: 0px; }
          12.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
          25% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
          37.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
          50% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
          62.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
          75% { width: 48px; height: 112px; margin-top: 0px; margin-left: 0px; }
          87.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
          100% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
        }
        @keyframes abox2 {
          0% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
          12.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
          25% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
          37.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
          50% { width: 112px; height: 48px; margin-top: 0px; margin-left: 0px; }
          62.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
          75% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
          87.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
          100% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
        }
        @keyframes abox3 {
          0% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
          12.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
          25% { width: 48px; height: 112px; margin-top: 0px; margin-left: 64px; }
          37.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
          50% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
          62.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
          75% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
          87.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
          100% { width: 112px; height: 48px; margin-top: 64px; margin-left: 0px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .box1, .box2, .box3 { animation: none; }
        }
      `}</style>

      <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {STEPS[stepIndex]}
      </p>
    </div>
  );
}