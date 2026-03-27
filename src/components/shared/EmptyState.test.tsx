/**
 * EmptyState Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No items found" />);
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <EmptyState 
        title="No items" 
        description="Add your first item to get started" 
      />
    );
    
    expect(screen.getByText('Add your first item to get started')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    render(<EmptyState title="No items" />);
    
    expect(screen.queryByRole('paragraph')).toBeNull();
  });

  it('should render icon when provided', () => {
    render(
      <EmptyState 
        title="No items" 
        icon={<span data-testid="custom-icon">📦</span>} 
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    render(
      <EmptyState 
        title="No items" 
        action={<button>Add Item</button>} 
      />
    );
    
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState title="No items" className="my-custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
