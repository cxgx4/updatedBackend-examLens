import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Network, 
  Upload, 
  Download, 
  Compass, 
  Sun, 
  Moon, 
  Command, 
  MoreHorizontal,
  X,
  Info
} from 'lucide-react';
import { Logo } from './Logo';

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

interface NavGroupItem {
  id: 'home' | 'notes' | 'practice' | 'plan' | 'map';
  label: string;
  icon: React.ElementType;
  targetTab: NavTab;
  isActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  onOpenExport,
  onStartDemo,
  onOpenCommandPalette,
  isMockWorkspace,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('examlens-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('examlens-theme', 'light');
    }
  };

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 5 Main IA Items
  const navItems: NavGroupItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      targetTab: 'board',
      isActive: currentTab === 'board',
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: BookOpen,
      targetTab: 'notes',
      isActive: currentTab === 'notes',
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: Sparkles,
      targetTab: currentTab === 'mock' ? 'mock' : 'cards',
      isActive: currentTab === 'cards' || currentTab === 'mock',
    },
    {
      id: 'plan',
      label: 'Plan',
      icon: Calendar,
      targetTab: currentTab === 'insights' ? 'insights' : 'planner',
      isActive: currentTab === 'planner' || currentTab === 'insights',
    },
    {
      id: 'map',
      label: 'Topic map',
      icon: Network,
      targetTab: 'graph',
      isActive: currentTab === 'graph',
    },
  ];

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-bg/90 backdrop-blur-md border-b border-border/80 transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4 py-3">
          
          {/* Left: Brand Identity & Calm Status Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('board')}
              className="flex items-center gap-2 group text-left focus:outline-none rounded-xl"
              aria-label="ExamLens Home"
            >
              <Logo size="md" />
            </button>

            {isMockWorkspace && (
              <div 
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-peach/60 border border-peach text-primary-text rounded-pill text-xs font-medium cursor-help"
                title="Connect the backend server to use your own notes"
              >
                <Info size={13} className="text-primary" />
                <span>Sample data</span>
              </div>
            )}
          </div>

          {/* Center: Desktop 5-Item Navigation Pills */}
          <nav 
            className="hidden md:flex items-center p-1 bg-grey-card rounded-pill border border-border/70 shadow-sm"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.targetTab)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium transition-all ${
                    item.isActive 
                      ? 'text-primary-text font-bold' 
                      : 'text-ink-soft hover:text-ink'
                  }`}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {item.isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-primary-tint rounded-pill shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon size={16} className={item.isActive ? 'text-primary' : 'text-ink-faint'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Upload Primary Pill & Overflow Menu */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Shortcut */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-xs text-ink-soft bg-grey-card hover:bg-border/40 border border-border/80 rounded-pill transition-colors"
              aria-label="Search and command palette"
              title="Search and shortcuts (Ctrl+K)"
            >
              <Command size={13} className="text-ink-faint" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 bg-bg border border-border rounded text-[10px] text-ink-faint font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Primary Action Button: Upload */}
            <button
              onClick={onOpenUpload}
              className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm rounded-pill shadow-warm transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-primary-text"
            >
              <Upload size={16} strokeWidth={2.5} />
              <span>Upload notes</span>
            </button>

            {/* Overflow Menu Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center bg-grey-card hover:bg-border/50 text-ink rounded-pill border border-border/80 transition-colors"
                aria-label="More options"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={18} /> : <MoreHorizontal size={18} />}
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 p-2 bg-bg rounded-card border border-border shadow-warm-lg z-50 flex flex-col gap-1 text-sm"
                  >
                    {/* Upload button for mobile within menu */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenUpload();
                      }}
                      className="sm:hidden flex items-center gap-2.5 px-3 py-2.5 text-primary-text font-semibold hover:bg-primary-tint rounded-xl transition-colors text-left"
                    >
                      <Upload size={16} className="text-primary" />
                      <span>Upload notes</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onStartDemo();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-ink hover:bg-grey-card rounded-xl transition-colors text-left font-medium"
                    >
                      <Compass size={16} className="text-primary" />
                      <span>Take a quick tour</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenExport();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-ink hover:bg-grey-card rounded-xl transition-colors text-left font-medium"
                    >
                      <Download size={16} className="text-ink-soft" />
                      <span>Export study pack</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenCommandPalette();
                      }}
                      className="flex items-center justify-between px-3 py-2.5 text-ink hover:bg-grey-card rounded-xl transition-colors text-left font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <Command size={16} className="text-ink-soft" />
                        <span>Shortcuts</span>
                      </div>
                      <kbd className="text-[10px] px-1.5 py-0.5 bg-grey-card border border-border rounded font-mono text-ink-faint">
                        ⌘K
                      </kbd>
                    </button>

                    <div className="my-1 border-t border-border/60" />

                    {/* Theme Toggle in Menu */}
                    <div className="flex items-center justify-between px-3 py-2 text-ink-soft">
                      <span className="font-medium text-xs">Appearance</span>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-grey-card border border-border/80 rounded-pill text-xs font-semibold text-ink hover:text-primary transition-colors"
                      >
                        {theme === 'light' ? (
                          <>
                            <Sun size={13} className="text-primary" />
                            <span>Light</span>
                          </>
                        ) : (
                          <>
                            <Moon size={13} className="text-accent" />
                            <span>Dark</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isMockWorkspace && (
                      <div className="sm:hidden px-3 py-2 text-[11px] text-ink-faint border-t border-border/60">
                        Using sample data (offline)
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Tab Bar (5 Tabs) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-lg border-t border-border md:hidden px-2 py-2 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.targetTab)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[48px] rounded-2xl transition-colors ${
                item.isActive 
                  ? 'text-primary font-bold' 
                  : 'text-ink-soft hover:text-ink'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <div className={`p-1 rounded-pill ${item.isActive ? 'bg-primary-tint' : ''}`}>
                <Icon size={18} className={item.isActive ? 'text-primary' : 'text-ink-soft'} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Floating Action Button (FAB) for Upload */}
      <button
        onClick={onOpenUpload}
        aria-label="Upload notes or question paper"
        className="fixed bottom-20 right-4 z-40 md:hidden flex items-center gap-2 px-5 py-3.5 bg-primary text-on-primary font-bold rounded-pill shadow-warm-lg active:scale-95 transition-transform"
      >
        <Upload size={18} strokeWidth={2.5} />
        <span className="text-sm">Upload</span>
      </button>
    </>
  );
};
