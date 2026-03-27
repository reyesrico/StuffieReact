/**
 * Card Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Test Content</Card>);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply default elevated variant', () => {
    const { container } = render(<Card>Content</Card>);
    
    expect(container.firstChild).toHaveClass('stuffie-card--elevated');
  });

  it('should apply outlined variant', () => {
    const { container } = render(<Card variant="outlined">Content</Card>);
    
    expect(container.firstChild).toHaveClass('stuffie-card--outlined');
  });

  it('should apply filled variant', () => {
    const { container } = render(<Card variant="filled">Content</Card>);
    
    expect(container.firstChild).toHaveClass('stuffie-card--filled');
  });

  describe('padding', () => {
    it('should apply default md padding', () => {
      const { container } = render(<Card>Content</Card>);
      
      expect(container.firstChild).toHaveClass('stuffie-card--padding-md');
    });

    it('should apply sm padding', () => {
      const { container } = render(<Card padding="sm">Content</Card>);
      
      expect(container.firstChild).toHaveClass('stuffie-card--padding-sm');
    });

    it('should apply none padding', () => {
      const { container } = render(<Card padding="none">Content</Card>);
      
      expect(container.firstChild).toHaveClass('stuffie-card--padding-none');
    });
  });

  describe('interactions', () => {
    it('should apply hoverable class when hoverable', () => {
      const { container } = render(<Card hoverable>Content</Card>);
      
      expect(container.firstChild).toHaveClass('stuffie-card--hoverable');
    });

    it('should apply clickable class when clickable', () => {
      const { container } = render(<Card clickable onClick={() => {}}>Content</Card>);
      
      expect(container.firstChild).toHaveClass('stuffie-card--clickable');
    });

    it('should call onClick when clicked and clickable', () => {
      const handleClick = vi.fn();
      render(<Card clickable onClick={handleClick}>Content</Card>);
      
      fireEvent.click(screen.getByText('Content'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when not clickable', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Content</Card>);
      
      fireEvent.click(screen.getByText('Content'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('header and footer', () => {
    it('should render header when provided', () => {
      render(<Card header={<h2>Card Title</h2>}>Content</Card>);
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should render footer when provided', () => {
      render(<Card footer={<button>Action</button>}>Content</Card>);
      
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
