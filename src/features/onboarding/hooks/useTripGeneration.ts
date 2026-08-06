import { useRef, useState } from 'react';
import {
  createTripWithBrief,
  type CreateTripWithBriefParams,
  type CreateTripWithBriefResult,
} from '../services/onboarding.service';

export type GenerationPhase = 'idle' | 'running' | 'complete' | 'failed';

interface GenerationState {
  phase: GenerationPhase;
  result: CreateTripWithBriefResult | null;
  errorCode: string | null;
}

const INITIAL: GenerationState = { phase: 'idle', result: null, errorCode: null };

export function useTripGeneration() {
  const [state, setState] = useState<GenerationState>(INITIAL);
  const runningRef = useRef(false);

  async function run(params: CreateTripWithBriefParams): Promise<void> {
    if (runningRef.current) return;
    runningRef.current = true;
    setState({ phase: 'running', result: null, errorCode: null });
    try {
      const result = await createTripWithBrief(params);
      // createTripWithBrief never throws for AI failures — only for DB errors.
      // AI failures are returned as result.status === 'failed'.
      setState({
        phase: 'complete',
        result,
        errorCode: result.status === 'failed' ? (result.errorMessage ?? 'AI_ERROR') : null,
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : 'TRIP_CREATE_ERROR';
      setState({ phase: 'failed', result: null, errorCode: code });
    }
  }

  function retry(params: CreateTripWithBriefParams): void {
    runningRef.current = false;
    void run(params);
  }

  return { ...state, run, retry };
}
