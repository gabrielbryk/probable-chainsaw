import type { EffectEvent, SelfTestResult } from '../types';

export interface LightingAdapter {
  trigger(event: EffectEvent): Promise<void>;
  runSelfTest(): Promise<SelfTestResult>;
}

export { MockLightingAdapter } from './mock';
export { GoveeLightingAdapter } from './govee';
