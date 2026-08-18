import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode, FileText, CheckCircle2, AlertCircle, Sparkles, X, Edit3 } from 'lucide-react';
import { UploadedDocument } from '../types';
import { parseDocumentFile } from '../utils/docxParser';

interface DocUploaderProps {
  document: UploadedDocument | null;
  onDocumentLoaded: (doc: UploadedDocument) => void;
  onClearDocument: () => void;
  onOpenSamples: () => void;
  isProcessing: boolean;
}

export const DocUploader: React.FC<DocUploaderProps> = ({
  document,
  onDocumentLoaded,
  onClearDocument,
  onOpenSamples,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [pasteDocName, setPasteDocName] = useState('Meeting Notes & Discussion Prep');
  const [dragOver, setDragOver] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = async (file: File) => {
    setParsingError(null);
    setIsExtracting(true);
    try {
      const { content, type } = await parseDocumentFile(file);
      if (!content || content.trim().length === 0) {
        throw new Error('No readable text could be extracted from this file. Please check that the file is not empty or password protected.');
      }
      const words = content.trim().split(/\s+/).filter(Boolean).length;
      onDocumentLoaded({
        name: file.name,
        type: type,
        sizeFormatted: formatFileSize(file.size),
        rawContent: content,
        charCount: content.length,
        wordCount: words,
      });
    } catch (err: any) {
      console.error('File parsing error:', err);
      setParsingError(err.message || 'Failed to read document file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    const words = pastedText.trim().split(/\s+/).filter(Boolean).length;
    onDocumentLoaded({
      name: pasteDocName.trim() || 'Custom Pasted Document',
      type: 'text',
      sizeFormatted: `${(pastedText.length / 1024).toFixed(1)} KB`,
      rawContent: pastedText,
      charCount: pastedText.length,
      wordCount: words,
    });
  };

  if (document) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0">
              {document.type === 'docx' ? (
                <FileText className="w-6 h-6" />
              ) : document.type === 'markdown' ? (
                <FileCode className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-900 truncate max-w-md">
                  {document.name}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {document.type}
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                <span>{document.wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>{document.charCount.toLocaleString()} characters</span>
                <span>•</span>
                <span>{document.sizeFormatted}</span>
              </div>
            </div>
          </div>

          <button
            id="btn-remove-document"
            onClick={onClearDocument}
            disabled={isProcessing}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Remove document and pick another"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document preview snippet */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Source Document Excerpt
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> Ready for AI Agenda Crafting
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 font-mono leading-relaxed max-h-36 overflow-y-auto border border-slate-200/60 whitespace-pre-wrap selection:bg-indigo-100">
            {document.rawContent.slice(0, 700)}
            {document.rawContent.length > 700 && '... [truncated for preview]'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
        <div className="flex space-x-2">
          <button
            id="tab-upload-doc"
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upload File (.docx / .md / .txt)
          </button>
          <button
            id="tab-paste-doc"
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Paste Text or Notes
          </button>
        </div>

        <button
          id="btn-quick-sample"
          type="button"
          onClick={onOpenSamples}
          className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample Doc</span>
        </button>
      </div>

      {parsingError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{parsingError}</span>
        </div>
      )}

      {activeTab === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60'
          }`}
        >
          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.md,.markdown,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3.5 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            {isExtracting ? 'Extracting document text...' : 'Upload Word doc (.docx), Markdown (.md), or Notes'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
            Drag & drop your meeting prep dossier, project RFC, strategy document, or PRD here
          </p>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-200/50">
            <span>Browse Files</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document / Project Title
            </label>
            <input
              id="input-paste-title"
              type="text"
              value={pasteDocName}
              onChange={(e) => setPasteDocName(e.target.value)}
              placeholder="e.g. Q3 Roadmap Review & Tech Debt Migration"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste Content (Markdown, RFC notes, or Meeting Dossier)
            </label>
            <textarea
              id="input-paste-content"
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw markdown, bulleted meeting briefing, project spec, or discussion notes here..."
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white leading-relaxed resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              id="btn-use-pasted-doc"
              type="button"
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Use This Content</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
