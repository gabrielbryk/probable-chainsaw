import type { AudioAdapter } from './index';
import type { EffectEvent, SelfTestResult } from '../types';

export class TuneJsAudioAdapter implements AudioAdapter {
  async trigger(_event: EffectEvent): Promise<void> {
    // TODO: bridge backend events to frontend Tune.js via WebSocket or SSE.
  }

  async runSelfTest(): Promise<SelfTestResult> {
    return {
      name: 'Audio (Tune.js)',
      success: true,
      details: 'Placeholder – implement WS ping to frontend when available.',
    };
  }
}
