const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT token
 * Adds user information to req.user if token is valid
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided, access denied',
          code: 'NO_TOKEN'
        }
      });
    }

    // Check if token starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token format. Use Bearer <token>',
          code: 'INVALID_TOKEN_FORMAT'
        }
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided, access denied',
          code: 'NO_TOKEN'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during authentication',
        code: 'AUTH_SERVER_ERROR'
      }
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user information to req.user if token is valid, but doesn't block if no token
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user info
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();

  } catch (error) {
    // If token is invalid, continue without user info
    req.user = null;
    next();
  }
};

module.exports = { auth, optionalAuth };