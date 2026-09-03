import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { scoreColor } from '../utils/scoreColor';
import CountUpScore from './CountUpScore.jsx';

export default function ScoreGauge({ score, isDark }) {
  const color = scoreColor(score);
  const colorMap = {
    emerald: isDark ? '#34D399' : '#059669',
    amber: isDark ? '#FBBF24' : '#D97706',
    rose: isDark ? '#FB7185' : '#E11D48',
  };
  const fillColor = colorMap[color] || '#4F46E5';
  const data = [{ value: score, fill: fillColor }];

  return (
    <div className="relative w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: isDark ? '#334155' : '#f1f5f9' }}
            dataKey="value"
            cornerRadius="50%"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUpScore target={score} isDark={isDark} />
        <p className={`text-sm font-medium transition-colors duration-300 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>Match Score</p>
      </div>
    </div>
  );
}