const requestCounts = new Map();

const rateLimiter = (limit = 120, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    
    const clientData = requestCounts.get(ip);
    if (now > clientData.resetAt) {
      clientData.count = 1;
      clientData.resetAt = now + windowMs;
      return next();
    }
    
    clientData.count++;
    if (clientData.count > limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Cyber Cafe Portal rate limiter active. Please slow down.'
      });
    }
    next();
  };
};

module.exports = rateLimiter;