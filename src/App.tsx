import React, { useState } from 'react';
import { Sparkles, Plus, AlertCircle, RefreshCw, Clock, CheckCircle2, ChevronRight, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DocUploader } from './components/DocUploader';
import { MeetingConfigPanel } from './components/MeetingConfigPanel';
import { AgendaHeader } from './components/AgendaHeader';
import { TimelineVisualizer } from './components/TimelineVisualizer';
import { SectionCard } from './components/SectionCard';
import { StakeholdersList } from './components/StakeholdersList';
import { ActionItemsBoard } from './components/ActionItemsBoard';
import { KeyInsightsCard } from './components/KeyInsightsCard';
import { MeetingLiveRunner } from './components/MeetingLiveRunner';
import { ExportModal } from './components/ExportModal';
import { SampleDocsModal } from './components/SampleDocsModal';
import { MeetingAgenda, MeetingConfig, UploadedDocument, AgendaSection } from './types';
import { calculateTimeline } from './utils/timeUtils';

const DEFAULT_CONFIG: MeetingConfig = {
  totalDurationMinutes: 45,
  meetingType: 'Decision-Making',
  bufferMinutes: 5,
  detailLevel: 'balanced',
};

export default function App() {
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [config, setConfig] = useState<MeetingConfig>(DEFAULT_CONFIG);
  const [agenda, setAgenda] = useState<MeetingAgenda | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Live Mode
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLiveRunner, setShowLiveRunner] = useState(false);

  // Active section scroll state
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>();

  const handleGenerateAgenda = async () => {
    if (!document) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: document.rawContent,
          config: config,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to craft agenda from document.');
      }

      if (!data.agenda) {
        throw new Error('No agenda returned from AI model.');
      }

      setAgenda(data.agenda);
    } catch (err: any) {
      console.error('Error generating agenda:', err);
      setErrorMessage(err.message || 'An error occurred while synthesizing the meeting agenda.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRebalanceDuration = async (newTotalMinutes: number) => {
    if (!agenda) return;
    setIsRebalancing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/rebalance-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAgenda: agenda,
          newTotalMinutes: newTotalMinutes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Local fallback: proportional adjustment
        const currentSum = agenda.sections.reduce((a, b) => a + b.durationMinutes, 0) || 1;
        const ratio = newTotalMinutes / currentSum;
        let runningSum = 0;
        const revised = agenda.sections.map((sec, idx) => {
          if (idx === agenda.sections.length - 1) {
            return { ...sec, durationMinutes: Math.max(1, newTotalMinutes - runningSum) };
          }
          const scaled = Math.max(1, Math.round(sec.durationMinutes * ratio));
          runningSum += scaled;
          return { ...sec, durationMinutes: scaled };
        });

        setAgenda({
          ...agenda,
          totalDurationMinutes: newTotalMinutes,
          sections: revised,
        });
        setConfig((prev) => ({ ...prev, totalDurationMinutes: newTotalMinutes }));
      } else {
        setAgenda({
          ...agenda,
          totalDurationMinutes: newTotalMinutes,
          sections: data.sections,
        });
        setConfig((prev) => ({ ...prev, totalDurationMinutes: newTotalMinutes }));
      }
    } catch (err) {
      console.warn('AI rebalance failed, applying local proportional scaling:', err);
      // Fallback
      const currentSum = agenda.sections.reduce((a, b) => a + b.durationMinutes, 0) || 1;
      const ratio = newTotalMinutes / currentSum;
      let runningSum = 0;
      const revised = agenda.sections.map((sec, idx) => {
        if (idx === agenda.sections.length - 1) {
          return { ...sec, durationMinutes: Math.max(1, newTotalMinutes - runningSum) };
        }
        const scaled = Math.max(1, Math.round(sec.durationMinutes * ratio));
        runningSum += scaled;
        return { ...sec, durationMinutes: scaled };
      });

      setAgenda({
        ...agenda,
        totalDurationMinutes: newTotalMinutes,
        sections: revised,
      });
      setConfig((prev) => ({ ...prev, totalDurationMinutes: newTotalMinutes }));
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleUpdateDuration = (sectionId: string, newDuration: number) => {
    if (!agenda) return;
    const revisedSections = agenda.sections.map((s) =>
      s.id === sectionId ? { ...s, durationMinutes: Math.max(1, newDuration) } : s
    );
    const newTotal = revisedSections.reduce((a, b) => a + b.durationMinutes, 0);

    setAgenda({
      ...agenda,
      sections: revisedSections,
      totalDurationMinutes: newTotal,
    });
    setConfig((prev) => ({ ...prev, totalDurationMinutes: newTotal }));
  };

  const handleUpdateSection = (updated: AgendaSection) => {
    if (!agenda) return;
    setAgenda({
      ...agenda,
      sections: agenda.sections.map((s) => (s.id === updated.id ? updated : s)),
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!agenda) return;
    const remaining = agenda.sections.filter((s) => s.id !== sectionId);
    const newTotal = remaining.reduce((a, b) => a + b.durationMinutes, 0);
    setAgenda({
      ...agenda,
      sections: remaining,
      totalDurationMinutes: newTotal,
    });
  };

  const handleAddSection = () => {
    if (!agenda) return;
    const newSec: AgendaSection = {
      id: `sec-${Date.now()}`,
      title: 'New Discussion Topic',
      category: 'Discussion',
      durationMinutes: 10,
      summary: 'Executive overview and context for this discussion section.',
      keyDiscussionPoints: ['What are the main dependencies?', 'What timeline do we commit to?'],
      expectedOutcome: 'Team alignment and assigned next steps.',
    };
    const updated = [...agenda.sections, newSec];
    const newTotal = updated.reduce((a, b) => a + b.durationMinutes, 0);
    setAgenda({
      ...agenda,
      sections: updated,
      totalDurationMinutes: newTotal,
    });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!agenda) return;
    const sections = [...agenda.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const [moved] = sections.splice(index, 1);
    sections.splice(targetIdx, 0, moved);
    setAgenda({ ...agenda, sections });
  };

  const handleSelectSample = (doc: UploadedDocument, configSuggestion: Partial<MeetingConfig>) => {
    setDocument(doc);
    setConfig((prev) => ({ ...prev, ...configSuggestion }));
  };

  const handleNewDoc = () => {
    setDocument(null);
    setAgenda(null);
    setErrorMessage(null);
  };

  const timeline = agenda ? calculateTimeline(agenda.sections) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        hasAgenda={!!agenda}
        isGenerating={isGenerating}
        onOpenSamples={() => setShowSamplesModal(true)}
        onNewDoc={handleNewDoc}
        onOpenExport={() => setShowExportModal(true)}
        onStartLiveMeeting={() => setShowLiveRunner(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Could not generate agenda:</span>
              <p className="text-xs leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* View Mode 1: Document Upload & Config (shown when no agenda or user is modifying source) */}
        {!agenda ? (
          <div className="space-y-6">
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto py-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Transform any document into a timed, high-impact agenda
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Upload a Word document (.docx), Markdown spec (.md), or raw notes.
                Specify your meeting duration, and AI will synthesize executive topic summaries, key questions, action owners, and exact section time limits.
              </p>
            </div>

            {/* 2-Column Upload & Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Document Ingestion Left */}
              <div className="lg:col-span-6 space-y-4">
                <DocUploader
                  document={document}
                  onDocumentLoaded={(doc) => {
                    setDocument(doc);
                    setErrorMessage(null);
                  }}
                  onClearDocument={() => setDocument(null)}
                  onOpenSamples={() => setShowSamplesModal(true)}
                  isProcessing={isGenerating}
                />
              </div>

              {/* Timing & Meeting Parameters Right */}
              <div className="lg:col-span-6 space-y-4">
                <MeetingConfigPanel
                  config={config}
                  onChange={setConfig}
                  onGenerate={handleGenerateAgenda}
                  isGenerating={isGenerating}
                  canGenerate={!!document && !isGenerating}
                />
              </div>
            </div>
          </div>
        ) : (
          /* View Mode 2: Structured Agenda Dashboard */
          <div className="space-y-6">
            {/* Action Bar / Back button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAgenda(null)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Adjust Source Document & Parameters</span>
              </button>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-xs">{document?.name}</span>
              </div>
            </div>

            {/* Primary Agenda Header */}
            <AgendaHeader
              agenda={agenda}
              onUpdateAgenda={setAgenda}
              onRebalanceDuration={handleRebalanceDuration}
              isRebalancing={isRebalancing}
            />

            {/* Visual Timeline Bar */}
            <TimelineVisualizer
              sections={agenda.sections}
              totalMinutes={agenda.totalDurationMinutes}
              activeSectionId={activeSectionId}
              onSelectSection={(id) => {
                setActiveSectionId(id);
                const el = document.getElementById(`section-card-${id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />

            {/* Pre-read & Key Blockers Insight Cards */}
            <KeyInsightsCard
              preReadHighlights={agenda.preReadHighlights}
              keyRisksOrBlockers={agenda.keyRisksOrBlockers}
              closingQuestionOrPrompt={agenda.closingQuestionOrPrompt}
            />

            {/* Main Agenda Section Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Detailed Section Timetable ({agenda.sections.length} topics)
                </h3>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic Section</span>
                </button>
              </div>

              {timeline.map((sec, idx) => (
                <SectionCard
                  key={sec.id || idx}
                  section={sec}
                  index={idx}
                  timeRangeLabel={sec.timeLabel}
                  onUpdateDuration={handleUpdateDuration}
                  onUpdateSection={handleUpdateSection}
                  onDeleteSection={handleDeleteSection}
                  onMoveUp={idx > 0 ? () => handleMoveSection(idx, 'up') : undefined}
                  onMoveDown={
                    idx < agenda.sections.length - 1
                      ? () => handleMoveSection(idx, 'down')
                      : undefined
                  }
                />
              ))}
            </div>

            {/* 2-Column Split: Stakeholders & Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
              <div className="lg:col-span-6">
                <StakeholdersList
                  stakeholders={agenda.stakeholders}
                  onUpdateStakeholders={(updated) =>
                    setAgenda({ ...agenda, stakeholders: updated })
                  }
                />
              </div>

              <div className="lg:col-span-6">
                <ActionItemsBoard
                  actionItems={agenda.actionItems}
                  onUpdateActionItems={(updated) =>
                    setAgenda({ ...agenda, actionItems: updated })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showSamplesModal && (
        <SampleDocsModal
          onClose={() => setShowSamplesModal(false)}
          onSelectSample={handleSelectSample}
        />
      )}

      {showExportModal && agenda && (
        <ExportModal agenda={agenda} onClose={() => setShowExportModal(false)} />
      )}

      {showLiveRunner && agenda && (
        <MeetingLiveRunner
          agenda={agenda}
          onClose={() => setShowLiveRunner(false)}
          onUpdateActionItems={(updated) =>
            setAgenda({ ...agenda, actionItems: updated })
          }
        />
      )}
    </div>
  );
}
