import React from 'react';
import { X, Sparkles, FileText, ArrowRight, Clock, Target } from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDoc } from '../utils/sampleDocs';
import { UploadedDocument, MeetingConfig } from '../types';

interface SampleDocsModalProps {
  onClose: () => void;
  onSelectSample: (doc: UploadedDocument, configSuggestion: Partial<MeetingConfig>) => void;
}

export const SampleDocsModal: React.FC<SampleDocsModalProps> = ({
  onClose,
  onSelectSample,
}) => {
  const handlePick = (sample: SampleDoc) => {
    const words = sample.content.trim().split(/\s+/).filter(Boolean).length;
    const doc: UploadedDocument = {
      name: sample.title,
      type: 'sample',
      sizeFormatted: `${(sample.content.length / 1024).toFixed(1)} KB`,
      rawContent: sample.content,
      charCount: sample.content.length,
      wordCount: words,
    };
    onSelectSample(doc, {
      totalDurationMinutes: sample.meetingSuggestion.duration,
      meetingType: sample.meetingSuggestion.type,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Choose a Sample Document
              </h3>
              <p className="text-xs text-slate-500">
                Test the agenda synthesizer with realistic enterprise documents
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

        {/* Content */}
        <div className="p-6 space-y-3.5 overflow-y-auto">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handlePick(sample)}
              className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-700 flex items-center justify-center shrink-0 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {sample.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-indigo-900 transition-colors">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {sample.description}
                    </p>

                    <div className="flex items-center space-x-3 mt-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Suggested: {sample.meetingSuggestion.duration} mins</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Target className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sample.meetingSuggestion.type}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
