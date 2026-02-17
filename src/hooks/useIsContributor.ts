import { useReviewPermissions } from './useReviewPermissions';
import { useStockMediaPermissions } from './useStockMediaPermissions';
import { useCurrentUser } from './useCurrentUser';

/**
 * Check if the current user is a contributor (has review or stock media permissions)
 * Returns true if user is admin or has any content creation permission
 */
export function useIsContributor() {
  const { user } = useCurrentUser();
  const { hasPermission: hasReviewPermission, isAdmin: isReviewAdmin } = useReviewPermissions();
  const { hasPermission: hasStockMediaPermission, isAdmin: isStockMediaAdmin } = useStockMediaPermissions();

  if (!user) return false;

  // Admin is always a contributor
  if (isReviewAdmin || isStockMediaAdmin) return true;

  // Has any content creation permission
  return hasReviewPermission || hasStockMediaPermission;
}
