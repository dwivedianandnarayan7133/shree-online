const adShieldGuard = (req, res, next) => {
  // Security headers to prevent malicious popups, frame injections, and unauthorized redirects
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-AdShield-Protected', 'Active');
  next();
};

module.exports = adShieldGuard;