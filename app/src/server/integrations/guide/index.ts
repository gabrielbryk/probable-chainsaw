import type {
  GuideRequest,
  GuideResponse,
  GuideSendOptions,
  GuideStreamChunk,
  SelfTestResult,
} from '../types';

export interface GuideAdapter {
  send(request: GuideRequest, options?: GuideSendOptions): Promise<GuideResponse>;
  stream?(request: GuideRequest, options?: GuideSendOptions): AsyncIterable<GuideStreamChunk>;
  runSelfTest(): Promise<SelfTestResult>;
}

export { MockGuideAdapter } from './mock';
export { OpenAIGuideAdapter } from './openai';

export interface BuildHintRequestArgs {
  conversationId: string;
  riddle: { id: number; title: string; body: string };
  attempts: number;
  context?: Record<string, unknown>;
}

export const buildHintRequest = ({
  conversationId,
  riddle,
  attempts,
  context = {},
}: BuildHintRequestArgs): GuideRequest => ({
  conversationId,
  messages: [
    {
      role: 'system',
      content:
        'You are the Joy Hunt guide. Provide concise, loving hints that nudge without spoiling.',
    },
    {
      role: 'user',
      content: `Riddle: ${riddle.title}\nBody: ${riddle.body}\nAttempts: ${attempts}\nContext: ${JSON.stringify(
        context
      )}`,
    },
  ],
});
