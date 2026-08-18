import React from 'react';
import { Calendar, Play, Download, Sparkles, FileText, RefreshCw } from 'lucide-react';

interface NavbarProps {
  hasAgenda: boolean;
  isGenerating: boolean;
  onOpenSamples: () => void;
  onNewDoc: () => void;
  onOpenExport: () => void;
  onStartLiveMeeting: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasAgenda,
  isGenerating,
  onOpenSamples,
  onNewDoc,
  onOpenExport,
  onStartLiveMeeting,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-900/10">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Meeting Agenda Crafter
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              Turn .docx, .md & notes into timed, actionable meeting blueprints
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            id="btn-sample-docs"
            onClick={onOpenSamples}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Try Sample Doc</span>
            <span className="sm:hidden">Samples</span>
          </button>

          {hasAgenda && (
            <>
              <button
                id="btn-new-document"
                onClick={onNewDoc}
                type="button"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">New Doc</span>
              </button>

              <button
                id="btn-export-agenda"
                onClick={onOpenExport}
                type="button"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export & Share</span>
              </button>

              <button
                id="btn-start-live-runner"
                onClick={onStartLiveMeeting}
                type="button"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Live Meeting</span>
              </button>
            </>
          )}

          {isGenerating && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Synthesizing...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
