export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const {searchParams}=new URL(req.url,`http://${req.headers.host}`)
        const date=searchParams.get("date")
       
        let mobile = decoded.mobile
        const role = decoded.role

        if (role == 'marketer' || role == 'assistant') {

            if (role == 'assistant') {
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
                mobile = num?.created_by
            }
            
            const rows = await querys({
                query: `SELECT t.veg_name, t.farmer_amount, t.buyer_amount, t.farmer_payment, t.buyer_payment,t.amount, t.farmer_status,t.buyer_status,t.commission, t.magamai, t.farmer_wage, t.farmer_rent, t.wage, t.rent,f.farmer_name,b.buyer_name,b.buyer_address,p.vegetable_id, v.list_id, vl.tamil_name
                        FROM transactions t
                        LEFT JOIN farmers f ON t.farmer_mobile = f.farmer_mobile AND t.marketer_mobile=f.marketer_mobile
                        LEFT JOIN buyers b ON t.buyer_mobile = b.buyer_mobile AND t.marketer_mobile=b.marketer_mobile
                        LEFT JOIN products p ON t.product_id = p.product_id 
                        LEFT JOIN vegetables v ON p.vegetable_id = v.veg_id 
                        LEFT JOIN veg_list vl ON v.list_id = vl.veg_id
                        WHERE t.marketer_mobile = ? AND DATE(t.created_at) = ?`,
                values: [mobile, date]
            });
            const [userData] = await querys({
                query: `SELECT d.logo, d.marketer_mobile, u.user_name, u.user_address
                        FROM default_setting d LEFT JOIN users u 
                        ON u.user_mobile = d.marketer_mobile
                        WHERE d.marketer_mobile = ?; `, values: [mobile]
            });
            if (rows) {
                return NextResponse.json({
                    message: 'Transaction Listed successfully',
                    data: {
                        sales:rows,
                        userData
                    },
                    status: 200
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: 'No Data Found',
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
        console.log(error);

        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}