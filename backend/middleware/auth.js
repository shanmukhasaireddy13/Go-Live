/**
 * Authentication Middleware
 * Validates GitHub or Bearer token presence for protected routes.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace("Bearer ", "").trim() : null;
  const userParam = req.body?.user || req.query?.user;

  if (!token && !userParam) {
    return res.status(401).json({
      error: "Authentication required: Please connect with your GitHub account.",
      authenticated: false,
    });
  }

  req.authToken = token;
  next();
}

module.exports = {
  requireAuth,
};
