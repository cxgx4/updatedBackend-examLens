import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { NavTab } from './Navbar';

interface GuidedDemoOverlayProps {
  isActive: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
}

export const GuidedDemoOverlay: React.FC<GuidedDemoOverlayProps> = ({
  isActive,
  onClose,
  onNavigateTab,
  onOpenUpload,
  onOpenExport,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: 'STEP 1: BOARD TO NOTE ENGINE',
      tab: 'notes' as NavTab,
      summary: 'Upload 3 board photos -> perspective warp & homography -> glare/shadow removal -> region segmentation -> word-level OCR confidence & KaTeX equations.',
      actionLabel: 'Inspect OCR & Equation Diff',
      action: () => onNavigateTab('notes'),
    },
    {
      title: 'STEP 2: PAST PAPERS & RECURRENCE PATTERNS',
      tab: 'insights' as NavTab,
      summary: 'Exam Engine extracts questions, marks, and repeat counts ("asked 4x"). The Recurrence Heatmap exposes historical patterns across 5 exam years.',
      actionLabel: 'View Recurrence Heatmap',
      action: () => onNavigateTab('insights'),
    },
    {
      title: 'STEP 3: SHARED TOPIC GRAPH & COVERAGE GAPS',
      tab: 'graph' as NavTab,
      summary: 'Shared Topic Graph links notes & questions. It flags high-frequency topics that have NO lecture notes (e.g. Unit 4 Indexing & B-Trees, 28 historical marks).',
      actionLabel: 'Explore Interactive Graph',
      action: () => onNavigateTab('graph'),
    },
    {
      title: 'STEP 4: PRIORITIZED STUDY PLANNER',
      tab: 'planner' as NavTab,
      summary: 'Set days left (72H) and hours/day -> Ranks topics by Marks/Hour of effort and automatically inserts critical coverage gap study tasks.',
      actionLabel: 'Review Day-by-Day Plan',
      action: () => onNavigateTab('planner'),
    },
    {
      title: 'STEP 5: TIMED MOCK EXAM & 3D FLASHCARDS',
      tab: 'mock' as NavTab,
      summary: 'Real exam-simulation with 90-min countdown timer, answer-length recommendations (2/5/10 marks), sample answers, and Anki CSV spaced repetition cards.',
      actionLabel: 'Launch Mock Exam',
      action: () => onNavigateTab('mock'),
    },
  ];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      demoSteps[nextStep].action();
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isActive) return null;

  const activeStepData = demoSteps[currentStep];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-[#0D1117] border-2 border-[#FF3B30] p-5 shadow-2xl relative overflow-hidden"
      >
        {/* Glowing laser top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF3B30] via-amber-400 to-[#FF3B30] animate-pulse"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping"></span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF3B30] font-bold flex items-center gap-1">
              <Sparkles size={12} />
              5-MINUTE LIVE STORY DEMO ({currentStep + 1}/{demoSteps.length})
            </span>
          </div>
          <button onClick={handleSkip} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <h3 className="font-display text-xl tracking-wide text-white mb-1.5">
          {activeStepData.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
          {activeStepData.summary}
        </p>

        {/* Progress pills */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {demoSteps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all ${
                i <= currentStep ? 'bg-[#FF3B30]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1F2937]">
          <button
            onClick={handleSkip}
            className="text-[11px] font-mono text-slate-400 hover:text-white"
          >
            Exit Guided Tour
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF3B30] hover:bg-[#E02D23] text-white text-xs font-mono font-bold tracking-wider shadow-laser transition-all"
          >
            <span>{currentStep === demoSteps.length - 1 ? 'FINISH' : 'NEXT STEP'}</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
