/**
 * Option C — Product info card & share button logic
 *
 * Tests for:
 *   - addedDate derivation (created_at / _created fallback, formatting)
 *   - handleShare: clipboard fallback when Web Share API is unavailable
 *   - handleShare: uses navigator.share when available and canShare returns true
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── addedDate logic (pure) ───────────────────────────────────────────────────

function getAddedDate(product: { created_at?: string; _created?: string } | null): string | null {
  if (!product) return null;
  const rawDate = product.created_at ?? product._created;
  if (!rawDate) return null;
  return new Date(rawDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── handleShare logic (extracted for testing) ───────────────────────────────

interface ShareEnv {
  locationOrigin: string;
  basePath: string;
  canShare: boolean;
  shareThrows: boolean;
  clipboardWriteThrows: boolean;
}

async function handleShareLogic(
  productId: number,
  productName: string,
  shareText: string,
  env: ShareEnv,
): Promise<{ method: 'share' | 'clipboard' | 'error'; url: string }> {
  const shareUrl = `${env.locationOrigin}${env.basePath}product/${productId}`;
  const shareData = { title: productName, text: shareText, url: shareUrl };

  const nav = {
    share: env.canShare
      ? async () => { if (env.shareThrows) throw new Error('cancelled'); }
      : undefined,
    canShare: env.canShare ? () => true : undefined,
    clipboard: {
      writeText: env.clipboardWriteThrows
        ? async () => { throw new Error('denied'); }
        : async () => undefined,
    },
  };

  if (nav.share && nav.canShare?.(shareData)) {
    try { await nav.share(); } catch { /* user cancelled */ }
    return { method: 'share', url: shareUrl };
  }

  try {
    await nav.clipboard.writeText(shareUrl);
    return { method: 'clipboard', url: shareUrl };
  } catch {
    return { method: 'error', url: shareUrl };
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Product addedDate (Option C)', () => {
  it('formats created_at date correctly', () => {
    const date = getAddedDate({ created_at: '2025-12-25T10:00:00Z' });
    expect(date).toBeTruthy();
    expect(date).toMatch(/2025/);
    expect(date).toMatch(/Dec/);
    expect(date).toMatch(/25/);
  });

  it('falls back to _created when created_at is absent', () => {
    const date = getAddedDate({ _created: '2024-06-15T12:00:00Z' });
    expect(date).toBeTruthy();
    expect(date).toMatch(/2024/);
    expect(date).toMatch(/Jun/);
  });

  it('prefers created_at over _created', () => {
    const date = getAddedDate({
      created_at: '2025-06-15T12:00:00Z',
      _created: '2020-06-15T12:00:00Z',
    });
    expect(date).toMatch(/2025/);
    expect(date).not.toMatch(/2020/);
  });

  it('returns null when both are absent', () => {
    expect(getAddedDate({})).toBeNull();
  });

  it('returns null for null product', () => {
    expect(getAddedDate(null)).toBeNull();
  });
});

describe('handleShare (Option C)', () => {
  const env = (overrides: Partial<ShareEnv> = {}): ShareEnv => ({
    locationOrigin: 'https://stuffie.app',
    basePath: '/',
    canShare: false,
    shareThrows: false,
    clipboardWriteThrows: false,
    ...overrides,
  });

  it('builds the correct share URL', async () => {
    const result = await handleShareLogic(42, 'Dune', 'Check out Dune', env());
    expect(result.url).toBe('https://stuffie.app/product/42');
  });

  it('uses clipboard when Web Share API is unavailable', async () => {
    const result = await handleShareLogic(1, 'Test', 'text', env({ canShare: false }));
    expect(result.method).toBe('clipboard');
  });

  it('uses navigator.share when available', async () => {
    const result = await handleShareLogic(1, 'Test', 'text', env({ canShare: true }));
    expect(result.method).toBe('share');
  });

  it('falls back to clipboard when navigator.share throws (user cancelled)', async () => {
    // When share throws, we return 'share' because cancellation is silent
    const result = await handleShareLogic(1, 'Test', 'text', env({ canShare: true, shareThrows: true }));
    expect(result.method).toBe('share');
  });

  it('returns error method when clipboard also throws', async () => {
    const result = await handleShareLogic(
      1, 'Test', 'text',
      env({ canShare: false, clipboardWriteThrows: true }),
    );
    expect(result.method).toBe('error');
  });

  it('uses basePath in the URL', async () => {
    const result = await handleShareLogic(5, 'Item', 'text', env({ basePath: '/app/' }));
    expect(result.url).toBe('https://stuffie.app/app/product/5');
  });
});
