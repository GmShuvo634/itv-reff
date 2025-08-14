import { NextRequest, NextResponse } from 'next/server';
import { 
  getClientIP, 
  generateDeviceFingerprint, 
  checkRateLimit, 
  validateSession,
  getSecurityHeaders,
  logActivity
} from './security';

interface SecurityMiddlewareOptions {
  requireAuth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  checkSuspiciousActivity?: boolean;
}

export async function securityMiddleware(
  request: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<{ allowed: boolean; response?: NextResponse; userId?: string }> {
  const {
    requireAuth = false,
    rateLimit,
    checkSuspiciousActivity = true
  } = options;

  // Get client information
  const clientIP = getClientIP(request);
  const deviceFingerprint = generateDeviceFingerprint(request);

  // Apply rate limiting
  if (rateLimit) {
    const rateLimitKey = `${clientIP}:${deviceFingerprint}`;
    const rateLimitResult = checkRateLimit(
      rateLimitKey,
      rateLimit.maxRequests,
      rateLimit.windowMs
    );

    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              ...getSecurityHeaders()
            }
          }
        )
      };
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateLimit.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
  }

  // Validate session if authentication is required
  if (requireAuth) {
    const isValidSession = validateSession(request);
    
    if (!isValidSession) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Invalid session' },
          { 
            status: 401,
            headers: getSecurityHeaders()
          }
        )
      };
    }

    // Extract user ID from token (this would be implemented with JWT verification)
    const token = request.cookies.get('auth-token')?.value;
    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { 
            status: 401,
            headers: getSecurityHeaders()
          }
        )
      };
    }

    // Log user activity
    logActivity({
      userId,
      action: request.method,
      timestamp: new Date(),
      ip: clientIP,
      device: deviceFingerprint,
      metadata: {
        url: request.url,
        userAgent: request.headers.get('user-agent')
      }
    });

    // Check for suspicious activity
    if (checkSuspiciousActivity) {
      const suspiciousActivity = await checkForSuspiciousActivity(userId, clientIP, deviceFingerprint);
      
      if (suspiciousActivity.isSuspicious) {
        // Log suspicious activity
        console.warn(`Suspicious activity detected for user ${userId}:`, suspiciousActivity.reasons);
        
        // Depending on severity, you might want to block the request or flag the account
        if (suspiciousActivity.severity === 'high') {
          return {
            allowed: false,
            response: NextResponse.json(
              { error: 'Suspicious activity detected' },
              { 
                status: 403,
                headers: getSecurityHeaders()
              }
            )
          };
        }
      }
    }

    return { allowed: true, userId };
  }

  return { allowed: true };
}

// Helper function to extract user ID from JWT token
function extractUserIdFromToken(token: string): string | null {
  // In production, this would properly verify and decode the JWT
  // For now, this is a placeholder
  try {
    // This is a simplified version - use proper JWT verification in production
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch (error) {
    return null;
  }
}

// Check for suspicious user activity
async function checkForSuspiciousActivity(
  userId: string,
  currentIP: string,
  currentDevice: string
): Promise<{ isSuspicious: boolean; severity: 'low' | 'medium' | 'high'; reasons: string[] }> {
  const reasons: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  // This would integrate with your database to check for patterns
  // For now, we'll return a placeholder implementation
  
  // Example checks you might implement:
  
  // 1. Check for IP changes in short time periods
  // 2. Check for device changes
  // 3. Check for rapid successive actions
  // 4. Check for unusual patterns in video watching
  // 5. Check for multiple failed login attempts
  
  return {
    isSuspicious: false,
    severity,
    reasons
  };
}

// Apply security headers to all responses
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const securityHeaders = getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Video watching security middleware
export async function validateVideoWatchRequest(
  request: NextRequest,
  userId: string,
  videoId: string
): Promise<{ valid: boolean; response?: NextResponse }> {
  const clientIP = getClientIP(request);
  const deviceFingerprint = generateDeviceFingerprint(request);

  // Rate limiting for video watching
  const rateLimitKey = `video_watch:${userId}:${clientIP}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, 50, 60 * 60 * 1000); // 50 videos per hour

  if (!rateLimitResult.allowed) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Video watch rate limit exceeded' },
        { status: 429 }
      )
    };
  }

  // Check for concurrent video watching
  // This would involve checking if the user is currently watching another video
  
  // Validate video completion data
  const body = await request.clone().json();
  const { watchDuration, userInteractions, verificationData } = body;

  // Basic validation
  if (!watchDuration || watchDuration < 0) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Invalid watch duration' },
        { status: 400 }
      )
    };
  }

  // Check for suspicious patterns
  if (watchDuration > 24 * 60 * 60) { // More than 24 hours
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Invalid watch duration' },
        { status: 400 }
      )
    };
  }

  // Log video watch attempt
  logActivity({
    userId,
    action: 'video_watch_attempt',
    timestamp: new Date(),
    ip: clientIP,
    device: deviceFingerprint,
    metadata: {
      videoId,
      watchDuration,
      userAgent: request.headers.get('user-agent')
    }
  });

  return { valid: true };
}

// Registration security middleware
export async function validateRegistrationRequest(
  request: NextRequest
): Promise<{ valid: boolean; response?: NextResponse }> {
  const clientIP = getClientIP(request);
  const deviceFingerprint = generateDeviceFingerprint(request);

  // Rate limiting for registration
  const rateLimitKey = `registration:${clientIP}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 3 registrations per hour per IP

  if (!rateLimitResult.allowed) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Registration rate limit exceeded' },
        { status: 429 }
      )
    };
  }

  // Check for disposable email (placeholder)
  const body = await request.clone().json();
  const { email } = body;
  
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Disposable email addresses are not allowed' },
        { status: 400 }
      )
    };
  }

  return { valid: true };
}

// Placeholder function to check disposable emails
function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    // Add more disposable email domains
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}