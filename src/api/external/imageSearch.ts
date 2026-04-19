export interface ImageResult {
  thumb: string;
  url: string;
  title: string;
}

/**
 * Search for product images.
 * Primary: Google Custom Search Image API (100 free/day).
 * Fallback: Unsplash Search API (when Google quota exceeded or not configured).
 */
export const searchImages = async (query: string): Promise<ImageResult[]> => {
  const googleKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const googleCx  = import.meta.env.VITE_GOOGLE_SEARCH_CX;
  const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  // ── Google Custom Search ──────────────────────────────────────────────────
  if (googleKey && googleCx) {
    try {
      const url =
        `https://www.googleapis.com/customsearch/v1` +
        `?key=${googleKey}&cx=${googleCx}` +
        `&searchType=image&num=6&safe=active&imgSize=medium` +
        `&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);

      // 429 = daily quota hit, 403 = key/cx problem — fall through to Unsplash
      if (res.status === 429 || res.status === 403) throw new Error('quota');
      if (!res.ok) throw new Error('google_error');

      const data = await res.json();
      const items: any[] = data.items ?? [];
      if (items.length) {
        return items.map((item) => ({
          thumb: item.image?.thumbnailLink ?? item.link,
          url:   item.link,
          title: item.title ?? query,
        }));
      }
      // Empty results — fall through
    } catch (err: any) {
      if (err.message !== 'quota' && err.message !== 'google_error') {
        throw err;
      }
      // Quota / config error — fall through to Unsplash
    }
  }

  // ── Unsplash fallback ─────────────────────────────────────────────────────
  if (unsplashKey) {
    const url =
      `https://api.unsplash.com/search/photos` +
      `?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape` +
      `&client_id=${unsplashKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('unsplash_error');
    const data = await res.json();
    return (data.results ?? []).map((item: any) => ({
      thumb: item.urls.small,
      url:   item.urls.regular,
      title: item.alt_description ?? query,
    }));
  }

  return [];
};
