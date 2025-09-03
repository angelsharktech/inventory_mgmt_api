const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/User');

dotenv.config();

exports.authenticateToken = (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
};


exports.protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    // 4. Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};