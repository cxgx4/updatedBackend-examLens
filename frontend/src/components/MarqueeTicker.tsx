import React from 'react';
import { AlertTriangle, Clock, Zap, Target } from 'lucide-react';

export const MarqueeTicker: React.FC = () => {
  const tickerItems = [
    { icon: Clock, text: 'EXAM COUNTDOWN: 72H 14M REMAINING', highlight: true },
    { icon: Zap, text: '6 CORE TOPICS INDEXED • 8 PAST PAPERS PARSED', highlight: false },
    { icon: Target, text: 'TOP RECURRENCE: NORMALIZATION ASKED 4X IN 5 YEARS', highlight: true },
    { icon: AlertTriangle, text: 'CRITICAL GAP: UNIT 4 INDEXING & B-TREES (28 HISTORICAL MARKS) HAS NO NOTES', highlight: true },
    { icon: Zap, text: 'OCR CONFIDENCE: 94.2% • KATEX EQUATIONS READY', highlight: false },
    { icon: Target, text: 'STUDY PRIORITY #1: DBMS-05 TRANSACTIONS (9.50 MARKS/HR)', highlight: false },
  ];

  return (
    <div className="w-full bg-[#0D1117] border-y border-[#1F2937] py-1.5 overflow-hidden relative select-none">
      <div className="flex items-center whitespace-nowrap animate-marquee">
        {[...tickerItems, ...tickerItems].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center mx-6 text-[11px] font-mono tracking-wider">
              <Icon 
                size={12} 
                className={`mr-2 ${item.highlight ? 'text-[#FF3B30] animate-pulse' : 'text-[#A3E635]'}`} 
              />
              <span className={item.highlight ? 'text-white font-semibold' : 'text-slate-400'}>
                {item.text}
              </span>
              <span className="mx-4 text-slate-700">/</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
