import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  it('renders without crashing', () => {
    const { container } = render(<Loading size="md" message="Loading..." />);
    expect(container.querySelector('.stuffie-loading')).toBeInTheDocument();
  });

  it('displays the message when provided', () => {
    render(<Loading size="md" message="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });
});
