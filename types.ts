
export type DifficultyLevel = 'ELI5 (Simple)' | 'Undergrad (Academic)' | 'Exam Prep (Intense)';
export type TargetDuration = '30s (Reel)' | '60s (Short)' | '90s (Lesson)';

export interface SyllabusConcept {
  id: string;
  title: string;
  description: string;
  unit: string;
  isCompleted?: boolean;
}

export interface SyllabusData {
  title: string;
  units: string[];
  concepts: SyllabusConcept[];
}

export interface VideoRequest {
  topic: string;
  series: string;
  character: string;
  aspectRatio: '16:9' | '9:16';
  difficulty: DifficultyLevel;
  duration: TargetDuration;
  // Context from syllabus
  context?: {
    unit: string;
    conceptId: string;
    description: string;
  };
}

export interface GeneratedVideo {
  type: 'video';
  id: string;
  url: string;
  topic: string;
  series: string;
  character?: string;
  aspectRatio: '16:9' | '9:16';
  difficulty: DifficultyLevel;
  duration: TargetDuration;
  createdAt: number;
  conceptId?: string; // Link to syllabus
}

export interface GeneratedComic {
  type: 'comic';
  id: string;
  topic: string;
  series: string;
  character?: string;
  imageUrl: string;
  createdAt: number;
  conceptId?: string; // Link to syllabus
}

export type GeneratedContent = GeneratedVideo | GeneratedComic;

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

// Global interface for the AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
