import './Skeletons.scss';

/**
 * Skeleton loader for the Header component
 * Shows placeholder UI while header data loads
 */
export function HeaderSkeleton() {
  return (
    <div className="header-skeleton">
      <div className="header-skeleton__logo skeleton" />
      
      <div className="header-skeleton__nav">
        <div className="header-skeleton__nav-item skeleton" />
        <div className="header-skeleton__nav-item skeleton" />
        <div className="header-skeleton__nav-item skeleton" />
      </div>
      
      <div className="header-skeleton__user">
        <div className="header-skeleton__user-name skeleton" />
        <div className="header-skeleton__user-avatar skeleton" />
      </div>
    </div>
  );
}

export default HeaderSkeleton;
