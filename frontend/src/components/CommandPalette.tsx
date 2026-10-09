import React, { useState, useEffect } from 'react';
import { 
  Search, Layers, FileText, BarChart3, Share2, 
  Calendar, HelpCircle, CreditCard, UploadCloud, 
  Download, Play, ArrowRight, X 
} from 'lucide-react';
import { NavTab } from './Navbar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onStartDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenUpload,
  onOpenExport,
  onStartDemo,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'board', label: 'Go to Board Overview', category: 'Navigation', icon: Layers, action: () => { onSelectTab('board'); onClose(); } },
    { id: 'notes', label: 'Go to OCR & Structured Notes', category: 'Navigation', icon: FileText, action: () => { onSelectTab('notes'); onClose(); } },
    { id: 'insights', label: 'Go to Recurrence Heatmap & Gaps', category: 'Navigation', icon: BarChart3, action: () => { onSelectTab('insights'); onClose(); } },
    { id: 'graph', label: 'Go to Force-Directed Topic Graph', category: 'Navigation', icon: Share2, action: () => { onSelectTab('graph'); onClose(); } },
    { id: 'planner', label: 'Go to Prioritized Study Planner', category: 'Navigation', icon: Calendar, action: () => { onSelectTab('planner'); onClose(); } },
    { id: 'mock', label: 'Go to Timed Mock Exam Paper', category: 'Navigation', icon: HelpCircle, action: () => { onSelectTab('mock'); onClose(); } },
    { id: 'cards', label: 'Go to 3D Flashcards & Anki', category: 'Navigation', icon: CreditCard, action: () => { onSelectTab('cards'); onClose(); } },
    { id: 'upload', label: 'Upload Board Photos or Past Paper PDF', category: 'Actions', icon: UploadCloud, action: () => { onOpenUpload(); onClose(); } },
    { id: 'export', label: 'Export to Markdown, PDF, or Anki CSV', category: 'Actions', icon: Download, action: () => { onOpenExport(); onClose(); } },
    { id: 'demo', label: 'Start 5-Minute Live Pipeline Demo', category: 'Actions', icon: Play, action: () => { onStartDemo(); onClose(); } },
  ];

  const filtered = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase()) || 
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-[#0D1117] border border-[#1F2937] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#1F2937] bg-[#121720]">
          <Search size={16} className="text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command or jump to page... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#1A2230] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={14} className="text-slate-400 group-hover:text-[#FF3B30] transition-colors" />
                    <div>
                      <div className="text-xs font-mono text-slate-200 group-hover:text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-slate-600 group-hover:text-[#FF3B30] opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-[#080B10] border-t border-[#1F2937] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>NAVIGATION & ACTIONS</span>
          <span>PRESS ↵ TO EXECUTE</span>
        </div>
      </div>
    </div>
  );
};
