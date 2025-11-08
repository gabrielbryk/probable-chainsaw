import type { GuideAdapter } from './index';
import type {
  GuideRequest,
  GuideResponse,
  GuideSendOptions,
  GuideStreamChunk,
  SelfTestResult,
} from '../types';

export class MockGuideAdapter implements GuideAdapter {
  async send(request: GuideRequest, options?: GuideSendOptions): Promise<GuideResponse> {
    const lastUser = request.messages.findLast((m) => m.role === 'user');
    const persona = options?.persona ? `[Persona: ${options.persona}] ` : '';
    const text = lastUser
      ? `${persona}Mock response to: ${lastUser.content}`
      : `${persona}Mock guide ready.`;
    return {
      text,
      metadata: {
        conversationEntry: {
          conversationId: request.conversationId,
          role: 'assistant',
          content: text,
          timestamp: new Date().toISOString(),
        },
        cached: false,
      },
    };
  }

  stream(request: GuideRequest, options?: GuideSendOptions): AsyncIterable<GuideStreamChunk> {
    const chunks = [
      { content: 'Mock ', done: false },
      { content: 'stream ', done: false },
      { content: 'response.', done: true },
    ];
    return (async function* () {
      for (const chunk of chunks) {
        yield chunk;
      }
    })();
  }

  async runSelfTest(): Promise<SelfTestResult> {
    return { name: 'Guide (mock)', success: true, details: 'Mock guide always succeeds.' };
  }
}
