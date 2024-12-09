
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization; // Extract token from `Authorization` header

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Access denied. No token provided',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: 'Token expired',
              });
        } 
      });;
    req.user = decoded; // Attach decoded user info to the request object
    next(); // Proceed to the next middleware or route
  } catch (err) {
    res.status(401).json({
      status: false,
      message: err.message || 'Unauthorized access',
    });
  }
};

module.exports = authMiddleware;
