import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Sparkles, Compass, Check } from 'lucide-react';
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
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: 'Lecture Notes & Equations',
      tab: 'notes' as NavTab,
      summary:
        'Upload your blackboard photos. We straighten the perspective, remove glare, and extract readable text and math formulas.',
      action: () => onNavigateTab('notes'),
    },
    {
      title: 'Recurrence Heatmap',
      tab: 'insights' as NavTab,
      summary:
        'Discover which syllabus topics appear most often in past exams and see your historical question streaks.',
      action: () => onNavigateTab('insights'),
    },
    {
      title: 'Topic Map & Coverage Gaps',
      tab: 'graph' as NavTab,
      summary:
        'Explore connections between curriculum prerequisites and spot topics tested in past papers that still need notes.',
      action: () => onNavigateTab('graph'),
    },
    {
      title: 'Study Planner',
      tab: 'planner' as NavTab,
      summary:
        'Set your days left and daily study hours to get a prioritized revision schedule balanced for maximum exam marks.',
      action: () => onNavigateTab('planner'),
    },
    {
      title: 'Practice & Flashcards',
      tab: 'mock' as NavTab,
      summary:
        'Test your memory with active recall flashcards, timed practice papers, and model answer length guides.',
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
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        className="bg-bg rounded-card border border-border p-5 sm:p-6 shadow-warm-lg space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-text bg-peach/70 px-3 py-1 rounded-pill">
            <Compass size={13} className="text-primary" />
            <span>Tour Step {currentStep + 1} of {demoSteps.length}</span>
          </div>

          <button
            onClick={handleSkip}
            aria-label="Exit tour"
            className="w-7 h-7 rounded-pill bg-grey-card hover:bg-border/60 flex items-center justify-center text-ink-soft transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold text-ink">
            {activeStepData.title}
          </h3>
          <p className="text-xs text-ink-soft leading-relaxed mt-1.5">
            {activeStepData.summary}
          </p>
        </div>

        {/* Step progress dots */}
        <div className="flex items-center gap-1.5">
          {demoSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-pill transition-all ${
                i === currentStep
                  ? 'w-6 bg-primary'
                  : i < currentStep
                  ? 'w-2 bg-primary/40'
                  : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/70">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-ink-soft hover:text-ink transition-colors"
          >
            Skip tour
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-pill shadow-warm transition-transform active:scale-95"
          >
            <span>{currentStep === demoSteps.length - 1 ? 'Finish tour' : 'Next'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
