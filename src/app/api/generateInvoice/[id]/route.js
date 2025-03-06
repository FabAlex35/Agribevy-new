export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        
        // Extract phone number from the URL path
        const user = new URL(req.url).pathname.split('/').filter(Boolean).pop();
        if (decoded.role == 'marketer' || decoded.role == 'assistant') {
            let userMobile = decoded.mobile;
            if (decoded.role == 'assistant') {
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_id = ?`,
                    values: [decoded.userId]
                });

                if (!num) {
                    return NextResponse.json({
                        message: 'User not found',
                        status: 404
                    }, { status: 404 });
                }

                userMobile = num?.created_by
            }

            const allItems = await querys({
                query: `SELECT t.* ,t.product_id ,v.veg_id,p.vegetable_id ,vl.tamil_name FROM transactions t 
                JOIN products p ON t.product_id = p.product_id
                LEFT JOIN vegetables v ON p.vegetable_id = v.veg_id
                LEFT JOIN veg_list vl ON v.list_id = vl.veg_id
                WHERE t.farmer_mobile = ? AND t.marketer_mobile = ? AND t.invoiceId IS NULL`,
                values: [user,userMobile]
            });

            return NextResponse.json({
                message: 'Items Listed successfully',
                status: 200,
                data: allItems
            }, { status: 200 });
        }
        else {
            return NextResponse.json({ message: 'Unauthorized', status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ message: 'Server Error', status: 500 }, { status: 500 });
    }
}