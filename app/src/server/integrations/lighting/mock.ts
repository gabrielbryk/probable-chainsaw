import type { LightingAdapter } from './index';
import type { EffectEvent, SelfTestResult } from '../types';

export class MockLightingAdapter implements LightingAdapter {
  async trigger(event: EffectEvent): Promise<void> {
    console.info('[mock-lighting]', event);
  }

  async runSelfTest(): Promise<SelfTestResult> {
    return { name: 'Lighting (mock)', success: true, details: 'Mock lighting no-ops.' };
  }
}
