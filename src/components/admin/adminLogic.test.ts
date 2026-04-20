/**
 * Options A & F — Admin catalog logic and user management
 *
 * Tests for:
 *   Option A: duplicate detection in Add Category / Add Subcategory
 *             auto-ID computation (nextCatId / nextSubId)
 *             pending image approval guard
 *   Option F: pending user filtering and sorting
 *             admin Users tab badge count (pending only)
 *             pending products text filter
 *             bulk approve eligibility (button only shown for 2+ items)
 */
import { describe, it, expect } from 'vitest';
import type User from '../../components/types/User';
import type Product from '../../components/types/Product';
import type Category from '../../components/types/Category';
import type Subcategory from '../../components/types/Subcategory';

// ─── Helpers extracted from Admin.tsx / CatalogPanel ─────────────────────────

function nextCatId(categories: Category[]): number {
  const ids = categories.map(c => c.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function nextSubId(catId: number, subcategories: Subcategory[]): number {
  const base = catId * 100;
  const existing = subcategories.filter(s => s.category_id === catId).map(s => s.id);
  if (!existing.length) return base + 1;
  return Math.max(...existing) + 1;
}

function isDuplicateCat(name: string, categories: Category[]): boolean {
  return name.trim() !== '' &&
    categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
}

function isDuplicateSub(name: string, catId: number, subcategories: Subcategory[]): boolean {
  return name.trim() !== '' &&
    subcategories
      .filter(s => s.category_id === catId)
      .some(s => s.name.toLowerCase() === name.trim().toLowerCase());
}

// ─── Option A: image approval guard ──────────────────────────────────────────

function canApproveImage(product: Product): boolean {
  return !!(product._id && product.pending_image_key);
}

// ─── Option F: pending users ──────────────────────────────────────────────────

function getPendingUsers(users: User[]): User[] {
  return users.filter(u => u.status === 'pending');
}

function sortUsersPendingFirst(users: User[]): User[] {
  return users.slice().sort(
    (a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1)
  );
}

function filterUsers(users: User[], search: string): User[] {
  const lower = search.trim().toLowerCase();
  if (!lower) return users;
  return users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(lower)
  );
}

function filterPendingProducts(products: Product[], filter: string): Product[] {
  const lower = filter.trim().toLowerCase();
  if (!lower) return products;
  return products.filter(p => p.name?.toLowerCase().includes(lower));
}

function showBulkApproveButton(productsWithPendingImage: Product[]): boolean {
  return productsWithPendingImage.length > 1;
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const cat = (id: number, name: string): Category => ({ id, name } as Category);
const sub = (id: number, name: string, catId: number): Subcategory =>
  ({ id, name, category_id: catId } as Subcategory);

const categories: Category[] = [cat(1, 'Books'), cat(2, 'Games'), cat(10, 'Music')];
const subcategories: Subcategory[] = [
  sub(101, 'Fiction', 1),
  sub(102, 'Non-Fiction', 1),
  sub(201, 'Board Games', 2),
];

const makeUser = (id: number, status: 'active' | 'pending' = 'active'): User =>
  ({ id, first_name: `User${id}`, last_name: 'Test', email: `u${id}@test.com`, status } as User);

const makeProduct = (id: number, name: string, pendingKey?: string): Product =>
  ({
    id,
    _id: `oid-${id}`,
    name,
    pending_image_key: pendingKey,
  } as Product);

// ─── Auto-ID tests (Option A) ─────────────────────────────────────────────────

describe('nextCatId (Option A)', () => {
  it('returns 1 for empty catalog', () => {
    expect(nextCatId([])).toBe(1);
  });

  it('returns max + 1', () => {
    expect(nextCatId(categories)).toBe(11);
  });

  it('handles single category', () => {
    expect(nextCatId([cat(5, 'X')])).toBe(6);
  });
});

describe('nextSubId (Option A)', () => {
  it('returns base+1 when category has no subs yet', () => {
    expect(nextSubId(3, subcategories)).toBe(301);
  });

  it('returns max+1 within the category', () => {
    // cat 1 has subs 101 and 102
    expect(nextSubId(1, subcategories)).toBe(103);
  });

  it('returns base+1 when subcategories list is empty', () => {
    expect(nextSubId(2, [])).toBe(201);
  });
});

// ─── Duplicate detection (Option A) ──────────────────────────────────────────

describe('isDuplicateCat (Option A)', () => {
  it('detects exact match (case-insensitive)', () => {
    expect(isDuplicateCat('books', categories)).toBe(true);
    expect(isDuplicateCat('BOOKS', categories)).toBe(true);
    expect(isDuplicateCat('Books', categories)).toBe(true);
  });

  it('returns false for a new unique name', () => {
    expect(isDuplicateCat('Sports', categories)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isDuplicateCat('', categories)).toBe(false);
  });

  it('ignores leading/trailing whitespace', () => {
    expect(isDuplicateCat('  books  ', categories)).toBe(true);
  });
});

describe('isDuplicateSub (Option A)', () => {
  it('detects duplicate within the same category', () => {
    expect(isDuplicateSub('Fiction', 1, subcategories)).toBe(true);
  });

  it('does not flag same name in different category', () => {
    // "Fiction" only exists under catId 1, not catId 2
    expect(isDuplicateSub('Fiction', 2, subcategories)).toBe(false);
  });

  it('returns false for unique name', () => {
    expect(isDuplicateSub('Biography', 1, subcategories)).toBe(false);
  });

  it('returns false for empty name', () => {
    expect(isDuplicateSub('', 1, subcategories)).toBe(false);
  });
});

// ─── Image approval guard (Option A) ─────────────────────────────────────────

describe('canApproveImage (Option A)', () => {
  it('returns true when product has _id and pending_image_key', () => {
    expect(canApproveImage(makeProduct(1, 'Item', 'key/123'))).toBe(true);
  });

  it('returns false when pending_image_key is missing', () => {
    expect(canApproveImage(makeProduct(1, 'Item', undefined))).toBe(false);
  });

  it('returns false when _id is missing', () => {
    const p = { id: 1, name: 'Item', pending_image_key: 'key/123' } as Product;
    expect(canApproveImage(p)).toBe(false);
  });
});

// ─── Pending users badge (Option F) ──────────────────────────────────────────

describe('getPendingUsers (Option F)', () => {
  const users = [makeUser(1, 'active'), makeUser(2, 'pending'), makeUser(3, 'active'), makeUser(4, 'pending')];

  it('returns only pending users', () => {
    const pending = getPendingUsers(users);
    expect(pending).toHaveLength(2);
    expect(pending.every(u => u.status === 'pending')).toBe(true);
  });

  it('returns empty array when no pending users', () => {
    const activeOnly = [makeUser(1, 'active'), makeUser(2, 'active')];
    expect(getPendingUsers(activeOnly)).toHaveLength(0);
  });
});

// ─── Sort pending first (Option F) ───────────────────────────────────────────

describe('sortUsersPendingFirst (Option F)', () => {
  it('places pending users before active users', () => {
    const mixed = [makeUser(1, 'active'), makeUser(2, 'pending'), makeUser(3, 'active'), makeUser(4, 'pending')];
    const sorted = sortUsersPendingFirst(mixed);
    expect(sorted[0].status).toBe('pending');
    expect(sorted[1].status).toBe('pending');
    expect(sorted[2].status).toBe('active');
    expect(sorted[3].status).toBe('active');
  });

  it('does not mutate original array', () => {
    const original = [makeUser(1, 'active'), makeUser(2, 'pending')];
    sortUsersPendingFirst(original);
    expect(original[0].status).toBe('active');
  });

  it('preserves order when all are active', () => {
    const allActive = [makeUser(1, 'active'), makeUser(2, 'active')];
    const sorted = sortUsersPendingFirst(allActive);
    expect(sorted.map(u => u.id)).toEqual([1, 2]);
  });
});

// ─── User search filter (Option F) ───────────────────────────────────────────

describe('filterUsers (Option F)', () => {
  const users = [
    { ...makeUser(1), first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com' },
    { ...makeUser(2), first_name: 'Bob', last_name: 'Jones', email: 'bob@test.com' },
    { ...makeUser(3), first_name: 'Carlos', last_name: 'Smith', email: 'carlos@test.com' },
  ];

  it('returns all users when search is empty', () => {
    expect(filterUsers(users, '')).toHaveLength(3);
  });

  it('filters by first name (case-insensitive)', () => {
    expect(filterUsers(users, 'alice')).toHaveLength(1);
    expect(filterUsers(users, 'ALICE')).toHaveLength(1);
  });

  it('filters by last name', () => {
    expect(filterUsers(users, 'smith')).toHaveLength(2);
  });

  it('filters by email', () => {
    expect(filterUsers(users, 'bob@')).toHaveLength(1);
  });

  it('returns empty array when no match', () => {
    expect(filterUsers(users, 'zzznotfound')).toHaveLength(0);
  });
});

// ─── Pending products text filter (Option F) ─────────────────────────────────

describe('filterPendingProducts (Option F)', () => {
  const pending = [
    makeProduct(1, 'Guitar'),
    makeProduct(2, 'Bass Guitar'),
    makeProduct(3, 'Drums'),
  ];

  it('returns all products when filter is empty', () => {
    expect(filterPendingProducts(pending, '')).toHaveLength(3);
  });

  it('filters case-insensitively', () => {
    expect(filterPendingProducts(pending, 'GUITAR')).toHaveLength(2);
  });

  it('matches partial name', () => {
    expect(filterPendingProducts(pending, 'rum')).toHaveLength(1);
  });

  it('returns empty when no match', () => {
    expect(filterPendingProducts(pending, 'piano')).toHaveLength(0);
  });
});

// ─── Bulk approve button visibility (Option F) ───────────────────────────────

describe('showBulkApproveButton (Option F)', () => {
  it('is hidden when 0 items', () => {
    expect(showBulkApproveButton([])).toBe(false);
  });

  it('is hidden when only 1 item', () => {
    expect(showBulkApproveButton([makeProduct(1, 'Item', 'key')])).toBe(false);
  });

  it('is shown when 2+ items', () => {
    expect(showBulkApproveButton([makeProduct(1, 'A', 'k1'), makeProduct(2, 'B', 'k2')])).toBe(true);
  });
});
