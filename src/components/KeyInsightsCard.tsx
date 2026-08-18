import React from 'react';
import { BookOpen, AlertTriangle, HelpCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface KeyInsightsCardProps {
  preReadHighlights?: string[];
  keyRisksOrBlockers?: string[];
  closingQuestionOrPrompt?: string;
}

export const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({
  preReadHighlights = [],
  keyRisksOrBlockers = [],
  closingQuestionOrPrompt,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pre-Read Card */}
      {preReadHighlights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Required Pre-Read & Context
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    preReadHighlights.map((p) => `• ${p}`).join('\n'),
                    'preread'
                  )
                }
                className="text-slate-400 hover:text-slate-700 text-xs p-1 cursor-pointer flex items-center space-x-1"
                title="Copy pre-read items"
              >
                {copiedSection === 'preread' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <ul className="space-y-2">
              {preReadHighlights.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Risks & Blockers Card */}
      {keyRisksOrBlockers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Key Risks & Open Debates
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    keyRisksOrBlockers.map((r) => `• ${r}`).join('\n'),
                    'risks'
                  )
                }
                className="text-slate-400 hover:text-slate-700 text-xs p-1 cursor-pointer flex items-center space-x-1"
                title="Copy risks"
              >
                {copiedSection === 'risks' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <ul className="space-y-2">
              {keyRisksOrBlockers.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Closing Prompt */}
      {closingQuestionOrPrompt && (
        <div className="lg:col-span-2 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block mb-1">
              Alignment Question / Facilitator Closing Prompt
            </span>
            <p className="text-xs sm:text-sm font-medium text-indigo-950 italic leading-relaxed">
              "{closingQuestionOrPrompt}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
