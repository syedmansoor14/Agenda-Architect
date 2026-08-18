import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Plus, X, Clock, CheckCircle2, AlertCircle, Edit3, Sparkles, Volume2, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MeetingAgenda, ActionItem } from '../types';

interface MeetingLiveRunnerProps {
  agenda: MeetingAgenda;
  onClose: () => void;
  onUpdateActionItems: (items: ActionItem[]) => void;
}

export const MeetingLiveRunner: React.FC<MeetingLiveRunnerProps> = ({
  agenda,
  onClose,
  onUpdateActionItems,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = agenda.sections[currentSectionIndex] || agenda.sections[0];

  // Seconds remaining for current section
  const [sectionSecondsLeft, setSectionSecondsLeft] = useState(
    (currentSection?.durationMinutes || 5) * 60
  );
  const [isRunning, setIsRunning] = useState(true);
  const [liveNotes, setLiveNotes] = useState('');
  const [meetingCompleted, setMeetingCompleted] = useState(false);

  // When switching sections, update timer
  useEffect(() => {
    if (agenda.sections[currentSectionIndex]) {
      setSectionSecondsLeft(agenda.sections[currentSectionIndex].durationMinutes * 60);
    }
  }, [currentSectionIndex, agenda.sections]);

  // Main countdown tick
  useEffect(() => {
    if (!isRunning || meetingCompleted) return;

    const timer = setInterval(() => {
      setSectionSecondsLeft((prev) => {
        if (prev <= 1) {
          // Check if next section exists
          if (currentSectionIndex < agenda.sections.length - 1) {
            setCurrentSectionIndex((idx) => idx + 1);
            return 0;
          } else {
            setMeetingCompleted(true);
            setIsRunning(false);
            try {
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch (e) {
              // Ignore confetti error
            }
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentSectionIndex, agenda.sections.length, meetingCompleted]);

  const formatSeconds = (secs: number) => {
    const isNegative = secs < 0;
    const absSecs = Math.abs(secs);
    const m = Math.floor(absSecs / 60);
    const s = absSecs % 60;
    return `${isNegative ? '-' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNextSection = () => {
    if (currentSectionIndex < agenda.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      setMeetingCompleted(true);
      setIsRunning(false);
      try {
        confetti({ particleCount: 100 });
      } catch (e) {}
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const addTime = (extraMinutes: number) => {
    setSectionSecondsLeft((prev) => prev + extraMinutes * 60);
  };

  const toggleActionItem = (id: string) => {
    const updated = agenda.actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateActionItems(updated);
  };

  const handleExportMinutes = () => {
    let text = `# Meeting Minutes: ${agenda.title}\n\n`;
    text += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
    text += `## Objective\n${agenda.meetingGoal}\n\n`;
    text += `## Facilitation Notes\n${liveNotes || 'No additional notes captured.'}\n\n`;
    text += `## Action Items Status\n`;
    agenda.actionItems.forEach((a) => {
      text += `- [${a.completed ? 'x' : ' '}] ${a.task} (@${a.owner} | ${a.priority})\n`;
    });

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meeting_Minutes_${agenda.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Live Meeting Mode
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  Section {currentSectionIndex + 1} of {agenda.sections.length}
                </span>
              </div>
              <h3 className="text-base font-bold text-white truncate max-w-lg">
                {agenda.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportMinutes}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Minutes</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Meeting Completed Banner */}
        {meetingCompleted && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 p-4 text-center">
            <div className="inline-flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Meeting Agenda Complete! All sections facilitated within time.</span>
            </div>
          </div>
        )}

        {/* Main 2-Column Split: Active Topic on Left, Scribe/Actions on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Column: Big Timer & Active Topic */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 space-y-6">
            <div>
              {/* Category & Section Title */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentSection.category}
                </span>
                {currentSection.leadStakeholder && (
                  <span className="text-xs text-slate-400 font-medium">
                    Speaker: <strong className="text-indigo-300">{currentSection.leadStakeholder}</strong>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
                {currentSection.title}
              </h2>

              {/* Large Timer Display */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center my-4 relative overflow-hidden">
                <div
                  className={`text-6xl sm:text-7xl font-mono font-extrabold tracking-tight ${
                    sectionSecondsLeft <= 30
                      ? 'text-red-400 animate-pulse'
                      : sectionSecondsLeft <= 120
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {formatSeconds(sectionSecondsLeft)}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  Allocated: {currentSection.durationMinutes} minutes
                </div>

                {/* Control Buttons */}
                <div className="flex items-center space-x-3 mt-5">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    disabled={currentSectionIndex === 0}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
                    title="Previous section"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRunning(!isRunning)}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Advance to next section"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => addTime(2)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400 cursor-pointer"
                    title="Add 2 minutes buffer to this section"
                  >
                    +2 min
                  </button>
                </div>
              </div>

              {/* Topic Summary */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                <span className="font-bold text-indigo-400 block mb-1">Executive Summary:</span>
                {currentSection.summary}
              </div>

              {/* Discussion Points */}
              {currentSection.keyDiscussionPoints?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Critical Questions & Discussion Prompts
                  </span>
                  <ul className="space-y-1.5">
                    {currentSection.keyDiscussionPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Target Outcome */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Goal / Decision for this section
                </span>
                <p className="text-xs text-emerald-200 font-medium">
                  {currentSection.expectedOutcome}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Notes Scratchpad & Live Action Items */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-5 bg-slate-950/40">
            {/* Scribe / Live Notes */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Meeting Notes & Minutes</span>
                </span>
                <span className="text-[10px] text-slate-500">Auto-saved</span>
              </div>
              <textarea
                value={liveNotes}
                onChange={(e) => setLiveNotes(e.target.value)}
                placeholder="Type key consensus notes, arguments, votes, or decisions captured live during the meeting..."
                className="w-full flex-1 min-h-[160px] p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
              />
            </div>

            {/* Action Items Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Deliverables & Action Items
                </span>
                <span className="text-[10px] text-slate-500">
                  {agenda.actionItems.filter((a) => a.completed).length}/{agenda.actionItems.length} checked
                </span>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {agenda.actionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleActionItem(item.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2.5 cursor-pointer transition-colors ${
                      item.completed
                        ? 'bg-slate-900/50 border-slate-800 text-slate-500 line-through'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-600'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{item.task}</p>
                      <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                        <span>@{item.owner}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{item.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom step progress bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-3xl">
            {agenda.sections.map((sec, idx) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setCurrentSectionIndex(idx)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  idx === currentSectionIndex
                    ? 'bg-indigo-600 text-white'
                    : idx < currentSectionIndex
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {idx + 1}. {sec.title.slice(0, 18)}...
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-indigo-400 shrink-0 ml-4">
            Total: {agenda.totalDurationMinutes}m
          </div>
        </div>
      </div>
    </div>
  );
};
