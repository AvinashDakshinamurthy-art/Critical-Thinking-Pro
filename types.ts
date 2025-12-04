export enum CriticalThinkingStage {
  UPLOAD = 0,
  DEFINE = 1,
  GATHER = 2,
  ANALYZE = 3,
  DECIDE = 4,
  COMMUNICATE = 5,
  SUMMARY = 6
}

export interface DashboardData {
  file: File | null;
  sheets: { [sheetName: string]: any[][] } | null; // Map of sheet names to data
  sheetNames: string[]; // List of sheet names for tabs
  activeSheet: string | null; // Currently selected sheet
  aiContext: string | null; // The AI's hidden analysis of the dashboard
  isAnalyzing: boolean;
}

export interface StageInput {
  gapAnalysis: string;
  observations: string[];
  supportingIndications: string;
  actionPlan: string;
}

export interface StageFeedback {
  [key: number]: {
    isLoading: boolean;
    content: string | null;
    score?: number;
  };
}

export interface AppState {
  currentStage: CriticalThinkingStage;
  dashboard: DashboardData;
  inputs: StageInput;
  feedback: StageFeedback;
}