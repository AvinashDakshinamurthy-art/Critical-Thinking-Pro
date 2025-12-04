import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, Loader2, PlayCircle, ArrowRight } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: () => void;
  isAnalyzing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onSampleSelect, 
  isAnalyzing 
}) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white mb-6 shadow-lg">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Critical Thinking Lab</h1>
        <p className="text-slate-600 text-xl max-w-2xl mx-auto">
          A guided scenario-based practice for senior managers. Master the 5 stages of critical decision making.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Start Analysis</h2>
            <p className="text-slate-600">
              Launch the guided AI coach to begin the evaluation process.
            </p>
          </div>

          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                <p className="font-medium text-slate-900">Initializing Coach...</p>
                <p className="text-xs text-slate-500 mt-1">Analyzing Dashboard Context</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={onSampleSelect}
                  className="w-full flex items-center justify-between px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-1 group"
                >
                  <span className="flex items-center gap-3">
                    <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Start Sample Scenario
                  </span>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-slate-400 uppercase tracking-wider">Or upload your own</span>
                  </div>
                </div>

                <div>
                   <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".xlsx,.xls,.csv"
                    onChange={handleChange}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-600 rounded-lg font-medium transition-all text-sm group"
                  >
                    <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Upload Custom Dashboard File
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-16 border-t border-slate-200 pt-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8 text-center">The Framework</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Define", desc: "Identify the Gap" },
            { step: "2", title: "Gather", desc: "Key Observations" },
            { step: "3", title: "Analyze", desc: "Supporting Evidence" },
            { step: "4", title: "Decide", desc: "Action Plan" },
            { step: "5", title: "Review", desc: "AI Evaluation" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 font-bold flex items-center justify-center text-sm mb-3 transition-colors border border-slate-200 group-hover:border-blue-100">
                {item.step}
              </div>
              <div className="font-semibold text-slate-900 text-sm mb-1">{item.title}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};