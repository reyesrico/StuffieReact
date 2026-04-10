// Jest DOM matchers for better test assertions
// https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom doesn't implement WebCrypto (crypto.subtle). Patch it with Node's
// native implementation so tests that use pbkdf2v2 / verifyPbkdf2v2 work.
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false });
}

// Note: Enzyme was removed because:
// 1. It's deprecated and unmaintained
// 2. The enzyme-adapter-react-16 doesn't work with React 18
// 3. undici (cheerio dependency) requires browser globals not available in Jest
// 
// All tests should use React Testing Library instead.
// Legacy tests using enzyme.shallow() need to be migrated.
