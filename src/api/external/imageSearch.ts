export interface ImageResult {
  thumb: string;
  url: string;
  title: string;
}

/**
 * Search for product images via Unsplash Search API.
 * Primary: Google Custom Search (if VITE_GOOGLE_SEARCH_API_KEY + VITE_GOOGLE_SEARCH_CX are set and working).
 * Fallback: Unsplash (VITE_UNSPLASH_ACCESS_KEY).
 */
export const searchImages = async (query: string): Promise<ImageResult[]> => {
  const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  if (!unsplashKey) return [];

  const url =
    `https://api.unsplash.com/search/photos` +
    `?query=${encodeURIComponent(query)}&per_page=6&orientation=squarish` +
    `&client_id=${unsplashKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('unsplash_error');
  const data = await res.json();
  return (data.results ?? []).map((item: any) => ({
    thumb: item.urls.small,
    url:   item.urls.regular,
    title: item.alt_description ?? query,
  }));
};
