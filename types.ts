
export enum AppTab {
  DECKS = 'decks',
  CHAT = 'chat',
  ASSETS = 'assets'
}

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
  visualPrompt: string;
  layout: 
    | 'bullet-list' 
    | 'image-left' 
    | 'image-right' 
    | 'big-text' 
    | 'pitch-stats' 
    | 'two-column-text' 
    | 'image-caption' 
    | 'quote-card' 
    | 'market-tiers' 
    | 'business-model' 
    | 'team-grid' 
    | 'traction-chart'
    | 'web-hero'
    | 'feature-grid'
    | 'data-table'
    | 'roadmap-timeline';
  stats?: { label: string; value: string }[];
  attribution?: string; 
  financials?: { label: string; value: string }[];
  tableData?: string[][];
}

export interface Deck {
  id: string;
  topic: string;
  style: 'modern' | 'creative' | 'minimalist' | 'corporate';
  slides: Slide[];
  summary: string;
  code?: string; // For technical blueprints/MVPs
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
