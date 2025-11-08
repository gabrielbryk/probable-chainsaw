import type { EffectEvent, SelfTestResult } from '../types';

export interface AudioAdapter {
  trigger(event: EffectEvent): Promise<void>;
  runSelfTest(): Promise<SelfTestResult>;
}

export { MockAudioAdapter } from './mock';
export { TuneJsAudioAdapter } from './tune';
