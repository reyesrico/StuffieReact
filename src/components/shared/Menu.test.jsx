import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from './Menu';

describe('Menu', () => {
  const mockLabel = (isOpen) => <span data-testid="menu-label">{isOpen ? 'Open' : 'Closed'}</span>;

  it('renders without crashing', () => {
    const { container } = render(<Menu label={mockLabel}><div>Menu content</div></Menu>);
    expect(container.querySelector('.dropdown')).toBeInTheDocument();
  });

  it('toggles open state when clicked', () => {
    render(<Menu label={mockLabel}><div>Menu content</div></Menu>);
    
    // Initially closed
    expect(screen.getByText('Closed')).toBeInTheDocument();
    
    // Click to open
    fireEvent.click(screen.getByTestId('menu-label'));
    expect(screen.getByText('Open')).toBeInTheDocument();
    
    // Click again to close
    fireEvent.click(screen.getByTestId('menu-label'));
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});
