import { useState, useEffect, useRef } from 'react';
import { scoreColor } from '../utils/scoreColor';

const DURATION = 1200;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function CountUpScore({ target, isDark }) {
  const [value, setValue] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    const to = Math.max(0, Math.min(100, target ?? 0));
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / DURATION, 1);
      setValue(Math.round(to * easeOutCubic(progress)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  const color = scoreColor(target);
  const colorMap = {
    emerald: isDark ? '#34D399' : '#059669',
    amber: isDark ? '#FBBF24' : '#D97706',
    rose: isDark ? '#FB7185' : '#E11D48',
  };
  const textColor = colorMap[color] || (isDark ? '#818CF8' : '#4F46E5');

  return (
    <p
      className="text-4xl font-bold tabular-nums transition-colors duration-300"
      style={{ color: textColor }}
    >
      {value}
      <span className="text-xl font-semibold align-top">%</span>
    </p>
  );
}