import { NextResponse } from "next/server";
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
const REFRESH_SECRET_KEY = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET_KEY);

// Utility function to verify JWT and return decoded payload
async function verifyToken(token) {
    try {
        const decoded = await jwtVerify(token, SECRET_KEY);
        return decoded.payload;
    } catch (error) {
        return null;
    }
}

export async function middleware(req) {
    const url = req.nextUrl.clone();
    const currentTime = Math.floor(Date.now() / 1000);
    const requiresAuth = url.pathname === "/"  || url.pathname.startsWith("/api");

    if (!requiresAuth) {
        return NextResponse.next();
    }

    if (url.pathname === "/api/auth/login" || url.pathname === "/api/auth/logout") {
        return NextResponse.next();
    }    
    
    let accessToken = req.headers.get("Authorization")?.split(" ")[1] || "";
    let refreshToken = req.headers.get("x-token")?.split(" ")[1] || "";

    if(url.pathname === "/"){
        // if (!accessToken || !refreshToken) {
            return NextResponse.next();
        // }
    }

    // console.log(accessToken,refreshToken, '000000000000000000');
    
    const accessValid = await verifyToken(accessToken, SECRET_KEY);
    const refreshValid = await verifyToken(refreshToken, REFRESH_SECRET_KEY);

    if (accessValid.exp < currentTime) {
        if (refreshValid.exp < currentTime) {
            return NextResponse.redirect(new URL("/", req.url));
        } else {
            // Instead of refreshing here, return a 401 response so the frontend can handle it.
            return NextResponse.json({ message: "Token expired, refresh required" }, { status: 401 });
        }
    }

    

    // Check if access token and subscription are valid
    if (accessValid && accessValid.subscription && accessValid.subscription.status) {
        if (req.method === "POST") {
            if(url.pathname === "/api/auth/login" || url.pathname === "/api/auth/logout"){
                return NextResponse.next()
            }
            if (!accessValid.subscription.status || accessValid.subscription.endDate < currentTime) {
                const response = new NextResponse("Subscription is not valid.", { status: 403 });
                return response;
            }
        }
        return NextResponse.next();
    } else {
        if (req.method === "POST") {
            if(url.pathname === "/api/auth/login" || url.pathname === "/api/auth/logout"){                
                return NextResponse.next()
            }
            const response = new NextResponse("Subscription is required.", { status: 403 });
            return response;
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/api/(.*)",
        "/portal/(.*)",
    ],
};
