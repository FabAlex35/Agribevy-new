import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const validUpto = process.env.JWT_EXPIRATION || "1d";
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRATION || "10d";

export async function POST(req) {
    try {
        const {refresh_oken} = req.json();

        if (!refresh_oken) {
            return NextResponse.json({
                message: 'Refresh token not found',
                status: 400
            }, { status: 400 });
        }

        // Verify refresh token
        const decoded = jwt.verify(refresh_oken, REFRESH_SECRET_KEY);
        const user = {
            userId: decoded.userId,
            mobile: decoded.mobile,
            role: decoded.role
        }
   
        const accessToken = await generateToken(user, decoded.subscription, SECRET_KEY, validUpto)
        const refreshToken = await generateToken(user, decoded.subscription, REFRESH_SECRET_KEY, refreshTokenExpiry)

        // Create a response with new access token
        const response = NextResponse.json({
            message: 'Token refreshed successfully',
            data: { accessToken, refreshToken },
            status: 200
        });
        return response;
    } catch (error) {
        return NextResponse.json({
            message: 'Invalid or expired refresh token',
            status: 403
        }, { status: 403 });
    }
}
