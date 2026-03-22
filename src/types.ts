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

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  chart?: ChartConfig;
  timestamp: Date;
}

export interface Tip {
  id: string;
  content: string;
  category: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  tips: Tip[];
  lastUpdated: Date;
}
