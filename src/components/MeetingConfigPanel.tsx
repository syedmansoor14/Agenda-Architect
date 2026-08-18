import React from 'react';
import { Clock, Target, Users, Sliders, Sparkles, RefreshCw } from 'lucide-react';
import { MeetingConfig } from '../types';

interface MeetingConfigPanelProps {
  config: MeetingConfig;
  onChange: (newConfig: MeetingConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

const DURATION_PRESETS = [
  { value: 15, label: '15 min', sub: 'Lightning sync' },
  { value: 30, label: '30 min', sub: 'Focused standup' },
  { value: 45, label: '45 min', sub: 'Standard working' },
  { value: 60, label: '60 min', sub: 'Deep-dive review' },
  { value: 90, label: '90 min', sub: 'Workshop' },
  { value: 120, label: '2 hours', sub: 'Exec planning' },
];

const MEETING_TYPES = [
  'Decision-Making',
  'Strategic Planning',
  'Project Sync & Status',
  'Brainstorming',
  'Review & Retro',
] as const;

export const MeetingConfigPanel: React.FC<MeetingConfigPanelProps> = ({
  config,
  onChange,
  onGenerate,
  isGenerating,
  canGenerate,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Meeting Parameters & Timing
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Tailors every section to exact minutes
        </span>
      </div>

      {/* Total Duration Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Total Meeting Duration</span>
          </label>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
            {config.totalDurationMinutes} minutes total
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DURATION_PRESETS.map((preset) => {
            const isSelected = config.totalDurationMinutes === preset.value;
            return (
              <button
                key={preset.value}
                id={`btn-duration-${preset.value}`}
                type="button"
                onClick={() => onChange({ ...config, totalDurationMinutes: preset.value })}
                className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{preset.label}</div>
                <div className="text-[10px] text-slate-500 leading-tight truncate">
                  {preset.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom duration slider */}
        <div className="mt-3 flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
          <span className="text-[11px] font-medium text-slate-500 shrink-0">Custom slider:</span>
          <input
            id="slider-custom-duration"
            type="range"
            min="10"
            max="180"
            step="5"
            value={config.totalDurationMinutes}
            onChange={(e) =>
              onChange({ ...config, totalDurationMinutes: Number(e.target.value) })
            }
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <span className="text-xs font-mono font-semibold text-slate-800 shrink-0 min-w-[3rem] text-right">
            {config.totalDurationMinutes}m
          </span>
        </div>
      </div>

      {/* Meeting Type / Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Meeting Archetype</span>
          </label>
          <select
            id="select-meeting-type"
            value={config.meetingType}
            onChange={(e) =>
              onChange({
                ...config,
                meetingType: e.target.value as MeetingConfig['meetingType'],
              })
            }
            className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
          >
            {MEETING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Key Stakeholders / Attendees (Optional)</span>
          </label>
          <input
            id="input-participants-hint"
            type="text"
            value={config.participantsHint || ''}
            onChange={(e) => onChange({ ...config, participantsHint: e.target.value })}
            placeholder="e.g. Elena (Architect), Marcus (Tech Lead), Sarah (Infosec)"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
          />
        </div>
      </div>

      {/* Specific Goal & Buffer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div>
          <label className="text-xs font-semibold text-slate-800 mb-1.5 block">
            Specific Outcome or Decision Goal (Optional)
          </label>
          <input
            id="input-custom-objective"
            type="text"
            value={config.customObjective || ''}
            onChange={(e) => onChange({ ...config, customObjective: e.target.value })}
            placeholder="e.g. Vote on CRDT engine & allocate Phase 1 engineers"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-800">
              Wrap-up & Buffer Time
            </label>
            <span className="text-xs font-medium text-slate-500">
              {config.bufferMinutes} mins
            </span>
          </div>
          <input
            id="slider-buffer-minutes"
            type="range"
            min="2"
            max="15"
            step="1"
            value={config.bufferMinutes}
            onChange={(e) =>
              onChange({ ...config, bufferMinutes: Number(e.target.value) })
            }
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-2"
          />
        </div>
      </div>

      {/* Primary Generation Button */}
      <div className="pt-2">
        <button
          id="btn-craft-agenda"
          type="button"
          disabled={!canGenerate || isGenerating}
          onClick={onGenerate}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Document & Allocating {config.totalDurationMinutes}m Agenda...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Craft Timed Meeting Agenda ({config.totalDurationMinutes} min)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
