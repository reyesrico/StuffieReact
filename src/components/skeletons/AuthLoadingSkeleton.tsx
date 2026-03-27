import './Skeletons.scss';

/**
 * Skeleton loader for auth checking state
 * Shows while determining if user is logged in
 */
export function AuthLoadingSkeleton() {
  return (
    <div className="auth-skeleton">
      <div className="auth-skeleton__logo skeleton" />
      <div className="auth-skeleton__title skeleton" />
      <div className="auth-skeleton__subtitle skeleton" />
      <div className="auth-skeleton__spinner" />
    </div>
  );
}

export default AuthLoadingSkeleton;
