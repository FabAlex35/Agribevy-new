export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { querys } from '@/src/app/lib/DbConnection';

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        
        let userMobile = decoded.mobile;

        if (decoded.role == 'farmer') {
            const productId = new URL(req.url).pathname.split('/').filter(Boolean).pop();
            const res = await querys({
                query: `SELECT quantity, created_at, farmer_amount, farmer_status FROM transactions WHERE product_id = ? AND farmer_mobile=? ORDER BY created_at DESC`,
                values: [productId,userMobile]
            });
            return NextResponse.json({
                message: 'sale details listed successfully',
                status: 200,
                data: res
            }, { status: 200 });
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