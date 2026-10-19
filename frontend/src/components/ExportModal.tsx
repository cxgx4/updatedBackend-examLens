import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Copy, X, Check, BookOpen, Layers } from 'lucide-react';
import { api } from '../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'pdf' | 'anki'>('markdown');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      loadPreview(selectedFormat);
    }
  }, [isOpen, selectedFormat]);

  const loadPreview = async (format: 'markdown' | 'pdf' | 'anki') => {
    const preview =
      format === 'markdown'
        ? `# ExamLens Master Study Notes\n\n## Normalization & BCNF\nFunctional dependencies and loss-less decomposition...\n\n$$ X \\rightarrow Y \\iff \\forall t_1, t_2 \\in r(R), [t_1[X] = t_2[X] \\implies t_1[Y] = t_2[Y]] $$`
        : format === 'anki'
        ? 'front,back,tags\nWhat is 1NF?,Atomic values only,dbms\nWhat is BCNF?,Every determinant is a candidate key,dbms'
        : 'PDF cheatsheet ready with formatted KaTeX formulas and board summaries...';
    setPreviewContent(preview);
  };

  const handleDownload = async () => {
    try {
      await api.exportContent(selectedFormat);
      setToastMessage(`Downloaded ${selectedFormat} export successfully!`);
    } catch (e: any) {
      setToastMessage(e.message || 'Export failed');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
    setIsCopied(true);
    setToastMessage('Copied to clipboard');
    setTimeout(() => {
      setIsCopied(false);
      setToastMessage(null);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/40 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full sm:max-w-2xl bg-bg rounded-t-[32px] sm:rounded-card-lg border border-border shadow-warm-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">Export Study Pack</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Take your lecture notes, cheat sheets, or flashcards into your favorite apps.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close export dialog"
            className="w-9 h-9 flex items-center justify-center rounded-pill bg-grey-card hover:bg-border/60 text-ink-soft transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Format Selector Cards */}
        <div className="p-6 border-b border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-grey-card/30">
          {[
            {
              id: 'markdown',
              label: 'Markdown (.md)',
              desc: 'Notes with LaTeX formulas for Notion or Obsidian',
              icon: FileText,
            },
            {
              id: 'pdf',
              label: 'Printable PDF',
              desc: 'Cheatsheet with formulas and board summaries',
              icon: BookOpen,
            },
            {
              id: 'anki',
              label: 'Anki Deck (.csv)',
              desc: 'Spaced repetition flashcards with exam questions',
              icon: Layers,
            },
          ].map((item) => {
            const isSelected = selectedFormat === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedFormat(item.id as any)}
                className={`p-4 text-left rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-peach/40 shadow-xs'
                    : 'border-border bg-bg hover:bg-grey-card/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  {isSelected && <Check size={14} className="text-primary" />}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-ink">{item.label}</div>
                  <div className="text-[11px] text-ink-soft mt-1 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Preview */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
            <span>Preview ({selectedFormat})</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-grey-card hover:bg-border/60 text-ink rounded-pill border border-border/80 transition-colors"
            >
              {isCopied ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex-1 min-h-[140px] max-h-56 bg-grey-card rounded-2xl border border-border/80 p-4 font-mono text-xs text-ink-soft overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
            {previewContent}
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-status-success-bg border-t border-status-success/30 text-status-success text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-grey-card border-t border-border flex items-center justify-between">
          <span className="text-xs text-ink-soft hidden sm:inline">
            Saved from your verified study hub
          </span>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-pill shadow-warm transition-transform active:scale-95"
            >
              <Download size={15} />
              <span>Download study pack</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
