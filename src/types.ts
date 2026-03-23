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

export type AccentColor = 'indigo' | 'blue' | 'rose' | 'amber' | 'emerald';

export const ACCENT_COLORS: { name: AccentColor; color: string }[] = [
  { name: 'indigo', color: '#6366f1' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'rose', color: '#f43f5e' },
  { name: 'amber', color: '#f59e0b' },
  { name: 'emerald', color: '#10b981' },
];

export const getAccentHex = (name: AccentColor) => {
  return ACCENT_COLORS.find(c => c.name === name)?.color || '#6366f1';
};

export interface ThemeSettings {
  accentColor: AccentColor;
  isDarkMode: boolean;
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
