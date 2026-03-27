import './Skeletons.scss';

interface ContentSkeletonProps {
  rows?: number;
}

/**
 * Generic content skeleton loader
 * Shows placeholder rows while content loads
 */
export function ContentSkeleton({ rows = 5 }: ContentSkeletonProps) {
  return (
    <div className="content-skeleton">
      <div className="content-skeleton__header">
        <div className="content-skeleton__header-title skeleton" />
        <div className="content-skeleton__header-action skeleton" />
      </div>
      
      <div className="content-skeleton__body">
        {Array(rows).fill(0).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`skeleton-row-${index}`} className="content-skeleton__body-row">
            <div className="content-skeleton__body-row-avatar skeleton" />
            <div className="content-skeleton__body-row-content">
              <div className="content-skeleton__body-row-content-line1 skeleton" />
              <div className="content-skeleton__body-row-content-line2 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentSkeleton;
