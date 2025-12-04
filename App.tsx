import React, { useState } from 'react';
import { CriticalThinkingStage, DashboardData, StageInput, StageFeedback } from './types';
import { FileUpload } from './components/FileUpload';
import { DashboardPreview } from './components/DashboardPreview';
import { StageNavigation } from './components/StageNavigation';
import { StageContent } from './components/StageContent';
import { FinalSummary } from './components/FinalSummary';
import { analyzeDashboardContext, getStageFeedback, generateFinalSummary } from './services/geminiService';
import { LogOut } from 'lucide-react';

const initialInputs: StageInput = {
  gapAnalysis: '',
  observations: [],
  supportingIndications: '',
  actionPlan: ''
};

const SAMPLE_DATA_CSV = `Region,Quarter,Revenue,Target,Marketing_Spend,CSAT_Score,Employee_Turnover
North,Q1,1200000,1100000,150000,8.5,4%
North,Q2,1150000,1150000,160000,8.4,5%
North,Q3,950000,1200000,220000,8.2,12%
South,Q1,900000,900000,80000,7.9,8%
South,Q2,920000,900000,85000,8.0,7%
South,Q3,980000,920000,90000,8.1,6%
East,Q1,1500000,1400000,200000,9.0,3%
East,Q2,1550000,1450000,210000,9.1,3%
East,Q3,1600000,1500000,210000,9.2,3%
West,Q1,800000,800000,100000,7.5,15%
West,Q2,750000,820000,110000,7.2,18%
West,Q3,700000,840000,120000,6.8,22%`;

const SAMPLE_DATA_SHEETS = {
  "Sales Data": [
    ["Region", "Quarter", "Revenue", "Target", "Marketing_Spend", "CSAT_Score", "Employee_Turnover"],
    ["North", "Q1", 1200000, 1100000, 150000, 8.5, 0.04],
    ["North", "Q2", 1150000, 1150000, 160000, 8.4, 0.05],
    ["North", "Q3", 950000, 1200000, 220000, 8.2, 0.12],
    ["South", "Q1", 900000, 900000, 80000, 7.9, 0.08],
    ["South", "Q2", 920000, 900000, 85000, 8.0, 0.07],
    ["South", "Q3", 980000, 920000, 90000, 8.1, 0.06],
    ["East", "Q1", 1500000, 1400000, 200000, 9.0, 0.03],
    ["East", "Q2", 1550000, 1450000, 210000, 9.1, 0.03],
    ["East", "Q3", 1600000, 1500000, 210000, 9.2, 0.03],
    ["West", "Q1", 800000, 800000, 100000, 7.5, 0.15],
    ["West", "Q2", 750000, 820000, 110000, 7.2, 0.18],
    ["West", "Q3", 700000, 840000, 120000, 6.8, 0.22],
  ],
  "Regional Notes": [
    ["Region", "Manager Notes", "Status"],
    ["North", "Competitor launched aggressive discount campaign in Q3", "Critical"],
    ["South", "Stable performance, new manager onboarding well", "Stable"],
    ["East", "Outperforming targets, candidate for expansion", "Excellent"],
    ["West", "High turnover affecting morale and sales", "At Risk"],
  ]
};

const App: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<CriticalThinkingStage>(CriticalThinkingStage.UPLOAD);
  
  const [dashboard, setDashboard] = useState<DashboardData>({
    file: null,
    sheets: null,
    sheetNames: [],
    activeSheet: null,
    aiContext: null,
    isAnalyzing: false,
  });

  const [inputs, setInputs] = useState<StageInput>(initialInputs);
  
  const [feedback, setFeedback] = useState<StageFeedback>({});

  const handleSampleSelect = async () => {
    setDashboard(prev => ({ 
      ...prev, 
      isAnalyzing: true 
    }));
    
    // Simulate loading time for UX
    setTimeout(async () => {
      try {
        const context = await analyzeDashboardContext(SAMPLE_DATA_CSV);
        setDashboard(prev => ({ 
          ...prev, 
          sheets: SAMPLE_DATA_SHEETS,
          sheetNames: Object.keys(SAMPLE_DATA_SHEETS),
          activeSheet: Object.keys(SAMPLE_DATA_SHEETS)[0],
          aiContext: context, 
          isAnalyzing: false,
        }));
        setCurrentStage(CriticalThinkingStage.DEFINE);
      } catch (e) {
        console.error("Sample load error", e);
        setDashboard(prev => ({ ...prev, isAnalyzing: false }));
      }
    }, 1000);
  };

  const handleFileSelect = async (file: File) => {
    setDashboard(prev => ({ 
      ...prev, 
      file, 
      isAnalyzing: true,
    }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const XLSX = (window as any).XLSX;
      
      if (!XLSX) {
        throw new Error("XLSX library not loaded");
      }

      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheets: { [name: string]: any[][] } = {};
      const sheetNames = workbook.SheetNames;

      // Extract data from all sheets
      sheetNames.forEach((name: string) => {
        const worksheet = workbook.Sheets[name];
        // Parse to JSON (Array of Arrays)
        sheets[name] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      });
      
      // Get the first sheet for AI Context (to keep token count reasonable)
      const firstSheetName = sheetNames[0];
      const firstWorksheet = workbook.Sheets[firstSheetName];
      const csvData = XLSX.utils.sheet_to_csv(firstWorksheet);

      // AI Analysis of the dashboard data
      const context = await analyzeDashboardContext(csvData);
      
      setDashboard(prev => ({ 
        ...prev, 
        sheets: sheets,
        sheetNames: sheetNames,
        activeSheet: sheetNames[0],
        aiContext: context, 
        isAnalyzing: false 
      }));
      setCurrentStage(CriticalThinkingStage.DEFINE);
    } catch (error) {
      console.error("Error processing file", error);
      setDashboard(prev => ({ ...prev, isAnalyzing: false }));
      alert("Failed to process Excel file. Please ensure it is a valid .xlsx or .csv file.");
    }
  };

  const handleNextStage = async () => {
    // If we are at the summary, do nothing or reset
    if (currentStage === CriticalThinkingStage.SUMMARY) return;

    const currentFeedback = feedback[currentStage];
    
    // Check if we need to get feedback before moving on
    if (!currentFeedback?.content) {
      // 1. Set Loading
      setFeedback(prev => ({
        ...prev,
        [currentStage]: { isLoading: true, content: null }
      }));

      // 2. Prepare Data
      let textInput = "";
      switch (currentStage) {
        case CriticalThinkingStage.DEFINE: textInput = inputs.gapAnalysis; break;
        case CriticalThinkingStage.GATHER: textInput = inputs.observations.join('; '); break;
        case CriticalThinkingStage.ANALYZE: textInput = inputs.supportingIndications; break;
        case CriticalThinkingStage.DECIDE: textInput = inputs.actionPlan; break;
        case CriticalThinkingStage.COMMUNICATE: textInput = "Submitting for final review."; break;
      }

      // 3. Call AI
      if (currentStage === CriticalThinkingStage.COMMUNICATE) {
        // Generate Final Summary
        const summary = await generateFinalSummary(inputs, dashboard.aiContext || "");
        setFeedback(prev => ({
          ...prev,
          [currentStage]: { isLoading: false, content: summary } // Storing summary in feedback for now
        }));
        setCurrentStage(CriticalThinkingStage.SUMMARY);
      } else {
        // Get Stage Coaching
        const aiResponse = await getStageFeedback(
          CriticalThinkingStage[currentStage],
          textInput,
          dashboard.aiContext || "",
          inputs
        );

        setFeedback(prev => ({
          ...prev,
          [currentStage]: { isLoading: false, content: aiResponse }
        }));
      }
    } else {
      // Feedback exists, user acknowledged it -> Move Next
      setCurrentStage(prev => prev + 1);
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm("Are you sure you want to exit? Your progress will be lost.");
    if (confirmReset) {
      setCurrentStage(CriticalThinkingStage.UPLOAD);
      setDashboard({
        file: null,
        sheets: null,
        sheetNames: [],
        activeSheet: null,
        aiContext: null,
        isAnalyzing: false,
      });
      setInputs(initialInputs);
      setFeedback({});
    }
  };

  const handleSummaryReset = () => {
    // No confirmation needed on summary screen
    setCurrentStage(CriticalThinkingStage.UPLOAD);
    setDashboard({
      file: null,
      sheets: null,
      sheetNames: [],
      activeSheet: null,
      aiContext: null,
      isAnalyzing: false,
    });
    setInputs(initialInputs);
    setFeedback({});
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold text-lg">
            CT
          </div>
          <span className="font-semibold text-lg tracking-tight">Critical Thinker Pro</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-slate-400">
             {currentStage !== CriticalThinkingStage.UPLOAD && "Executive Scenario Practice"}
          </div>
          {currentStage !== CriticalThinkingStage.UPLOAD && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-colors text-slate-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {currentStage === CriticalThinkingStage.UPLOAD ? (
          <div className="flex-1 flex items-center justify-center overflow-y-auto">
             <FileUpload 
              onFileSelect={handleFileSelect} 
              onSampleSelect={handleSampleSelect}
              isAnalyzing={dashboard.isAnalyzing} 
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
             <StageNavigation currentStage={currentStage} />
             
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                 {/* Left Panel: Resource & Download Panel */}
                 <DashboardPreview 
                    file={dashboard.file}
                    sheets={dashboard.sheets}
                 />
                 
                 {/* Right Panel: Active Stage Content or Summary */}
                 <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative shadow-xl z-10">
                    {currentStage === CriticalThinkingStage.SUMMARY ? (
                       <div className="flex-1 overflow-y-auto">
                          <FinalSummary 
                              summary={feedback[CriticalThinkingStage.COMMUNICATE]?.content || "No summary generated."} 
                              inputs={inputs}
                              onReset={handleSummaryReset}
                          />
                       </div>
                    ) : (
                      <StageContent 
                        stage={currentStage}
                        inputs={inputs}
                        setInputs={setInputs}
                        onNext={handleNextStage}
                        feedback={feedback[currentStage] || { isLoading: false, content: null }}
                      />
                    )}
                 </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;