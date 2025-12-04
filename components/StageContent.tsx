import React, { useState } from 'react';
import { CriticalThinkingStage, StageInput } from '../types';
import { Play, Send, Plus, Trash2, ArrowRight, Loader2, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface StageContentProps {
  stage: CriticalThinkingStage;
  inputs: StageInput;
  setInputs: React.Dispatch<React.SetStateAction<StageInput>>;
  onNext: () => void;
  feedback: { isLoading: boolean; content: string | null };
}

// --- Helper Components for Markdown & Feedback ---

const SimpleMarkdown = ({ content }: { content: string }) => {
  // Simple parser for bold and list items to avoid heavy dependencies
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  
  const parseInline = (text: string) => {
    // Split by bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      // Basic italic handling (*text*)
      const italicParts = part.split(/(\*.*?\*)/g);
      return italicParts.map((subPart, subIndex) => {
          if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
              return <em key={`${index}-${subIndex}`} className="italic">{subPart.slice(1, -1)}</em>;
          }
          return subPart;
      });
    });
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Handle Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.substring(2);
      currentList.push(
        <li key={`li-${i}`} className="ml-4 list-disc pl-1 mb-1">
          {parseInline(text)}
        </li>
      );
    } else {
      // Flush list if exists
      if (currentList.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="mb-3 space-y-1">{[...currentList]}</ul>);
        currentList = [];
      }
      elements.push(<p key={`p-${i}`} className="mb-3 last:mb-0">{parseInline(trimmed)}</p>);
    }
  });

  // Flush remaining list
  if (currentList.length > 0) {
     elements.push(<ul key={`ul-end`} className="mb-3 space-y-1">{[...currentList]}</ul>);
  }

  return <div className="text-sm leading-relaxed">{elements}</div>;
};

const FeedbackDisplay = ({ content }: { content: string }) => {
  let status: 'neutral' | 'success' | 'error' = 'neutral';
  let cleanText = content;

  if (content.includes('[STATUS: PASS]')) {
      status = 'success';
      cleanText = content.replace('[STATUS: PASS]', '').trim();
  } else if (content.includes('[STATUS: IMPROVE]')) {
      status = 'error';
      cleanText = content.replace('[STATUS: IMPROVE]', '').trim();
  }

  const styles = {
      neutral: 'bg-indigo-50 border-indigo-100',
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200'
  };

  const textColors = {
      neutral: 'text-indigo-900',
      success: 'text-green-900',
      error: 'text-red-900'
  };

  const icon = {
      neutral: <Play className="w-5 h-5 text-indigo-600 mt-0.5" />,
      success: <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />,
      error: <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
  };

  const title = {
      neutral: "Coach Feedback",
      success: "On Track",
      error: "Needs Improvement"
  };

  return (
      <div className={`mt-8 p-5 rounded-xl border ${styles[status]} animate-fade-in shadow-sm transition-all`}>
           <div className="flex items-start gap-4">
              <div className="shrink-0">{icon[status]}</div>
              <div className={`flex-1 ${textColors[status]}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">
                    {title[status]}
                  </h4>
                  <SimpleMarkdown content={cleanText} />
              </div>
           </div>
      </div>
  );
};

// --- Main Component ---

export const StageContent: React.FC<StageContentProps> = ({ 
  stage, 
  inputs, 
  setInputs, 
  onNext,
  feedback
}) => {
  const [localObs, setLocalObs] = useState<string>('');
  const [showExamples, setShowExamples] = useState<boolean>(false);

  const handleInputChange = (field: keyof StageInput, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const addObservation = () => {
    if (localObs.trim() && inputs.observations.length < 5) {
      handleInputChange('observations', [...inputs.observations, localObs.trim()]);
      setLocalObs('');
    }
  };

  const removeObservation = (idx: number) => {
    const newObs = [...inputs.observations];
    newObs.splice(idx, 1);
    handleInputChange('observations', newObs);
  };

  const renderStage = () => {
    switch (stage) {
      case CriticalThinkingStage.DEFINE:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">1. Define the Real Question</h2>
            <p className="text-slate-600">
              Open the downloaded scenario file in Excel. Identify the single most important performance gap or problem statement. 
              Be specific about what is broken and why it matters.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Performance Gap Statement</label>
              <textarea 
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., The Q3 sales in the North region are down 15% YoY despite a 10% increase in marketing spend, indicating a conversion efficiency issue..."
                value={inputs.gapAnalysis}
                onChange={(e) => handleInputChange('gapAnalysis', e.target.value)}
              />
            </div>
          </div>
        );

      case CriticalThinkingStage.GATHER:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">2. Gather Relevant Information</h2>
            <p className="text-slate-600">
              Compose 5 key observations from the Excel data that are most relevant to the gap you defined. 
              Look for trends, outliers, or correlations in the charts and tables.
            </p>
            
            <div className="space-y-3">
              {inputs.observations.map((obs, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-800 text-sm flex-1"><span className="font-bold mr-2">{idx + 1}.</span> {obs}</span>
                  <button 
                    onClick={() => removeObservation(idx)}
                    className="text-slate-400 hover:text-red-500 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {inputs.observations.length < 5 && (
                <div className="flex gap-2 mt-2">
                  <input 
                    type="text" 
                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter an observation..."
                    value={localObs}
                    onChange={(e) => setLocalObs(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addObservation()}
                  />
                  <button 
                    onClick={addObservation}
                    disabled={!localObs.trim()}
                    className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-700 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <button 
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{showExamples ? 'Hide Examples' : 'Need a hint? See examples'}</span>
              </button>
              <span>{inputs.observations.length}/5 Observations</span>
            </div>

            {showExamples && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 animate-fade-in">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Sample Observations (TechRetail Scenario)</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    "North Region revenue dropped to $950k in Q3 despite a 40% increase in marketing spend."
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    "West Region employee turnover spiked to 22% in Q3, significantly higher than the company average of 8%."
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    "Customer satisfaction scores in the West dropped from 7.5 to 6.8 over the last three quarters."
                  </li>
                </ul>
              </div>
            )}
          </div>
        );

      case CriticalThinkingStage.ANALYZE:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">3. Analyze Options & Alternatives</h2>
            <p className="text-slate-600">
              Look deeper into the spreadsheet. Are there other indications in the dashboard that support or contradict your verdict? 
              Consider alternative explanations. What might you be missing?
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Supporting Indications & Analysis</label>
              <textarea 
                className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., While sales are down, customer satisfaction scores in the same region have actually improved. This suggests the issue isn't product quality, but potentially pricing or competitor activity..."
                value={inputs.supportingIndications}
                onChange={(e) => handleInputChange('supportingIndications', e.target.value)}
              />
            </div>
          </div>
        );

      case CriticalThinkingStage.DECIDE:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">4. Decide with Criteria</h2>
            <p className="text-slate-600">
              Construct a decisive Action Plan. Based on your definition, observations, and analysis, what should the team do next? 
              Prioritize high-impact actions.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Strategic Action Plan</label>
              <textarea 
                className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="1. Immediate Audit of...
2. Reallocate budget from X to Y...
3. Launch specific training for..."
                value={inputs.actionPlan}
                onChange={(e) => handleInputChange('actionPlan', e.target.value)}
              />
            </div>
          </div>
        );
        
      case CriticalThinkingStage.COMMUNICATE:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">5. Communicate and Review</h2>
            <p className="text-slate-600">
              You have completed the analysis. Submit your work to generate a final review summary and executive communication draft.
            </p>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Send className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Ready to Submit?</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto mt-2">
                  The AI Coach will review your entire thought process and generate a scorecard.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (feedback.isLoading) return true;
    switch (stage) {
      case CriticalThinkingStage.DEFINE: return inputs.gapAnalysis.length < 10;
      case CriticalThinkingStage.GATHER: return inputs.observations.length < 5;
      case CriticalThinkingStage.ANALYZE: return inputs.supportingIndications.length < 10;
      case CriticalThinkingStage.DECIDE: return inputs.actionPlan.length < 10;
      default: return false;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {renderStage()}

          {/* AI Feedback Section */}
          {feedback.content && (
            <FeedbackDisplay content={feedback.content} />
          )}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto flex justify-end">
          <button
            onClick={onNext}
            disabled={isNextDisabled()}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
              ${isNextDisabled() ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5'}
            `}
          >
            {feedback.isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>{feedback.content ? (stage === CriticalThinkingStage.COMMUNICATE ? 'Generate Summary' : 'Next Stage') : (stage === CriticalThinkingStage.COMMUNICATE ? 'Finalize' : 'Submit for Feedback')}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};