# Cache Testing Guide

This document provides step-by-step instructions for testing all cache scenarios.

## Prerequisites

1. Ensure the application is running: `npm start`
2. Open browser DevTools (F12)
3. Have a test user account ready

## Test Scenarios

### Test 1: First Load (No Cache)

**Goal:** Verify that data is fetched from API when no cache exists.

**Steps:**
1. Clear browser localStorage: In DevTools Console, run `localStorage.clear()`
2. Log out if logged in
3. Log in with a test user
4. Observe the loading state

**Expected Result:**
- Loading indicator displays
- Products are fetched from API
- Products are displayed
- In DevTools > Application > Local Storage, you should see cache entries created:
  - `cache_products_[email]`
  - `cache_user_[email]`

**Verification:**
```javascript
// In DevTools Console
Object.keys(localStorage).filter(k => k.startsWith('cache_'))
// Should show cache keys
```

---

### Test 2: Cached Data (Fresh)

**Goal:** Verify that fresh cached data is displayed instantly.

**Steps:**
1. Complete Test 1 (so cache exists)
2. Refresh the page (F5)
3. Observe the page load

**Expected Result:**
- Products appear **instantly** (no loading state for products)
- Background refresh may happen silently
- No visible delay in displaying products

**Verification:**
```javascript
// In DevTools Console
JSON.parse(localStorage.getItem('cache_products_[your-email]'))
// Should show your products data
```

---

### Test 3: Expired Cache

**Goal:** Verify that expired cache is treated as no cache.

**Steps:**
1. In DevTools Console, manually expire the cache:
```javascript
const key = Object.keys(localStorage).find(k => k.startsWith('cache_products_'));
const entry = JSON.parse(localStorage.getItem(key));
entry.timestamp = Date.now() - (31 * 60 * 1000); // 31 minutes ago
localStorage.setItem(key, JSON.stringify(entry));
```
2. Refresh the page

**Expected Result:**
- Loading indicator displays (cache expired)
- Fresh data fetched from API
- Cache updated with new timestamp

**Verification:**
```javascript
// Check cache timestamp
const key = Object.keys(localStorage).find(k => k.startsWith('cache_products_'));
const entry = JSON.parse(localStorage.getItem(key));
const age = Date.now() - entry.timestamp;
console.log('Cache age (minutes):', age / 60000); // Should be < 1
```

---

### Test 4: Manual Refresh

**Goal:** Verify the refresh button bypasses cache and fetches fresh data.

**Steps:**
1. Navigate to Products page
2. Click the "Refresh Products" button
3. Observe the button state and data update

**Expected Result:**
- Button text changes to "Refreshing..."
- Button becomes disabled during refresh
- Fresh data fetched from API
- Cache updated
- Button returns to "Refresh Products" when complete

**Verification:**
- Check browser Network tab for API calls
- Verify cache timestamp is updated (same as Test 3 verification)

---

### Test 5: API Failure with Cache Fallback

**Goal:** Verify that stale cache is used when API fails.

**Steps:**
1. Ensure you have cached data (complete Test 1)
2. Simulate API failure by disconnecting from internet OR:
   - In DevTools > Network tab, set throttling to "Offline"
3. Expire the cache (same as Test 3 step 1)
4. Refresh the page

**Expected Result:**
- Loading state briefly shows
- Stale cached data is displayed (better than nothing)
- No error message shown
- Console may show warning: "API failed for..., using stale cache"

**Verification:**
```javascript
// In DevTools Console, check if stale cache is being used
const key = Object.keys(localStorage).find(k => k.startsWith('cache_products_'));
const entry = JSON.parse(localStorage.getItem(key));
const isExpired = (Date.now() - entry.timestamp) > entry.expiresIn;
console.log('Cache expired:', isExpired);
console.log('Still showing data:', !!entry.data);
// Both should be true
```

---

### Test 6: No Cache + API Failure

**Goal:** Verify error is shown only when both cache and API fail.

**Steps:**
1. Clear localStorage: `localStorage.clear()`
2. In DevTools > Network tab, set throttling to "Offline"
3. Try to log in or load products

**Expected Result:**
- Error message is displayed
- No data shown
- Clear indication of failure

**Verification:**
- Check for error message in UI
- Verify localStorage is empty for cache keys

---

### Test 7: Cache Expiration Times

**Goal:** Verify different data types have correct expiration times.

**Steps:**
1. Complete Test 1
2. Inspect cache entries

**Verification:**
```javascript
// In DevTools Console
Object.keys(localStorage)
  .filter(k => k.startsWith('cache_'))
  .forEach(key => {
    const entry = JSON.parse(localStorage.getItem(key));
    const expiresInMinutes = entry.expiresIn / 60000;
    console.log(key, '- Expires in:', expiresInMinutes, 'minutes');
  });

// Expected:
// cache_products_* - Expires in: 30 minutes
// cache_user_* - Expires in: 120 minutes
```

---

### Test 8: Background Refresh

**Goal:** Verify that background refresh updates data without interrupting user.

**Steps:**
1. Complete Test 1 (cache exists)
2. On server side, modify some product data (e.g., add a new product)
3. Refresh the page

**Expected Result:**
- Cached products display immediately
- Background refresh fetches new data
- UI updates with new data after background refresh completes
- No loading spinner shown during background refresh
- Only "isRefreshing" indicator may be visible

**Verification:**
- Watch Network tab for API call after initial page load
- Verify UI updates with new data

---

### Test 9: Logout Cache Clearing

**Goal:** Verify cache is cleared on logout for security.

**Steps:**
1. Complete Test 1 (cache exists)
2. Verify cache exists:
```javascript
Object.keys(localStorage).filter(k => k.startsWith('cache_'))
```
3. Log out
4. Check cache again

**Expected Result:**
- All cache entries starting with `cache_` are removed
- localStorage may still contain `username` and `picture` (until removed by logout)
- Cache is completely cleared

**Verification:**
```javascript
// After logout
Object.keys(localStorage).filter(k => k.startsWith('cache_'))
// Should return []
```

---

### Test 10: Multi-User Cache Isolation

**Goal:** Verify each user has isolated cache.

**Steps:**
1. Log in as User A
2. Note the cache key:
```javascript
Object.keys(localStorage).filter(k => k.startsWith('cache_products_'))
```
3. Log out
4. Log in as User B
5. Check cache key again

**Expected Result:**
- User A cache: `cache_products_userA@example.com`
- User B cache: `cache_products_userB@example.com`
- Different users have different cache keys
- No data leakage between users

---

## Performance Testing

### Measure Cache Impact

**Steps:**
1. Clear cache: `localStorage.clear()`
2. Open DevTools > Performance tab
3. Start recording
4. Load the products page
5. Stop recording
6. Note the load time

7. Refresh the page (cache now exists)
8. Start recording again
9. Load the products page
10. Stop recording
11. Compare load times

**Expected Result:**
- First load: Slower (API call required)
- Second load: Much faster (instant from cache)
- Significant performance improvement

---

## Automated Testing

To run automated tests:

```bash
# Run cache utility tests
npm test -- src/utils/cache.test.ts

# Run hook tests
npm test -- src/hooks/useCachedData.test.ts
```

---

## Troubleshooting

### Cache not working
1. Check if localStorage is available: `typeof localStorage !== 'undefined'`
2. Check browser privacy settings (private browsing may disable localStorage)
3. Check localStorage size limit (typically 5-10MB)

### Stale data showing
1. Click the manual refresh button
2. Clear cache: `localStorage.clear()`
3. Check if API is returning correct data

### Performance issues
1. Check cache size: 
```javascript
JSON.stringify(localStorage).length / 1024 + ' KB'
```
2. Clear old cache entries
3. Reduce cache expiration times if needed

---

## Success Criteria

All tests pass when:
- ✅ First load fetches from API and caches data
- ✅ Subsequent loads display cache instantly
- ✅ Expired cache is refreshed
- ✅ Manual refresh button works
- ✅ API failures fall back to stale cache
- ✅ Total API failure shows error
- ✅ Correct expiration times (30 min products, 2 hr user)
- ✅ Background refresh works silently
- ✅ Logout clears all cache
- ✅ Users have isolated caches
- ✅ Significant performance improvement with cache
