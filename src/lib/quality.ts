export type QualityProfile = 'high' | 'low';

export function detectQuality(): QualityProfile {
  if (typeof window === 'undefined') return 'low';
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';
  if (window.innerWidth < 720 || (memory !== undefined && memory <= 4) || (cores && cores <= 4)) return 'low';
  return 'high';
}
