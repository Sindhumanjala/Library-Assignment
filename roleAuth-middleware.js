/**
 * Role-based authorization middleware
 * Checks if user has the required role to access a route
 */
const roleAuth = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }
        });
      }

      // Convert single role to array for consistency
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // Check if user has any of the required roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Insufficient permissions to access this resource',
            code: 'INSUFFICIENT_PERMISSIONS',
            details: {
              userRole: req.user.role,
              requiredRoles: roles
            }
          }
        });
      }

      // User has required role, proceed
      next();

    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error during authorization',
          code: 'AUTH_SERVER_ERROR'
        }
      });
    }
  };
};

/**
 * Admin-only middleware (shortcut for roleAuth(['ADMIN']))
 */
const adminOnly = roleAuth(['ADMIN']);

/**
 * Member or Admin middleware (shortcut for roleAuth(['MEMBER', 'ADMIN']))
 */
const memberOrAdmin = roleAuth(['MEMBER', 'ADMIN']);

/**
 * Self or Admin middleware
 * Allows access if user is accessing their own resource or is an admin
 */
const selfOrAdmin = (getUserIdFromRequest = (req) => req.params.userId || req.params.id) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }
        });
      }

      const requestedUserId = getUserIdFromRequest(req);
      const currentUserId = req.user.userId;
      const userRole = req.user.role;

      // Allow if user is admin or accessing their own resource
      if (userRole === 'ADMIN' || currentUserId === requestedUserId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only access your own resources or need admin privileges',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });

    } catch (error) {
      console.error('Self or admin authorization error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Server error during authorization',
          code: 'AUTH_SERVER_ERROR'
        }
      });
    }
  };
};

module.exports = {
  roleAuth,
  adminOnly,
  memberOrAdmin,
  selfOrAdmin
};