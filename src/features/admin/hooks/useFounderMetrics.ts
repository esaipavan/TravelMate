import { useQuery } from '@tanstack/react-query';
import {
  getActiveUserCounts,
  getDauTrend,
  getActivationRate,
  getRetention,
  getFunnelCounts,
  getAiSummary,
  getTopDestinations,
  getDeviceBreakdown,
  getFeatureAdoptionV2,
} from '../services/founder.service';

const ONE_MIN = 1000 * 60;
const FIVE_MIN = ONE_MIN * 5;
const TEN_MIN = ONE_MIN * 10;

export function useActiveUserCounts() {
  return useQuery({
    queryKey: ['founder', 'active-user-counts'],
    queryFn: getActiveUserCounts,
    staleTime: FIVE_MIN,
    refetchInterval: FIVE_MIN,
  });
}

export function useDauTrend(daysBack = 30) {
  return useQuery({
    queryKey: ['founder', 'dau-trend', daysBack],
    queryFn: () => getDauTrend(daysBack),
    staleTime: TEN_MIN,
  });
}

export function useActivationRate() {
  return useQuery({
    queryKey: ['founder', 'activation-rate'],
    queryFn: getActivationRate,
    staleTime: TEN_MIN,
  });
}

export function useRetention() {
  return useQuery({
    queryKey: ['founder', 'retention'],
    queryFn: getRetention,
    staleTime: TEN_MIN,
  });
}

export function useFunnelCounts() {
  return useQuery({
    queryKey: ['founder', 'funnel'],
    queryFn: getFunnelCounts,
    staleTime: FIVE_MIN,
    refetchInterval: FIVE_MIN,
  });
}

export function useAiSummary() {
  return useQuery({
    queryKey: ['founder', 'ai-summary'],
    queryFn: getAiSummary,
    staleTime: FIVE_MIN,
    refetchInterval: FIVE_MIN,
  });
}

export function useTopDestinations(lim = 10) {
  return useQuery({
    queryKey: ['founder', 'top-destinations', lim],
    queryFn: () => getTopDestinations(lim),
    staleTime: TEN_MIN,
  });
}

export function useDeviceBreakdown() {
  return useQuery({
    queryKey: ['founder', 'device-breakdown'],
    queryFn: getDeviceBreakdown,
    staleTime: TEN_MIN,
  });
}

export function useFeatureAdoptionV2() {
  return useQuery({
    queryKey: ['founder', 'feature-adoption-v2'],
    queryFn: getFeatureAdoptionV2,
    staleTime: TEN_MIN,
  });
}
