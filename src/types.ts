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
}

export interface MermaidConfig {
  code: string;
  title: string;
}

export interface FollowUp {
  chart?: ChartConfig;
  mermaid?: MermaidConfig;
  suggestedQuestion?: string;
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
