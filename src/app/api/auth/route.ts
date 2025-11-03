import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Secret key for JWT signing - should be in environment variables
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production"
);

// Generate a secure JWT token
async function generateToken(): Promise<string> {
  const token = await new SignJWT({
    admin: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT token
async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (
      payload.admin === true && payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch (error) {
    return false;
  }
}

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Generate secure JWT token
  const token = await generateToken();

  // Create a response with authentication cookie
  const response = NextResponse.json({ success: true, message: "Authorized" });

  // Set a persistent cookie with JWT token
  response.cookies.set("admin_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: "/",
  });

  return response;
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");

  if (!authCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Verify the JWT token
  const isValid = await verifyToken(authCookie.value);

  if (isValid) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE(req: Request) {
  // Logout endpoint - clear the auth cookie
  const response = NextResponse.json({ success: true, message: "Logged out" });

  response.cookies.set("admin_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
}
