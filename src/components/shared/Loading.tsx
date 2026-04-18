import React from 'react';
import './Loading.scss';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'skeleton';

export interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  message?: string;
  className?: string;
  // Skeleton-specific props
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const sizeMap: Record<LoadingSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const Loading = ({
  size = 'md',
  variant = 'spinner',
  message,
  className = '',
  width,
  height,
  lines = 1,
}: LoadingProps) => {
  const spinnerSize = sizeMap[size];

  if (variant === 'skeleton') {
    return (
      <div className={`stuffie-loading stuffie-loading--skeleton ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}
            className="stuffie-loading__skeleton-line"
            style={{
              width: typeof width === 'number' ? `${width}px` : width || '100%',
              height: typeof height === 'number' ? `${height}px` : height || '16px',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`stuffie-loading stuffie-loading--spinner ${className}`}>
      <div
        className="stuffie-loading__spinner"
        style={{ width: spinnerSize, height: spinnerSize }}
      />
      {message && <div className="stuffie-loading__message">{message}</div>}
    </div>
  );
};

export default Loading;
