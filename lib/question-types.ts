export type QuestionType = 
  | "percent-mac"
  | "forward-cg-limit"
  | "weight-balance"
  | "ballast"
  | "max-fuel"
  | "cg-position";

export interface LoadingItem {
  name: string;
  weight: number;
  arm: number;
  momentIndex: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  scenario: string;
  scenarioText: string; // Natural language description of the loading
  loadingTable: LoadingItem[]; // Still kept for answer working calculations
  question: string;
  answer: string;
  workings: string;
  numericalAnswer?: number;
  unit?: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  createdAt: Date;
  questions: Question[];
}
