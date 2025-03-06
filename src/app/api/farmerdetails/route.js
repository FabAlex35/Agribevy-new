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
            
            const res = await querys({
                query: `SELECT p.farmer_mobile,p.proposed_price,p.quantity,p.created_at,p.unit,p.product_id,v.veg_name,u.user_name , CASE WHEN p.quantity_available = 0 THEN 'sold' WHEN quantity_available = p.quantity THEN 'unsold' ELSE 'partly_sold' END AS status,CASE WHEN NOT EXISTS (SELECT 1 FROM transactions t WHERE t.product_id = p.product_id) THEN 'unpaid' WHEN NOT EXISTS (SELECT 1 FROM transactions t WHERE t.product_id = p.product_id AND t.farmer_status = 'pending') THEN 'paid'WHEN NOT EXISTS (SELECT 1 FROM transactions t WHERE t.product_id = p.product_id AND t.farmer_status = 'paid') THEN 'unpaid' ELSE 'partly_paid' END AS payment FROM products p JOIN vegetables v ON p.vegetable_id = v.veg_id JOIN users u ON v.marketer_mobile = u.user_mobile WHERE p.farmer_mobile=? ORDER BY p.created_at DESC;`,
                values: [userMobile]
            });
            return NextResponse.json({
                message: 'Farmer details listed successfully',
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