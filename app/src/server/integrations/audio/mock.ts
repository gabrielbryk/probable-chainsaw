import type { AudioAdapter } from './index';
import type { EffectEvent, SelfTestResult } from '../types';

export class MockAudioAdapter implements AudioAdapter {
  async trigger(event: EffectEvent): Promise<void> {
    console.info('[mock-audio]', event);
  }

  async runSelfTest(): Promise<SelfTestResult> {
    return { name: 'Audio (mock)', success: true, details: 'Mock audio no-ops.' };
  }
}
