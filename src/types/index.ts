// Main types export file for the Civic Text Editor

export * from './plate-elements';

// Editor types
export interface EditorMood {
  type: 'happy' | 'sad';
  color: string;
  icon: string;
}

// AI types
export interface AIRewriteRequest {
  text: string;
  mood: 'happy' | 'sad';
  options?: {
    intensity?: 'low' | 'medium' | 'high';
    preserveLength?: boolean;
  };
}

export interface AIRewriteResponse {
  originalText: string;
  rewrittenText: string;
  mood: 'happy' | 'sad';
  confidence: number;
}

// Collaboration types
export interface CollaborationState {
  roomId?: string;
  isConnected: boolean;
  participants: CollaborationParticipant[];
  currentUser?: CollaborationParticipant;
}

export interface CollaborationParticipant {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  cursor?: {
    x: number;
    y: number;
  };
}

// Local storage types
export interface LocalStorageData {
  content: any[];
  lastModified: Date;
  version: string;
}

// Quote types
export interface Quote {
  text: string;
  author?: string;
  category: 'happy' | 'sad';
}

// App configuration
export interface AppConfig {
  version: string;
  features: {
    aiRewriting: boolean;
    collaboration: boolean;
    localPersistence: boolean;
    interactiveElements: boolean;
  };
}
