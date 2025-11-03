import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification - must match the one in auth route
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"
);

// Verify JWT token
async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.admin === true && payload.exp > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Check if the request is for admin routes (excluding auth endpoint)
  if (request.nextUrl.pathname.startsWith('/api/updateSetting') || 
      request.nextUrl.pathname.startsWith('/api/getSettings')) {
    
    // Check for authentication cookie
    const authCookie = request.cookies.get('admin_auth');
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const isValid = await verifyToken(authCookie.value);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or expired token' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/updateSetting/:path*', '/api/getSettings/:path*']
};