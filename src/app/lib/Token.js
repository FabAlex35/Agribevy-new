import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
const REFRESH_SECRET_KEY = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET_KEY);
const validUpto = process.env.JWT_EXPIRATION || "1d";
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRATION || "10d";

// Generate Access Token (Sent in Headers)
export async function generateToken(user, subs, secretKey = SECRET_KEY, expirationTime = validUpto) {
    return await new SignJWT({
        userId: user.user_id,
        mobile: user.user_mobile,
        role: user.user_role,
        subscription: subs,
    })
        .setExpirationTime(expirationTime)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .sign(secretKey);
}


export async function generateRefreshToken(user, subs, secretKey = REFRESH_SECRET_KEY, expirationTime = refreshTokenExpiry) {
    return await new SignJWT({
        userId: user.user_id,
        mobile: user.user_mobile,
        role: user.user_role,
        subscription: subs,
    })
        .setExpirationTime(expirationTime)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .sign(secretKey);
}

// Verify Token
export async function verifyToken(token, secretKey = SECRET_KEY) {
    try {
        const decoded = await jwtVerify(token, secretKey);
        return decoded.payload;
    } catch (error) {
        return null;
    }
}


export function showRole(user){
    return user.user_role
}

