import React from 'react';
import { CriticalThinkingStage } from '../types';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

interface StageNavigationProps {
  currentStage: CriticalThinkingStage;
}

const stages = [
  { id: CriticalThinkingStage.DEFINE, label: "1. Define" },
  { id: CriticalThinkingStage.GATHER, label: "2. Gather" },
  { id: CriticalThinkingStage.ANALYZE, label: "3. Analyze" },
  { id: CriticalThinkingStage.DECIDE, label: "4. Decide" },
  { id: CriticalThinkingStage.COMMUNICATE, label: "5. Communicate" },
];

export const StageNavigation: React.FC<StageNavigationProps> = ({ currentStage }) => {
  if (currentStage === CriticalThinkingStage.UPLOAD || currentStage === CriticalThinkingStage.SUMMARY) {
    return null;
  }

  return (
    <div className="w-full bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const isActive = currentStage === stage.id;
            const isCompleted = currentStage > stage.id;

            return (
              <div key={stage.id} className="flex items-center flex-1">
                <div className={`flex items-center ${index !== stages.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`flex items-center space-x-2 ${isActive ? 'text-blue-600 font-bold' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isActive ? (
                      <div className="relative flex items-center justify-center">
                        <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <Circle className="w-6 h-6 relative bg-white rounded-full" />
                      </div>
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                    <span className="text-sm hidden sm:block whitespace-nowrap">{stage.label}</span>
                  </div>
                  
                  {index !== stages.length - 1 && (
                    <div className="flex-1 mx-4 h-0.5 bg-slate-200">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500" 
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};