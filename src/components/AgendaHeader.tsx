import React, { useState } from 'react';
import { Target, Clock, Users, CheckSquare, Layers, Sparkles, RefreshCw, Edit3, Check } from 'lucide-react';
import { MeetingAgenda } from '../types';

interface AgendaHeaderProps {
  agenda: MeetingAgenda;
  onUpdateAgenda: (updated: MeetingAgenda) => void;
  onRebalanceDuration: (newTotalMinutes: number) => void;
  isRebalancing: boolean;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  agenda,
  onUpdateAgenda,
  onRebalanceDuration,
  isRebalancing,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(agenda.title);
  const [goalDraft, setGoalDraft] = useState(agenda.meetingGoal);
  const [showTimeMenu, setShowTimeMenu] = useState(false);

  const handleSaveHeader = () => {
    onUpdateAgenda({
      ...agenda,
      title: titleDraft,
      meetingGoal: goalDraft,
    });
    setIsEditingTitle(false);
  };

  const calculatedTotalMinutes = agenda.sections.reduce(
    (acc, s) => acc + (Number(s.durationMinutes) || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          {/* Tag & Archetype */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
              {agenda.meetingType}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              Audience: {agenda.targetAudience}
            </span>
          </div>

          {/* Title & Goal */}
          {isEditingTitle ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Goal & Purpose
                </label>
                <textarea
                  rows={2}
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeader}
                  className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
                >
                  Save Title & Goal
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="flex items-start space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {agenda.title}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setTitleDraft(agenda.title);
                    setGoalDraft(agenda.meetingGoal);
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer mt-1"
                  title="Edit title & goal"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex items-start space-x-2 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                <Target className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Meeting Goal: </span>
                  <span>{agenda.meetingGoal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timing badge & Quick Rebalancer */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 rounded-2xl p-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-indigo-700 font-medium">Total Duration</div>
              <div className="text-lg font-extrabold text-indigo-950 font-mono leading-none">
                {calculatedTotalMinutes} mins
              </div>
            </div>
          </div>

          {/* Quick Rebalance Dropdown */}
          <div className="relative">
            <button
              id="btn-rebalance-time-menu"
              type="button"
              onClick={() => setShowTimeMenu(!showTimeMenu)}
              disabled={isRebalancing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              {isRebalancing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>Re-time Agenda</span>
            </button>

            {showTimeMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-20 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rebalance Total Time
                </div>
                {[15, 30, 45, 60, 90, 120].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      setShowTimeMenu(false);
                      onRebalanceDuration(dur);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between cursor-pointer ${
                      agenda.totalDurationMinutes === dur ? 'bg-indigo-50/70 text-indigo-800 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{dur} minutes</span>
                    {agenda.totalDurationMinutes === dur && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 leading-tight">Sections</div>
            <div className="text-sm font-bold text-slate-900">{agenda.sections.length} topics</div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 leading-tight">Action Items</div>
            <div className="text-sm font-bold text-slate-900">{agenda.actionItems.length} tasks</div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/50">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 leading-tight">Stakeholders</div>
            <div className="text-sm font-bold text-slate-900">{agenda.stakeholders.length} owners</div>
          </div>
        </div>
      </div>
    </div>
  );
};
