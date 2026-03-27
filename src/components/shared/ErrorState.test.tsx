/**
 * ErrorState Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('should render message', () => {
    render(<ErrorState message="Failed to load data" />);
    
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should show default error title', () => {
    render(<ErrorState message="Error message" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show custom title when provided', () => {
    render(<ErrorState title="Custom Error" message="Error message" />);
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  describe('severity variants', () => {
    it('should apply error severity by default', () => {
      const { container } = render(<ErrorState message="Error" />);
      
      expect(container.firstChild).toHaveClass('error-state--error');
    });

    it('should apply warning severity', () => {
      const { container } = render(<ErrorState message="Warning" severity="warning" />);
      
      expect(container.firstChild).toHaveClass('error-state--warning');
    });

    it('should apply info severity', () => {
      const { container } = render(<ErrorState message="Info" severity="info" />);
      
      expect(container.firstChild).toHaveClass('error-state--info');
    });

    it('should show Warning title for warning severity', () => {
      render(<ErrorState message="Something" severity="warning" />);
      
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should show Information title for info severity', () => {
      render(<ErrorState message="Something" severity="info" />);
      
      expect(screen.getByText('Information')).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('should show retry button when onRetry provided', () => {
      render(<ErrorState message="Error" onRetry={() => {}} />);
      
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', () => {
      const handleRetry = vi.fn();
      render(<ErrorState message="Error" onRetry={handleRetry} />);
      
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should not show retry button when onRetry not provided', () => {
      render(<ErrorState message="Error" />);
      
      expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ErrorState message="Error" className="my-error-class" />
    );
    
    expect(container.firstChild).toHaveClass('my-error-class');
  });
});
