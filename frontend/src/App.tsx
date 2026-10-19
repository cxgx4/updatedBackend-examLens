import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, NavTab } from './components/Navbar';
import { Logo } from './components/Logo';
import { SegmentedControl } from './components/SegmentedControl';
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

import { Sparkles, CreditCard, Calendar, BarChart3 } from 'lucide-react';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('board');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMockWorkspace, setIsMockWorkspace] = useState<boolean>(api.getIsMock());

  // Subscribe to connection state
  useEffect(() => {
    const unsubscribe = api.onConnectionChange((isConnected) => {
      setIsMockWorkspace(!isConnected);
    });
    return unsubscribe;
  }, []);

  // Global keydown listeners for shortcuts (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartDemo = () => {
    setIsDemoActive(true);
    setCurrentTab('notes');
  };

  const isPracticeActive = currentTab === 'cards' || currentTab === 'mock';
  const isPlanActive = currentTab === 'planner' || currentTab === 'insights';

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col relative selection:bg-primary-tint selection:text-primary-text font-sans">
      
      {/* Sticky Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onStartDemo={handleStartDemo}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isMockWorkspace={isMockWorkspace}
      />

      {/* Main Content Container (1200px max, student-friendly 8pt spacing) */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-28 md:pb-16 z-10">
        
        {/* Practice Group Container (Cards | Mock Questions) */}
        {isPracticeActive && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Practice</h1>
              <p className="text-ink-soft text-sm sm:text-base mt-0.5">
                Test your understanding with active recall and practice questions.
              </p>
            </div>
            <SegmentedControl
              value={currentTab === 'mock' ? 'mock' : 'cards'}
              onChange={(val) => setCurrentTab(val)}
              options={[
                { id: 'cards', label: 'Flashcards', icon: CreditCard },
                { id: 'mock', label: 'Practice questions', icon: Sparkles },
              ]}
            />
          </div>
        )}

        {/* Plan Group Container (Study Plan | Progress & Insights) */}
        {isPlanActive && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Study Plan</h1>
              <p className="text-ink-soft text-sm sm:text-base mt-0.5">
                Organize your study days and monitor your syllabus coverage.
              </p>
            </div>
            <SegmentedControl
              value={currentTab === 'insights' ? 'insights' : 'planner'}
              onChange={(val) => setCurrentTab(val)}
              options={[
                { id: 'planner', label: 'Study plan', icon: Calendar },
                { id: 'insights', label: 'Progress & insights', icon: BarChart3 },
              ]}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
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

      {/* Warm Student-First Footer */}
      <footer className="w-full border-t border-border bg-bg-cream/60 py-6 px-4 sm:px-6 mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-ink-soft">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="text-ink-faint">•</span>
            <span className="font-medium text-ink">Made for students</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-primary transition-colors font-medium"
            >
              Export
            </button>
            <button
              onClick={handleStartDemo}
              className="hover:text-primary transition-colors font-medium"
            >
              Take a tour
            </button>
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
