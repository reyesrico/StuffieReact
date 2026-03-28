/**
 * ErrorState Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../config/i18n';
import ErrorState from './ErrorState';

const renderWithI18n = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe('ErrorState', () => {
  it('should render message', () => {
    renderWithI18n(<ErrorState message="Failed to load data" />);
    
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should show default error title', () => {
    renderWithI18n(<ErrorState message="Error message" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show custom title when provided', () => {
    renderWithI18n(<ErrorState title="Custom Error" message="Error message" />);
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  describe('severity variants', () => {
    it('should apply error severity by default', () => {
      const { container } = renderWithI18n(<ErrorState message="Error" />);
      
      expect(container.firstChild).toHaveClass('error-state--error');
    });

    it('should apply warning severity', () => {
      const { container } = renderWithI18n(<ErrorState message="Warning" severity="warning" />);
      
      expect(container.firstChild).toHaveClass('error-state--warning');
    });

    it('should apply info severity', () => {
      const { container } = renderWithI18n(<ErrorState message="Info" severity="info" />);
      
      expect(container.firstChild).toHaveClass('error-state--info');
    });

    it('should show Warning title for warning severity', () => {
      renderWithI18n(<ErrorState message="Something" severity="warning" />);
      
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should show Information title for info severity', () => {
      renderWithI18n(<ErrorState message="Something" severity="info" />);
      
      expect(screen.getByText('Information')).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('should show retry button when onRetry provided', () => {
      renderWithI18n(<ErrorState message="Error" onRetry={() => {}} />);
      
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', () => {
      const handleRetry = vi.fn();
      renderWithI18n(<ErrorState message="Error" onRetry={handleRetry} />);
      
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should not show retry button when onRetry not provided', () => {
      renderWithI18n(<ErrorState message="Error" />);
      
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
