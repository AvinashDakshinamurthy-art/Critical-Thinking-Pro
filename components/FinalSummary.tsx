import React from 'react';
import { RefreshCcw, Award, FileText } from 'lucide-react';
import { StageInput } from '../types';

interface FinalSummaryProps {
  summary: string;
  inputs: StageInput;
  onReset: () => void;
}

export const FinalSummary: React.FC<FinalSummaryProps> = ({ summary, inputs, onReset }) => {
  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-20">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Session Complete</h2>
            <p className="text-slate-600 text-sm">Review your executive evaluation below.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <FileText className="w-5 h-5 text-blue-600" />
             AI Coach Evaluation
          </h3>
          <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
             {summary.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Gap Analysis</h4>
              <p className="text-sm text-slate-800 italic border-l-4 border-slate-200 pl-3">"{inputs.gapAnalysis}"</p>
           </div>
           
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Action Plan</h4>
              <p className="text-sm text-slate-800 italic border-l-4 border-slate-200 pl-3">"{inputs.actionPlan}"</p>
           </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Start New Scenario</span>
        </button>
      </div>
    </div>
  );
};