export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
 
export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        let userMobile = decoded.mobile;
 
        if (decoded.role === 'marketer' || decoded.role === 'assistant') {
            if (decoded.role === 'assistant') {
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
 
                userMobile = num?.created_by;
            }
 
            const records = await querys({
                query: `SELECT expenditure_date AS date, id,
                    (IFNULL(rent, 0) + IFNULL(electricity, 0) + IFNULL(water, 0) +
                    IFNULL(fuel, 0) + IFNULL(travel, 0) + IFNULL(mobile_bill, 0) +
                    IFNULL(daily_expenditure, 0) + IFNULL(emp_wage, 0) + IFNULL(miscellaneous, 0)) AS totalAmount,
                    JSON_ARRAY(
                        JSON_OBJECT('category', 'Rent','tamil','வாடகை', 'amount', IFNULL(rent, 0)),
                        JSON_OBJECT('category', 'Electricity','tamil','மின்சாரம்', 'amount', IFNULL(electricity, 0)),
                        JSON_OBJECT('category', 'Water','tamil','தண்ணீர்', 'amount', IFNULL(water, 0)),
                        JSON_OBJECT('category', 'Fuel','tamil','எரிபொருள்', 'amount', IFNULL(fuel, 0)),
                        JSON_OBJECT('category', 'Travel','tamil','பயணம்', 'amount', IFNULL(travel, 0)),
                        JSON_OBJECT('category', 'Mobile','tamil','மொபைல் பில்', 'amount', IFNULL(mobile_bill, 0)),
                        JSON_OBJECT('category', 'Snacks','tamil','தேநீர்/சிற்றுண்டி', 'amount', IFNULL(daily_expenditure, 0)),
                        JSON_OBJECT('category', 'Wage','tamil','பணியாளர் ஊதியம்', 'amount', IFNULL(emp_wage, 0)),
                        JSON_OBJECT('category', 'Miscellaneous','tamil','இதர செலவு', 'amount', IFNULL(miscellaneous, 0))
                    ) AS details
                FROM balance_sheet b 
                WHERE created_by = ?
                AND expenditure_date >= CURDATE() - INTERVAL 30 DAY ORDER BY expenditure_date DESC `,
                values: [userMobile]
            });
 
            return NextResponse.json({
                message: 'Success',
                data: records,
                status: 200
            }, { status: 200 });
 
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