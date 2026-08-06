import { useEffect, useRef, useState } from 'react';
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
  const mountedRef = useRef(true);

  // Track mount status to guard against setState on an unmounted component.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function run(params: CreateTripWithBriefParams): Promise<void> {
    if (runningRef.current) return;
    runningRef.current = true;
    if (mountedRef.current) {
      setState({ phase: 'running', result: null, errorCode: null });
    }
    try {
      const result = await createTripWithBrief(params);
      if (mountedRef.current) {
        setState({
          phase: 'complete',
          result,
          errorCode: result.status === 'failed' ? (result.errorMessage ?? 'AI_ERROR') : null,
        });
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : 'TRIP_CREATE_ERROR';
      if (mountedRef.current) {
        setState({ phase: 'failed', result: null, errorCode: code });
      }
    }
    // runningRef intentionally stays true after completion; only retry() resets it.
  }

  function retry(params: CreateTripWithBriefParams): void {
    runningRef.current = false;
    void run(params);
  }

  return { ...state, run, retry };
}
