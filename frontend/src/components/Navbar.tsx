import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, FileText, BarChart3, Share2, Calendar, 
  HelpCircle, CreditCard, UploadCloud, Download, Play, 
  Command, Terminal
} from 'lucide-react';

export type NavTab = 'board' | 'notes' | 'insights' | 'graph' | 'planner' | 'mock' | 'cards';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onStartDemo: () => void;
  onOpenCommandPalette: () => void;
  isMockWorkspace: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  onOpenExport,
  onStartDemo,
  onOpenCommandPalette,
  isMockWorkspace
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'board', label: 'BOARD', icon: Layers },
    { id: 'notes', label: 'NOTES', icon: FileText },
    { id: 'insights', label: 'INSIGHTS', icon: BarChart3 },
    { id: 'graph', label: 'GRAPH', icon: Share2 },
    { id: 'planner', label: 'PLANNER', icon: Calendar },
    { id: 'mock', label: 'MOCK', icon: HelpCircle },
    { id: 'cards', label: 'CARDS', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090D]/90 backdrop-blur-md border-b border-[#1F2937]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => onSelectTab('board')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-6 h-6 bg-[#FF3B30] flex items-center justify-center font-mono font-bold text-black text-xs shadow-laser">
              E
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl tracking-wider text-white group-hover:text-[#FF3B30] transition-colors">
                EXAMLENS
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
                SYS_7B
              </span>
            </div>
          </div>

          {/* Sample Workspace Badge */}
          {isMockWorkspace && (
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-[#0D1117] border border-[#1F2937] text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>SAMPLE WORKSPACE</span>
            </div>
          )}
        </div>

        {/* Center: Navigation Tabs with Sliding Motion */}
        <nav className="hidden md:flex items-center h-full space-x-1 relative overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3.5 py-1.5 text-xs font-mono tracking-wider transition-colors flex items-center gap-1.5 z-10 ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-[#FF3B30]' : 'text-slate-500'} />
                <span>{tab.label}</span>

                {/* Animated Slider Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#161B22] border-b-2 border-[#FF3B30] -z-10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-[#0D1117] border border-[#1F2937] text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-xs font-mono"
            title="Open Command Palette (Ctrl+K)"
          >
            <Command size={12} />
            <span className="text-[10px] text-slate-500">K</span>
          </button>

          {/* Run Demo Button */}
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FF3B30]/20 to-[#FF3B30]/5 hover:from-[#FF3B30]/30 hover:to-[#FF3B30]/10 border border-[#FF3B30]/50 text-[#FF3B30] text-xs font-mono font-medium tracking-wider transition-all shadow-sm"
          >
            <Play size={12} className="fill-[#FF3B30]" />
            <span className="hidden sm:inline">RUN DEMO</span>
          </button>

          {/* Upload PDF */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF3B30] hover:bg-[#E02D23] text-white text-xs font-mono font-semibold tracking-wider transition-all shadow-laser"
          >
            <UploadCloud size={13} />
            <span>UPLOAD PDF</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1117] hover:bg-[#161B22] border border-[#1F2937] text-slate-300 hover:text-white text-xs font-mono tracking-wider transition-colors"
          >
            <Download size={13} />
            <span className="hidden sm:inline">EXPORT</span>
          </button>
        </div>

      </div>

      {/* Mobile Subnav Strip */}
      <div className="flex md:hidden border-t border-[#1F2937] px-2 py-1 overflow-x-auto no-scrollbar gap-1 bg-[#090D13]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-mono whitespace-nowrap flex items-center gap-1 ${
                isActive ? 'text-[#FF3B30] bg-[#161B22]' : 'text-slate-400'
              }`}
            >
              <Icon size={11} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
