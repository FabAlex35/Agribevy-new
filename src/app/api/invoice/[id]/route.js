export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const id = decodeURIComponent(new URL(req.url).pathname.split('/').filter(Boolean).pop());

        let marketerMobile = decoded.mobile;
        const role = decoded.role;

        // Validate role before proceeding
        if (role !== 'marketer' && role !== 'assistant') {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

        // Handle 'assistant' role to get the 'marketerMobile' they belong to
        if (role === 'assistant') {
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

            marketerMobile = num.created_by; // Get the 'marketerMobile' from the 'assistant'
        }

        // Fetch details about the invoice and transaction
        const [detailsResult, list] = await Promise.all([
            querys({
                query: `SELECT i.invoiceId, i.created_at, i.magamai_show, f.farmer_name, 
                        f.farmer_mobile, d.logo, d.marketer_mobile, u.user_name, u.user_address, 
                        tx.total_amount, tx.total_farmer_advance, tx.total_farmer_rent, 
                        tx.total_farmer_wage, tx.total_farmer_amount,tx.total_sack_price,
                        tx.total_farmer_payment, tx.total_commission, tx.total_magamai
                    FROM invoice i
                    LEFT JOIN (
                        SELECT t.invoiceId, SUM(t.farmer_advance) AS total_farmer_advance,
                        SUM(t.farmer_rent) AS total_farmer_rent, SUM(t.farmer_wage) AS total_farmer_wage, SUM(t.f_amount) AS total_amount,
                        SUM(t.farmer_amount) AS total_farmer_amount,
                        SUM(t.sack_price) AS total_sack_price,
                        SUM(t.farmer_payment) AS total_farmer_payment,
                        ROUND(SUM((t.f_amount  * COALESCE(t.commission, 0)) / 100), 2) AS total_commission,
                        ROUND(SUM(CASE WHEN ds.magamaiType = 'percentage' THEN ((t.f_amount * COALESCE(t.commission, 0)) / 100) * t.magamai / 100 WHEN ds.magamaiType = 'sack' THEN t.magamai ELSE 0 END), 2) AS total_magamai
                        FROM transactions  t
                        LEFT JOIN 
                        default_setting ds ON ds.marketer_mobile = t.marketer_mobile
                            GROUP BY invoiceId
                        ) tx ON tx.invoiceId = i.invoiceId
                        LEFT JOIN farmers f ON f.farmer_mobile = i.farmer_mobile
                        LEFT JOIN default_setting d ON d.marketer_mobile = i.created_by
                        LEFT JOIN users u ON u.user_mobile = i.created_by
                        WHERE i.created_by = ? AND i.invoiceId = ?
                        ORDER BY i.created_at DESC;`,
                values: [marketerMobile, id]
            }),
            querys({
                query: `SELECT DISTINCT i.invoiceId, i.created_at, t.transaction_id, t.veg_name,
                        t.quantity, t.f_amount as amount, t.farmer_status,p.vegetable_id, v.list_id, vl.tamil_name
                        FROM invoice i
                        LEFT JOIN transactions t ON t.invoiceId = i.invoiceId
                        LEFT JOIN products p ON t.product_id = p.product_id 
                        LEFT JOIN vegetables v ON p.vegetable_id = v.veg_id 
                        LEFT JOIN veg_list vl ON v.list_id = vl.veg_id
                        WHERE i.created_by = ? AND i.invoiceId=?
                        ORDER BY i.invoiceId, t.transaction_id;`,
                values: [marketerMobile, id]
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

export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const id = decodeURIComponent(new URL(req.url).pathname.split('/').filter(Boolean).pop());

        let marketerMobile = decoded.mobile;
        const role = decoded.role;
        const data = await req.json();
        const user = data.name
        const phone = data.phone
        const paymentAmount = parseInt(data.payment, 10);

        if (role !== 'marketer' && role !== 'assistant') {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

        if (role === 'assistant') {
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

            marketerMobile = num.created_by;
        }
        const insertResult = await querys({
            query: `INSERT INTO accounts (amount, marketer_mobile, mobile, user) VALUES (?, ?, ?, ?)`,
            values: [paymentAmount, marketerMobile, phone, user]
        });

        if (insertResult.affectedRows <= 0) {
            return NextResponse.json({
                message: 'Failed to insert payment record.',
                status: 500
            }, { status: 500 });
        }
        const rows = await querys({
            query: `SELECT transaction_id, farmer_payment, farmer_status FROM transactions WHERE invoiceId = ? AND farmer_status = 'pending'`,
            values: [id]
        });

        let totalPaid = 0;

        for (const transaction of rows) {
            if (totalPaid >= paymentAmount) break;

            const transactionPayment = transaction.farmer_payment;
            if (transactionPayment <= (paymentAmount - totalPaid)) {
                // Full payment for this transaction
                const updateResult = await querys({
                    query: `UPDATE transactions SET farmer_status = 'paid', farmer_payment = 0 WHERE transaction_id = ?`,
                    values: [transaction.transaction_id]
                });

                if (updateResult.affectedRows <= 0) {
                    return NextResponse.json({
                        message: `Failed to update transaction ${transaction.transaction_id} status to paid.`,
                        status: 500
                    }, { status: 500 });
                }

                totalPaid += transactionPayment;
            } else {
                // Partial payment
                const remainingAmount = transactionPayment - (paymentAmount - totalPaid);
                const updateResult = await querys({
                    query: `UPDATE transactions SET farmer_payment = ?, farmer_status = 'pending' WHERE transaction_id = ?`,
                    values: [remainingAmount, transaction.transaction_id]
                });

                if (updateResult.affectedRows <= 0) {
                    return NextResponse.json({
                        message: `Failed to update transaction ${transaction.transaction_id} payment status.`,
                        status: 500
                    }, { status: 500 });
                }

                totalPaid = paymentAmount;
            }
        }

        return NextResponse.json({
            message: 'Payment successful',
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


// ROUND(SUM(
//     CASE 
//         WHEN t.magamai_src = 'farmer' AND t.magamai_type = 'percentage' 
//             THEN ((t.f_amount * COALESCE(t.commission, 0)) / 100) * t.magamai / 100  
//         WHEN t.magamai_src = 'farmer' AND t.magamai_type = 'sack' 
//             THEN t.magamai 
//         ELSE 0 
//     END
// ), 2) AS total_magamai
