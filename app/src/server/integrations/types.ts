export type EffectType = 'lighting' | 'audio' | 'celebration';

export interface EffectPayload {
  [key: string]: unknown;
}

export interface EffectEvent {
  type: EffectType;
  payload: EffectPayload;
  description?: string;
}

export type { LightingEffectPayload } from './lighting/schema'

export interface SelfTestResult {
  name: string;
  success: boolean;
  details?: string;
  error?: unknown;
}

export type GuideRole = 'system' | 'user' | 'assistant';

export interface GuideMessage {
  role: GuideRole;
  content: string;
}

export interface GuideRequest {
  conversationId: string;
  messages: GuideMessage[];
  metadata?: Record<string, unknown>;
}

export interface GuideSendOptions {
  persona?: string;
  promptTemplate?: string;
  safetyFallback?: string;
  enableStreaming?: boolean;
  modelKey?: import('./guide/models').GuideModelKey;
}

export interface GuideConversationEntry {
  conversationId: string;
  role: GuideRole;
  content: string;
  timestamp: string;
}

export interface GuideUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface GuideResponse {
  text: string;
  metadata: {
    raw?: unknown;
    usage?: GuideUsage;
    conversationEntry?: GuideConversationEntry;
    cached?: boolean;
  };
}

export interface GuideStreamChunk {
  content: string;
  done: boolean;
}
