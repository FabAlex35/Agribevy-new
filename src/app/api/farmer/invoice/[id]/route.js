export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const id = decodeURIComponent(new URL(req.url).pathname.split('/').filter(Boolean).pop());

        let farmerMobile = decoded.mobile;
        const role = decoded.role;

        // Validate role before proceeding
        if (role !== 'farmer') {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

        // Fetch details about the invoice and transaction
        const [detailsResult, list] = await Promise.all([
            querys({
                query: `SELECT i.invoiceId, i.created_at, f.farmer_name, f.farmer_mobile, d.logo,
                        d.marketer_mobile, u.user_name, u.user_address, tx.total_farmer_advance,
                        tx.total_farmer_rent, tx.total_farmer_wage, tx.total_amount,
                        tx.total_farmer_amount, tx.total_commission, tx.total_magamai FROM invoice i
                            LEFT JOIN ( SELECT invoiceId, SUM(farmer_advance) AS total_farmer_advance,
                            SUM(farmer_rent) AS total_farmer_rent, SUM(farmer_wage) AS total_farmer_wage, SUM(amount) AS total_amount,
                            SUM(farmer_amount) AS total_farmer_amount,
                            ROUND(SUM((amount * COALESCE(commission, 0)) / 100), 2) AS total_commission,
                            ROUND(SUM(((amount * COALESCE(commission, 0)) / 100) * magamai / 100), 2) AS total_magamai FROM transactions GROUP BY invoiceId) tx ON
                            tx.invoiceId = i.invoiceId
                        LEFT JOIN farmers f ON f.farmer_mobile = i.farmer_mobile
                        LEFT JOIN default_setting d ON d.marketer_mobile = i.created_by
                        LEFT JOIN users u ON u.user_mobile = i.created_by
                        WHERE i.farmer_mobile = ? AND i.invoiceId = ?
                        ORDER BY i.created_at DESC;`,
                            values: [farmerMobile, id]
                        }),
            querys({
                query: `SELECT i.invoiceId, i.created_at, t.transaction_id, t.veg_name,
                            t.quantity, t.amount, t.farmer_status FROM invoice i
                        LEFT JOIN transactions t ON t.invoiceId = i.invoiceId
                        WHERE i.farmer_mobile = ? AND i.invoiceId=?
                        ORDER BY i.invoiceId, t.transaction_id;`,
                values: [farmerMobile, id]
            })
        ]);

        // If the `details` query results in an empty array, handle it as needed
        const details = detailsResult.length > 0 ? detailsResult[0] : null;

        if (!details || !list.length) {
            return NextResponse.json({
                message: 'No data found',
                status: 404
            }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Data listed successfully',
            data: { list, detail: details },
            status: 200
        }, { status: 200 });

    } catch (error) {
        console.error('Error in GET request:', error);

        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}