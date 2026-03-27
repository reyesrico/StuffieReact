import React from 'react';
import { render } from '@testing-library/react';

// NOTE: Full App test requires Node >= 20 due to react-router-dom v7
// This is a simplified test that verifies Jest and RTL are working

describe('App', () => {
  it('React Testing Library is working', () => {
    const { getByText } = render(<div>Hello Stuffie</div>);
    expect(getByText('Hello Stuffie')).toBeInTheDocument();
  });

  it.todo('renders full app with all providers (requires Node 20+)');
});
