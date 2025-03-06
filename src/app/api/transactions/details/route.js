export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const role = decoded.role;
        const data = req.nextUrl.searchParams.getAll('data[]')

        if (!data || data.length === 0) {
            return NextResponse.json({
                message: 'Missing data parameter',
                status: 400
            }, { status: 400 });
        }

        // Only allow marketers and assistants
        if (role === 'marketer' || role === 'assistant') {
            // Using Promise.all to ensure async handling of all the transactions
            const allData = await Promise.all(data.map(async (transactionId) => {
                const [rows] = await querys({
                    query: `SELECT t.farmer_mobile, t.amount, t.veg_name, t.magamai, t.commission, t.amount, t.quantity, t.sack_price, t.farmer_amount, ROUND(t.amount / t.quantity, 0) AS price, t.farmer_rent, t.farmer_wage, t.magamai_src, t.magamai_type, t.transaction_id, f.farmer_name FROM transactions t 
                    LEFT JOIN farmers f ON t.farmer_mobile = f.farmer_mobile AND t.marketer_mobile=f.marketer_mobile
                    WHERE transaction_id = ?`,
                    values: [transactionId]
                });
                return rows;
            }));

            // Check if any data was returned
            if (allData && allData.length > 0) {
                return NextResponse.json({
                    message: 'Transaction Listed successfully',
                    data: allData,
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


export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const role = decoded.role;
        const data = await req.json();

        // Only allow marketers and assistants
        if (role === 'marketer' || role === 'assistant') {
            // Using Promise.all to ensure async handling of all the transactions
            const allData = await Promise.all(data.map(async (each) => {
                const amt = JSON.parse(each.quantity) * JSON.parse(each.price);
                const com = Math.ceil(amt * (JSON.parse(each.commission) / 100))
                let farmer_amt = ((amt - (com + JSON.parse(each.farmer_rent) + JSON.parse(each.farmer_wage))) + JSON.parse(each.sack_price))
                let magamai;

                if (each.magamai_type === "sack" && each.sack_price == 0) {
                    magamai = 0
                }else if (each.magamai_type === "sack" && each.sack_price != 0) {
                    magamai = each.sack_price
                }

                if (each?.magamai_src == 'farmer') {
                    if (each.magamai_type === "sack") {
                        farmer_amt = ((amt - (com + magamai + each.farmer_rent + each.farmer_wage)) + each.sack_price)
                    }
                    if (each.magamai_type === "percentage") {
                        let mam = Math.ceil(com * (each.magamai/ 100))
                        farmer_amt = ((amt - (com + mam + each.farmer_rent + each.farmer_wage)) + each.sack_price)
                    }
                }

                const rows = await querys({
                    query: `UPDATE transactions SET f_quantity = ?, f_amount = ?, farmer_wage = ?, 
                            farmer_payment = ?, farmer_amount = ?, farmer_rent = ?, 
                            sack_price = ? WHERE transaction_id = ?`,
                    values: [each.quantity, amt, each.farmer_wage, farmer_amt, farmer_amt, each.farmer_rent, each.sack_price, each.transaction_id]
                });
               
            }));

            return NextResponse.json({
                message: 'Bill Updated Successfully',
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
