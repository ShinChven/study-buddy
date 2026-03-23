export type MessageRole = 'user' | 'assistant';

export interface ChartData {
  label: string;
  value: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: ChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  confidence?: number;
}

export interface MermaidConfig {
  code: string;
  title: string;
  confidence?: number;
}

export interface FollowUpSettings {
  debugMode: boolean;
  showSkipped: boolean;
  threshold: number;
}

export interface FlipCard {
  title: string;
  knowledge: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface FollowUp {
  chart?: ChartConfig;
  mermaid?: MermaidConfig;
  suggestedQuestion?: string;
  flipCard?: FlipCard;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  followUp?: FollowUp;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}
