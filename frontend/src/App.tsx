import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, NavTab } from './components/Navbar';
import { MarqueeTicker } from './components/MarqueeTicker';
import { CustomCursor } from './components/CustomCursor';
import { CommandPalette } from './components/CommandPalette';
import { ExportModal } from './components/ExportModal';
import { UploadModal } from './components/UploadModal';
import { GuidedDemoOverlay } from './components/GuidedDemoOverlay';

import { BoardPage } from './pages/BoardPage';
import { NotesPage } from './pages/NotesPage';
import { InsightsPage } from './pages/InsightsPage';
import { GraphPage } from './pages/GraphPage';
import { PlannerPage } from './pages/PlannerPage';
import { MockPage } from './pages/MockPage';
import { CardsPage } from './pages/CardsPage';

import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('board');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Global keydown listeners for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K opens Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartDemo = () => {
    setIsDemoActive(true);
    setCurrentTab('notes');
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-[#E2E8F0] flex flex-col relative selection:bg-[#FF3B30] selection:text-white">
      
      {/* Background Film Grain Overlay */}
      <div className="fixed inset-0 bg-grain pointer-events-none z-30" />

      {/* Blueprint Grid Lines Overlay */}
      <div className="fixed inset-0 bg-grid-lines pointer-events-none opacity-40 z-0" />

      {/* Custom Tactical Cursor */}
      <CustomCursor />

      {/* Sticky Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onStartDemo={handleStartDemo}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isMockWorkspace={api.getIsMock()}
      />

      {/* Red Marquee Ticker */}
      <MarqueeTicker />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {currentTab === 'board' && (
              <BoardPage
                onSelectTab={setCurrentTab}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenExport={() => setIsExportOpen(true)}
                onStartDemo={handleStartDemo}
              />
            )}
            {currentTab === 'notes' && <NotesPage />}
            {currentTab === 'insights' && (
              <InsightsPage onNavigateToPlanner={() => setCurrentTab('planner')} />
            )}
            {currentTab === 'graph' && <GraphPage />}
            {currentTab === 'planner' && <PlannerPage />}
            {currentTab === 'mock' && <MockPage />}
            {currentTab === 'cards' && <CardsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Tactical Engineering Footer */}
      <footer className="w-full border-t border-[#1F2937] bg-[#07090D] py-6 px-4 sm:px-6 z-10 text-xs font-mono text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg text-white tracking-wider">EXAMLENS</span>
            <span>•</span>
            <span>7TH SEMESTER STUDY-INTELLIGENCE CAPSTONE (6 CREDITS)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span>MEMBER 1: VISION</span>
            <span>MEMBER 2: OCR & MATH</span>
            <span>MEMBER 3: PARSER</span>
            <span>MEMBER 4: NLP & TOPICS</span>
            <span>MEMBER 5: ANALYTICS</span>
            <span>MEMBER 6: INTEGRATION</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">FASTAPI + SQLITE ARCHITECTURE</span>
          </div>
        </div>
      </footer>

      {/* Interactive Overlays & Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onProcessingComplete={() => {
          setIsUploadOpen(false);
          setCurrentTab('notes');
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onStartDemo={handleStartDemo}
      />

      <GuidedDemoOverlay
        isActive={isDemoActive}
        onClose={() => setIsDemoActive(false)}
        onNavigateTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

    </div>
  );
}

export default App;
