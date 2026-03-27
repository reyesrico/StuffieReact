import './Skeletons.scss';

interface ProductGridSkeletonProps {
  count?: number;
}

/**
 * Skeleton loader for the Product Grid
 * Shows placeholder cards while products load
 */
export function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
  return (
    <div className="product-grid-skeleton">
      {Array(count).fill(0).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`skeleton-card-${index}`} className="product-grid-skeleton__card">
          <div className="product-grid-skeleton__card-image skeleton" />
          <div className="product-grid-skeleton__card-title skeleton" />
          <div className="product-grid-skeleton__card-subtitle skeleton" />
          <div className="product-grid-skeleton__card-price skeleton" />
        </div>
      ))}
    </div>
  );
}

export default ProductGridSkeleton;
