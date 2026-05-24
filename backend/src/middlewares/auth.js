const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express')

// Attach Clerk auth context to every request (does NOT require auth — just parses the token if present)
const clerkAuth = clerkMiddleware()

// Use on routes that require a logged-in user — returns 401 if no valid session
const requireUser = requireAuth()

// Returns the authenticated userId, or null for anonymous requests
function getUserId(req) {
  try {
    const { userId } = getAuth(req)
    return userId || null
  } catch {
    return null
  }
}

module.exports = { clerkAuth, requireUser, getUserId }
