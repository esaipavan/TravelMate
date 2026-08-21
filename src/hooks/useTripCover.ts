import { resolveTripCoverImage, isGenericTempleCover } from '@/utils/destinationTheme';
import { usePlaceImage } from '@/hooks/usePlaceImage';

/**
 * The final cover image for a trip card / hero. Reconciles the stored cover
 * (curated / custom / legacy) and, when there is no cover OR only the generic
 * temple-gopuram stand-in, swaps in a real, place-specific Wikipedia photo
 * (e.g. the actual Tirumala temple for "Tirupati"). Returns `null` → the caller
 * renders its gradient. Wikipedia lookups are cached per destination, so many
 * cards for the same place share a single fetch.
 */
export function useTripCover(
  destination: string,
  storedCover: string | null | undefined,
): string | null {
  const reconciled = resolveTripCoverImage(destination, storedCover);
  const wantsRealPhoto = !reconciled || isGenericTempleCover(reconciled);
  const { imageUrl: enriched } = usePlaceImage(destination, { enabled: wantsRealPhoto });
  return wantsRealPhoto ? (enriched ?? reconciled) : reconciled;
}
