import React from 'react';
import './ErrorState.scss';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorStateProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  className?: string;
}

const ErrorState = ({
  title,
  message,
  severity = 'error',
  onRetry,
  className = '',
}: ErrorStateProps) => {
  const defaultTitle = severity === 'error' 
    ? 'Something went wrong' 
    : severity === 'warning' 
      ? 'Warning' 
      : 'Information';

  return (
    <div className={`error-state error-state--${severity} ${className}`}>
      <div className="error-state__icon">
        {severity === 'error' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        {severity === 'warning' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M5.07 19H18.93C20.47 19 21.45 17.33 20.68 16L13.75 4C12.98 2.67 11.02 2.67 10.25 4L3.32 16C2.55 17.33 3.53 19 5.07 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {severity === 'info' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <div className="error-state__content">
        <h4 className="error-state__title">{title || defaultTitle}</h4>
        <p className="error-state__message">{message}</p>
      </div>
      {onRetry && (
        <button className="error-state__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
