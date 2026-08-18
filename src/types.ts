export interface Stakeholder {
  id: string;
  nameOrRole: string;
  departmentOrTeam?: string;
  responsibility: string;
  keyInterestOrInput?: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  suggestedDeadline?: string;
  context?: string;
  completed?: boolean;
}

export interface AgendaSection {
  id: string;
  title: string;
  category: 'Context & Kickoff' | 'Discussion' | 'Deep Dive' | 'Decision Gate' | 'Action Planning' | 'Wrap-up & Buffer';
  durationMinutes: number;
  summary: string;
  keyDiscussionPoints: string[];
  expectedOutcome: string;
  leadStakeholder?: string;
  speakerNotes?: string;
}

export interface MeetingAgenda {
  title: string;
  meetingGoal: string;
  totalDurationMinutes: number;
  meetingType: 'Decision-Making' | 'Strategic Planning' | 'Project Sync & Status' | 'Brainstorming' | 'Review & Retro';
  targetAudience: string;
  preReadHighlights: string[];
  keyRisksOrBlockers: string[];
  stakeholders: Stakeholder[];
  sections: AgendaSection[];
  actionItems: ActionItem[];
  closingQuestionOrPrompt?: string;
}

export interface MeetingConfig {
  totalDurationMinutes: number;
  meetingType: 'Decision-Making' | 'Strategic Planning' | 'Project Sync & Status' | 'Brainstorming' | 'Review & Retro';
  customObjective?: string;
  participantsHint?: string;
  bufferMinutes: number;
  detailLevel: 'concise' | 'balanced' | 'comprehensive';
}

export interface UploadedDocument {
  name: string;
  type: 'docx' | 'markdown' | 'text' | 'sample';
  sizeFormatted: string;
  rawContent: string;
  charCount: number;
  wordCount: number;
}
