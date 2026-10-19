import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Home, 
  BookOpen, 
  BarChart3, 
  Network, 
  Calendar, 
  Sparkles, 
  CreditCard, 
  Upload, 
  Download, 
  Compass, 
  ArrowRight, 
  X 
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
        onClose();
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
    {
      id: 'board',
      label: 'Home & weak topic recommendations',
      category: 'Navigation',
      icon: Home,
      action: () => {
        onSelectTab('board');
        onClose();
      },
    },
    {
      id: 'notes',
      label: 'Lecture notes & equation transcripts',
      category: 'Navigation',
      icon: BookOpen,
      action: () => {
        onSelectTab('notes');
        onClose();
      },
    },
    {
      id: 'cards',
      label: 'Flashcards & active recall review',
      category: 'Navigation',
      icon: CreditCard,
      action: () => {
        onSelectTab('cards');
        onClose();
      },
    },
    {
      id: 'mock',
      label: 'Practice questions & 90-min timer',
      category: 'Navigation',
      icon: Sparkles,
      action: () => {
        onSelectTab('mock');
        onClose();
      },
    },
    {
      id: 'planner',
      label: 'Day-by-day study plan & schedule',
      category: 'Navigation',
      icon: Calendar,
      action: () => {
        onSelectTab('planner');
        onClose();
      },
    },
    {
      id: 'insights',
      label: 'Progress & 5-year exam heatmap',
      category: 'Navigation',
      icon: BarChart3,
      action: () => {
        onSelectTab('insights');
        onClose();
      },
    },
    {
      id: 'graph',
      label: 'Topic map & prerequisite links',
      category: 'Navigation',
      icon: Network,
      action: () => {
        onSelectTab('graph');
        onClose();
      },
    },
    {
      id: 'upload',
      label: 'Upload board photos or exam papers',
      category: 'Actions',
      icon: Upload,
      action: () => {
        onOpenUpload();
        onClose();
      },
    },
    {
      id: 'export',
      label: 'Export notes, cheat sheet, or Anki deck',
      category: 'Actions',
      icon: Download,
      action: () => {
        onOpenExport();
        onClose();
      },
    },
    {
      id: 'demo',
      label: 'Take a quick tour of ExamLens',
      category: 'Actions',
      icon: Compass,
      action: () => {
        onStartDemo();
        onClose();
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink/40 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-bg rounded-card-lg border border-border shadow-warm-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-bg-cream/40">
          <Search size={18} className="text-primary mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or jump to a page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="text-ink-faint hover:text-ink transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of actions */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-soft">
              No matching pages or actions found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left hover:bg-peach/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-peach/70 text-primary flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-ink group-hover:text-primary-text transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-ink-faint">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-grey-card border-t border-border flex items-center justify-between text-xs text-ink-soft">
          <span>Search & Shortcuts</span>
          <div className="flex items-center gap-2">
            <span>Press Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
