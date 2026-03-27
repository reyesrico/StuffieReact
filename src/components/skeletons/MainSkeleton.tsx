import HeaderSkeleton from './HeaderSkeleton';
import SidebarSkeleton from './SidebarSkeleton';
import ProductGridSkeleton from './ProductGridSkeleton';

import './Skeletons.scss';

/**
 * Full-page skeleton for the Main layout
 * Shows placeholder UI while the main app loads
 */
export function MainSkeleton() {
  return (
    <div className="main-skeleton">
      <div className="main-skeleton__header">
        <HeaderSkeleton />
      </div>
      
      <div className="main-skeleton__body">
        <div className="main-skeleton__sidebar">
          <SidebarSkeleton />
        </div>
        
        <div className="main-skeleton__content">
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}

export default MainSkeleton;
