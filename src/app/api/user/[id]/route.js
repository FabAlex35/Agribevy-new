export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

// no need this api for current flow of our project ===================

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        // Extract phone number from the URL path
        const { pathname } = new URL(req.url);
        const segments = pathname.split('/').filter(segment => segment);
        const phone = segments.pop();

        if (decoded.role == 'marketer') {
            // Fetch user data from the database
            const rows = await querys({
                query: `SELECT user_id, user_mobile, user_role, user_name FROM users WHERE user_mobile = ?`,
                values: [phone]
            });

            // Check if any rows were returned
            if (rows.length > 0) {
                return NextResponse.json({
                    message: 'User fetched successfully',
                    status: 200,
                    data: rows
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: 'User not found',
                    status: 404
                }, { status: 404 });
            }
        } else {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}