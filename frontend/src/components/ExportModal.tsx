import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Copy, X, Terminal } from 'lucide-react';
import { api } from '../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'pdf' | 'anki'>('markdown');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      loadPreview(selectedFormat);
    }
  }, [isOpen, selectedFormat]);

  const loadPreview = async (format: 'markdown' | 'pdf' | 'anki') => {
    // Generate simple preview text
    const preview = format === 'markdown' 
      ? '# EXAMLENS MASTER NOTES\n\n## Topic 1\nNotes go here...'
      : format === 'anki'
      ? 'front,back,tags\nWhat is 1NF?,Atomic values,dbms'
      : 'PDF generation ready...';
    setPreviewContent(preview);
  };

  const handleDownload = async () => {
    try {
      await api.exportContent(selectedFormat);
      setToastMessage(`Downloaded successfully`);
    } catch (e: any) {
      setToastMessage(e.message || 'Export failed');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
    setToastMessage('Copied to clipboard!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-3xl bg-[#0D1117] border border-[#1F2937] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937] bg-[#121720]">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[#FF3B30]" />
            <h2 className="font-display text-2xl tracking-wide text-white">EXPORT KNOWLEDGE ARTIFACTS</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Format Selector */}
        <div className="grid grid-cols-3 gap-3 p-6 border-b border-[#1F2937] bg-[#090D13]">
          {[
            { id: 'markdown', label: 'MARKDOWN (.MD)', desc: 'Full notes with LaTeX math equations for Obsidian / Notion' },
            { id: 'pdf', label: 'PRINTABLE PDF', desc: 'Formatted study cheatsheet with diagram figures & tables' },
            { id: 'anki', label: 'ANKI DECK (.CSV)', desc: 'Spaced repetition flashcards with linked exam questions' },
          ].map((item) => {
            const isSelected = selectedFormat === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedFormat(item.id as any)}
                className={`p-3.5 text-left border transition-all ${
                  isSelected 
                    ? 'border-[#FF3B30] bg-[#FF3B30]/10 shadow-laser' 
                    : 'border-[#1F2937] bg-[#0D1117] hover:border-slate-600'
                }`}
              >
                <div className={`font-mono text-xs font-bold ${isSelected ? 'text-[#FF3B30]' : 'text-white'}`}>
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Preview Box */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col bg-[#07090D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={12} className="text-[#FF3B30]" />
              Artifact Live Preview ({selectedFormat})
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-0.5 border border-[#1F2937] hover:border-slate-600 transition-colors"
            >
              <Copy size={11} />
              <span>Copy</span>
            </button>
          </div>
          <div className="flex-1 bg-[#040608] border border-[#1F2937] p-4 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
            {previewContent || 'Generating export payload...'}
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="px-6 py-2 bg-emerald-950/80 border-t border-emerald-600/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#121720] border-t border-[#1F2937] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            Export generated from active ExamLens knowledge base
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 bg-[#FF3B30] hover:bg-[#E02D23] text-white text-xs font-mono font-bold tracking-wider transition-colors shadow-laser"
            >
              <Download size={14} />
              <span>DOWNLOAD FILE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
