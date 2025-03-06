export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

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
        if (['marketer', 'assistant'].includes(decoded.role)) {
            // Fetch user data from the database
            const [transactions] = await Promise.all([
                querys({
                    query:`SELECT 
    t.invoice_Id,
    SUM(t.quantity) AS quantity,
    SUM(t.buyer_payment) AS buyer_payment,
    SUM(t.buyer_amount) AS buyer_amount,
    MAX(t.created_at) AS soldDate,
    CASE 
        WHEN SUM(CASE WHEN t.buyer_status = 'pending' THEN 1 ELSE 0 END) > 0 
        THEN 'pending' 
        ELSE 'paid' 
    END AS buyer_status,
    MAX(b.buyer_name) AS buyer_name,
    MAX(b.buyer_mobile) AS buyer_mobile,
    MAX(b.buyer_address) AS buyer_address,
    MAX(u.user_name) AS user_name,
    MAX(u.user_address) AS user_address,
    MAX(d.logo) AS logo,
    MAX(d.magamai) AS magamai,
    SUM(t.wage) AS total_wage,
    SUM(t.rent) AS total_rent,
    GROUP_CONCAT(DISTINCT v.veg_name) AS veg_name,
    MAX(vl.tamil_name) AS tamil_name,
    JSON_ARRAYAGG(t.transaction_id) AS transaction_id,
    JSON_ARRAYAGG(JSON_OBJECT('veg_name', v.veg_name, 'quantity', t.quantity, 'amount', t.amount)) AS details,
    GROUP_CONCAT(DISTINCT t.marketer_mobile) AS marketer_mobile
FROM 
    transactions t
JOIN 
    products p ON t.product_id = p.product_id
LEFT JOIN 
    users u ON t.marketer_mobile = u.user_mobile
LEFT JOIN 
    buyers b ON t.buyer_mobile = b.buyer_mobile AND t.marketer_mobile = b.marketer_mobile
LEFT JOIN 
    vegetables v ON p.vegetable_id = v.veg_id
LEFT JOIN 
    veg_list vl ON v.list_id = vl.veg_id
LEFT JOIN 
    default_setting d ON t.marketer_mobile = d.marketer_mobile
WHERE 
    t.marketer_mobile = ? 
    AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY 
    t.invoice_Id;`,
                     values: [userMobile]  
                }),

            ]);

            if (transactions) {
                return NextResponse.json({
                    message: 'Buyer transaction Listed',
                    status: 200,
                    data:  transactions  
                }, { status: 200 });
            } 
        } else {
            return NextResponse.json({ message: 'Unauthorized', status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ message: 'Server Error', status: 500 }, { status: 500 });
    }
}