// Jest DOM matchers for better test assertions
// https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Note: Enzyme was removed because:
// 1. It's deprecated and unmaintained
// 2. The enzyme-adapter-react-16 doesn't work with React 18
// 3. undici (cheerio dependency) requires browser globals not available in Jest
// 
// All tests should use React Testing Library instead.
// Legacy tests using enzyme.shallow() need to be migrated.
