const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Check for Authorization header (case-insensitive)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the Authorization header format
  if (typeof authHeader !== 'string') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  // Split the header into parts
  const parts = authHeader.split(' ');
  
  // Check if it follows "Bearer <token>" format
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ message: 'Authorization header must be: Bearer <token>' });
  }

  const token = parts[1];

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Handle different JWT error types
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          error: err.message 
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          message: 'Invalid token',
          error: err.message 
        });
      }
      
      // Generic error for other cases
      return res.status(403).json({ 
        message: 'Failed to authenticate token',
        error: err.message 
      });
    }
    
    // Attach the decoded payload to the request object
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;