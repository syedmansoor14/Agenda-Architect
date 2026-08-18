import React from 'react';
import { AgendaSection } from '../types';
import { calculateTimeline } from '../utils/timeUtils';

interface TimelineVisualizerProps {
  sections: AgendaSection[];
  totalMinutes: number;
  activeSectionId?: string;
  onSelectSection?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  'Context & Kickoff': { bar: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
  'Discussion': { bar: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'Deep Dive': { bar: 'bg-violet-600', text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  'Decision Gate': { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Action Planning': { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'Wrap-up & Buffer': { bar: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
};

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  sections,
  totalMinutes,
  activeSectionId,
  onSelectSection,
}) => {
  const timeline = calculateTimeline(sections);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Agenda Time Flow
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">
            {sections.length} topics across {totalMinutes} minutes
          </span>
        </div>
        <div className="text-xs font-mono font-semibold text-indigo-600">
          Total: {totalMinutes}m
        </div>
      </div>

      {/* Multi-segment time bar */}
      <div className="relative w-full h-8 bg-slate-100 rounded-xl overflow-hidden flex shadow-inner border border-slate-200/60">
        {timeline.map((sec, idx) => {
          const widthPercent = totalMinutes > 0 ? (sec.durationMinutes / totalMinutes) * 100 : 0;
          const color = CATEGORY_COLORS[sec.category] || { bar: 'bg-indigo-500' };
          const isActive = sec.id === activeSectionId;

          return (
            <div
              key={sec.id || idx}
              onClick={() => onSelectSection?.(sec.id)}
              style={{ width: `${Math.max(2, widthPercent)}%` }}
              title={`${sec.title} (${sec.durationMinutes} min | ${sec.category})`}
              className={`h-full ${color.bar} relative cursor-pointer group transition-all border-r border-white/30 last:border-none flex items-center justify-center overflow-hidden ${
                isActive ? 'ring-2 ring-indigo-900 ring-inset opacity-100' : 'hover:opacity-90'
              }`}
            >
              <span className="text-[10px] font-bold text-white px-1 truncate select-none opacity-90 group-hover:opacity-100">
                {widthPercent > 12 ? `${sec.durationMinutes}m` : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time ticks indicator */}
      <div className="relative flex justify-between mt-1.5 px-0.5 text-[10px] font-mono text-slate-400">
        <span>00:00 (Start)</span>
        <span>{Math.round(totalMinutes / 2)}m midpoint</span>
        <span>{totalMinutes}:00 (End)</span>
      </div>

      {/* Category legend chips */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
        {Object.entries(CATEGORY_COLORS).map(([catName, styling]) => {
          const count = sections.filter((s) => s.category === catName).length;
          if (count === 0) return null;
          return (
            <div
              key={catName}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${styling.bg} ${styling.text} border ${styling.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${styling.bar}`} />
              <span>{catName}</span>
              <span className="opacity-70 text-[10px]">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
