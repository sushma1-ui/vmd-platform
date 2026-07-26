/**
 * Live Google Reviews — official Google Places API (New).
 *
 * Reads the business's rating, total rating count, and latest reviews straight
 * from the Google Business Profile via the Places API. No counts, ratings or
 * review text are ever hardcoded: everything here comes from Google or renders
 * nothing at all.
 *
 * Security: the API key is a SERVER-only env var (never `PUBLIC_`), so it is
 * read at build/SSR time and never shipped to the browser.
 *
 * Freshness: results are memoised for the lifetime of a build/serverless
 * instance. The homepage runs on Vercel ISR (hourly revalidation), so reviews
 * refresh automatically without a redeploy and without hammering the quota.
 *
 * Graceful failure: if the key or Place ID is unset, or Google is unreachable
 * or returns an error, every function resolves to `null`/`[]` and callers fall
 * back to a neutral state — the page never breaks and never shows stale numbers.
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY?.trim() || '';
const PLACE_ID = process.env.GOOGLE_PLACE_ID?.trim() || '';

/** A single normalised Google review, shaped for display. */
export interface GoogleReview {
  /** Reviewer's display name as attributed by Google. */
  author: string;
  /** Reviewer's Google profile URL (for attribution), if provided. */
  authorUrl: string | null;
  /** Reviewer's avatar URL, if provided. */
  avatar: string | null;
  /** Integer 1–5. */
  rating: number;
  /** The review body (already language-resolved by Google). */
  text: string;
  /** Human phrase, e.g. "2 months ago". */
  when: string;
  /** ISO publish time, for sorting / <time datetime>. */
  publishedAt: string | null;
}

/** Aggregate profile signal + latest reviews. All fields may be absent. */
export interface GoogleReviewsData {
  /** Average rating, 1 decimal (e.g. 4.9). */
  rating: number | null;
  /** Total number of ratings behind the average. */
  total: number | null;
  /** Canonical Google Maps URL for the business profile. */
  profileUrl: string | null;
  /** Up to 5 latest reviews Google chooses to expose. */
  reviews: GoogleReview[];
}

const EMPTY: GoogleReviewsData = { rating: null, total: null, profileUrl: null, reviews: [] };

/** Whether live reviews are configured at all (both key + Place ID present). */
export const googleReviewsConfigured = Boolean(API_KEY && PLACE_ID);

let cache: Promise<GoogleReviewsData> | null = null;

/**
 * Fetch the business profile + reviews from Google. Memoised: the first caller
 * triggers the request, everyone else awaits the same promise. Never throws.
 */
export function getGoogleReviews(): Promise<GoogleReviewsData> {
  if (!googleReviewsConfigured) return Promise.resolve(EMPTY);
  if (!cache) cache = fetchOnce();
  return cache;
}

async function fetchOnce(): Promise<GoogleReviewsData> {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}`;
  const fieldMask = 'rating,userRatingCount,googleMapsUri,reviews';
  try {
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      // Places is a slow-ish upstream; cap the wait so a build never hangs.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      // Do not leak the key; log status only.
      console.warn(`[google-reviews] Places API returned ${res.status}; falling back to empty.`);
      return EMPTY;
    }
    const json = (await res.json()) as PlacesResponse;
    return normalise(json);
  } catch (err) {
    console.warn('[google-reviews] fetch failed; falling back to empty.', String(err));
    return EMPTY;
  }
}

function normalise(p: PlacesResponse): GoogleReviewsData {
  const reviews: GoogleReview[] = (p.reviews ?? [])
    .map((r) => ({
      author: r.authorAttribution?.displayName?.trim() || 'Google user',
      authorUrl: r.authorAttribution?.uri || null,
      avatar: r.authorAttribution?.photoUri || null,
      rating: clampRating(r.rating),
      text: (r.text?.text ?? r.originalText?.text ?? '').trim(),
      when: r.relativePublishTimeDescription?.trim() || '',
      publishedAt: r.publishTime ?? null,
    }))
    .filter((r) => r.text.length > 0 && r.rating > 0);

  return {
    rating: typeof p.rating === 'number' ? Math.round(p.rating * 10) / 10 : null,
    total: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    profileUrl: p.googleMapsUri ?? null,
    reviews,
  };
}

function clampRating(n: unknown): number {
  const v = typeof n === 'number' ? Math.round(n) : 0;
  return v < 1 ? 0 : v > 5 ? 5 : v;
}

// --- Raw Places API (New) response shapes (only the fields we request) ---
interface PlacesResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    rating?: number;
    text?: { text?: string; languageCode?: string };
    originalText?: { text?: string; languageCode?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  }>;
}
