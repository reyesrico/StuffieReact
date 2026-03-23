import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading, { getSize } from './Loading';

describe('Loading', () => {
  it('renders without crashing', () => {
    const { container } = render(<Loading size="md" message="Loading..." />);
    expect(container.querySelector('.stuffie-loading')).toBeInTheDocument();
  });

  it('displays the message when provided', () => {
    render(<Loading size="md" message="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('getSize returns correct sizes', () => {
    expect(getSize('sm')).toEqual(8);
    expect(getSize('md')).toEqual(16);
    expect(getSize('lg')).toEqual(32);
    expect(getSize('xl')).toEqual(64);
  });
});
