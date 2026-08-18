import React, { useState } from 'react';
import { Clock, User, CheckCircle, ChevronDown, ChevronUp, Plus, Trash2, Edit3, MessageSquare } from 'lucide-react';
import { AgendaSection } from '../types';

interface SectionCardProps {
  section: AgendaSection;
  index: number;
  timeRangeLabel: string;
  onUpdateDuration: (id: string, newDuration: number) => void;
  onUpdateSection: (updated: AgendaSection) => void;
  onDeleteSection: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const CATEGORY_TAGS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'Context & Kickoff': { label: 'Context & Kickoff', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Discussion': { label: 'Discussion', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Deep Dive': { label: 'Deep Dive', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'Decision Gate': { label: 'Decision Gate', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Action Planning': { label: 'Action Planning', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Wrap-up & Buffer': { label: 'Wrap-up & Buffer', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  index,
  timeRangeLabel,
  onUpdateDuration,
  onUpdateSection,
  onDeleteSection,
  onMoveUp,
  onMoveDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDiscussionPoint, setNewDiscussionPoint] = useState('');
  const [showAddPoint, setShowAddPoint] = useState(false);

  // Edit draft state
  const [draftTitle, setDraftTitle] = useState(section.title);
  const [draftSummary, setDraftSummary] = useState(section.summary);
  const [draftOutcome, setDraftOutcome] = useState(section.expectedOutcome);
  const [draftLead, setDraftLead] = useState(section.leadStakeholder || '');

  const categoryStyle = CATEGORY_TAGS[section.category] || CATEGORY_TAGS['Discussion'];

  const handleSaveEdit = () => {
    onUpdateSection({
      ...section,
      title: draftTitle,
      summary: draftSummary,
      expectedOutcome: draftOutcome,
      leadStakeholder: draftLead,
    });
    setIsEditing(false);
  };

  const handleAddPoint = () => {
    if (!newDiscussionPoint.trim()) return;
    onUpdateSection({
      ...section,
      keyDiscussionPoints: [...section.keyDiscussionPoints, newDiscussionPoint.trim()],
    });
    setNewDiscussionPoint('');
    setShowAddPoint(false);
  };

  const handleRemovePoint = (pointIndex: number) => {
    const updated = section.keyDiscussionPoints.filter((_, idx) => idx !== pointIndex);
    onUpdateSection({
      ...section,
      keyDiscussionPoints: updated,
    });
  };

  return (
    <div
      id={`section-card-${section.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow"
    >
      {/* Top bar: Number, Category, Timeline label, Duration controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          >
            {section.category}
          </span>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            {timeRangeLabel}
          </span>
        </div>

        {/* Duration adjuster & actions */}
        <div className="flex items-center space-x-2">
          {/* Duration Step Button Group */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => onUpdateDuration(section.id, Math.max(1, section.durationMinutes - 5))}
              className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
              title="Decrease duration by 5m"
            >
              -5m
            </button>
            <div className="px-2.5 py-0.5 text-xs font-bold text-indigo-700 font-mono flex items-center space-x-1 bg-white rounded shadow-2xs">
              <Clock className="w-3 h-3 text-indigo-500" />
              <span>{section.durationMinutes}m</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateDuration(section.id, section.durationMinutes + 5)}
              className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
              title="Increase duration by 5m"
            >
              +5m
            </button>
          </div>

          {/* Reordering */}
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Edit / Delete */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
            title="Edit topic details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteSection(section.id)}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            title="Remove section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content & Inline Editing */}
      {isEditing ? (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Stakeholder / Speaker</label>
            <input
              type="text"
              value={draftLead}
              onChange={(e) => setDraftLead(e.target.value)}
              placeholder="e.g. Marcus Vance (Tech Lead)"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Topic Summary</label>
            <textarea
              rows={3}
              value={draftSummary}
              onChange={(e) => setDraftSummary(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white leading-relaxed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Outcome / Decision</label>
            <input
              type="text"
              value={draftOutcome}
              onChange={(e) => setDraftOutcome(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Title & Lead */}
          <div className="flex items-start justify-between mb-2.5">
            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {section.title}
            </h4>
            {section.leadStakeholder && (
              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium shrink-0 ml-2">
                <User className="w-3 h-3 text-slate-500" />
                <span>{section.leadStakeholder}</span>
              </div>
            )}
          </div>

          {/* Topic Summary */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            {section.summary}
          </p>

          {/* Key Discussion Points */}
          {section.keyDiscussionPoints && section.keyDiscussionPoints.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Discussion Points & Critical Questions</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddPoint(!showAddPoint)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-0.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <ul className="space-y-1.5">
                {section.keyDiscussionPoints.map((point, pIdx) => (
                  <li
                    key={pIdx}
                    className="group flex items-start justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-indigo-500 font-bold text-xs mt-0.5">•</span>
                      <span className="leading-normal">{point}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(pIdx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 cursor-pointer"
                      title="Remove question"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>

              {showAddPoint && (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={newDiscussionPoint}
                    onChange={(e) => setNewDiscussionPoint(e.target.value)}
                    placeholder="Enter discussion prompt or question..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Expected Outcome / Decision */}
          <div className="flex items-start space-x-2.5 bg-emerald-50/60 border border-emerald-200/70 p-3 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                Target Outcome / Decision Gate
              </span>
              <span className="text-xs text-emerald-950 font-medium leading-relaxed">
                {section.expectedOutcome}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
