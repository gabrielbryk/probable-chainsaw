import { env } from '../config/env';
import { MockGuideAdapter, OpenAIGuideAdapter } from './guide';
import { MockLightingAdapter, GoveeLightingAdapter } from './lighting';
import { MockAudioAdapter, TuneJsAudioAdapter } from './audio';
import { MockAnswerEvaluatorAdapter, OpenAIAnswerEvaluatorAdapter } from './evaluator';
import type { GuideAdapter } from './guide';
import type { LightingAdapter } from './lighting';
import type { AudioAdapter } from './audio';
import type { AnswerEvaluatorAdapter } from './evaluator';
import type { SelfTestResult } from './types';

const guide: GuideAdapter = env.mockMode ? new MockGuideAdapter() : new OpenAIGuideAdapter();
const lighting: LightingAdapter = env.mockMode ? new MockLightingAdapter() : new GoveeLightingAdapter();
const audio: AudioAdapter = env.mockMode ? new MockAudioAdapter() : new TuneJsAudioAdapter();
const answerEvaluator: AnswerEvaluatorAdapter = env.mockMode
  ? new MockAnswerEvaluatorAdapter()
  : new OpenAIAnswerEvaluatorAdapter();

export const integrations = { guide, lighting, audio, answerEvaluator } as const;

export async function runAllIntegrationTests(): Promise<SelfTestResult[]> {
  return Promise.all([
    integrations.guide.runSelfTest(),
    integrations.lighting.runSelfTest(),
    integrations.audio.runSelfTest(),
    integrations.answerEvaluator.runSelfTest(),
  ]);
}

export { type GuideAdapter } from './guide';
export { type LightingAdapter } from './lighting';
export { type AudioAdapter } from './audio';
export { type AnswerEvaluatorAdapter } from './evaluator';
export * from './types';
