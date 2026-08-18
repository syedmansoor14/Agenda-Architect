import React, { useState } from 'react';
import { X, Copy, Check, Download, Mail, Calendar, FileText, Printer } from 'lucide-react';
import { MeetingAgenda } from '../types';
import { generateMarkdownAgenda, generateEmailDraft, downloadCalendarICS } from '../utils/timeUtils';

interface ExportModalProps {
  agenda: MeetingAgenda;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ agenda, onClose }) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'email' | 'plain'>('markdown');
  const [copied, setCopied] = useState(false);

  const markdownText = generateMarkdownAgenda(agenda);
  const emailText = generateEmailDraft(agenda);

  const currentText =
    activeTab === 'markdown'
      ? markdownText
      : activeTab === 'email'
      ? emailText
      : markdownText.replace(/[#*`_~[\]]/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agenda.title.toLowerCase().replace(/\s+/g, '_')}_agenda.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Export & Share Agenda
              </h3>
              <p className="text-xs text-slate-500">
                Distribute to attendees or import into calendars & notes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action quick buttons bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 items-center justify-between">
          {/* Format tabs */}
          <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'markdown'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'email'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Invites</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('plain')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'plain'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Plain Text</span>
            </button>
          </div>

          {/* Quick file exports */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => downloadCalendarICS(agenda)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Download .ics Calendar Event"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Calendar (.ics)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save .md</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Preview Code View */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="relative">
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-3 right-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <pre className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 overflow-x-auto max-h-[48vh]">
              {currentText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
