import './Skeletons.scss';

/**
 * Skeleton loader for the Sidebar component
 * Shows placeholder UI while sidebar data loads
 */
export function SidebarSkeleton() {
  return (
    <div className="sidebar-skeleton">
      <div className="sidebar-skeleton__avatar skeleton" />
      <div className="sidebar-skeleton__welcome skeleton" />
      
      <div className="sidebar-skeleton__menu">
        <div className="sidebar-skeleton__menu-item skeleton" />
        <div className="sidebar-skeleton__menu-item skeleton" />
        <div className="sidebar-skeleton__menu-item skeleton" />
        <div className="sidebar-skeleton__menu-item skeleton" />
        <div className="sidebar-skeleton__menu-item skeleton" />
      </div>
    </div>
  );
}

export default SidebarSkeleton;
