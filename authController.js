const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { registerValidation, loginValidation } = require('../utils/validation');

const prisma = new PrismaClient();

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = registerValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { username, email, password, role = 'MEMBER' } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
          code: 'USER_EXISTS'
        }
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'User with this email or username already exists',
          code: 'USER_EXISTS'
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during registration',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid JWT token',
          code: 'INVALID_TOKEN'
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during login',
        code: 'LOGIN_ERROR'
      }
    });
  }
};

/**
 * Verify JWT token
 * @route GET /api/auth/verify
 * @access Protected
 */
const verifyToken = async (req, res) => {
  try {
    // User data is already available from auth middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during token verification',
        code: 'TOKEN_VERIFICATION_ERROR'
      }
    });
  }
};

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Protected
 */
const logout = async (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // This endpoint exists for consistency and future token blacklisting if needed
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
};

module.exports = {
  register,
  login,
  verifyToken,
  logout
};
