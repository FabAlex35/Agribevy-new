export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
 
export async function POST(req) {
 
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const data = await req.json();
        let marketerMobile = decoded.mobile;
        const role = decoded.role;
 
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
 
                marketerMobile = num?.created_by;
            }
 
            let [{ user_name }] = await querys({
                query: 'SELECT user_name FROM users WHERE user_mobile = ?',
                values: [marketerMobile]
            });
 
            let check = await querys({
                query: `SELECT MAX(invoiceId) AS last_invoice_id FROM invoice WHERE created_by = ?`,
                values: [marketerMobile]
            });
 
            let invoiceNumber;
            let paddedInvoiceId;
 
            if (check[0].last_invoice_id == null) {
                invoiceNumber = 1;
                paddedInvoiceId = invoiceNumber.toString().padStart(4, '0');
            } else {
                let lastInvoiceId = check[0].last_invoice_id;
                let invoiceNumberStr = lastInvoiceId.split('-')[1];
                invoiceNumber = parseInt(invoiceNumberStr, 10) + 1;
                paddedInvoiceId = invoiceNumber.toString().padStart(4, '0');
            }
 
            let ids = `${user_name}-${paddedInvoiceId}`;

            // Insert into the invoice table
            const result = await querys({
                query: `INSERT INTO invoice (invoiceId, transactionIds, created_by, farmer_mobile, magamai_show) VALUES (?, ?, ?, ?, ?)`,
                values: [ids, data.id, marketerMobile, data.mobile, data.show]
            });

            if (result.affectedRows === 0)
                return NextResponse.json({
                    message: 'Failed to add Invoice',
                    status: 400
                }, { status: 400 });
 
            const formattedString = data.id.map(item => `'${item}'`).join(',');
 
            const change = await querys({
                query: `UPDATE transactions SET invoiceId = ? WHERE transaction_id IN (${formattedString})`,
                values: [ids]
            });
 
            if (change.affectedRows === 0) {
                return NextResponse.json({
                    message: 'Failed to update transactions',
                    status: 400
                }, { status: 400 });
            }
 
            return NextResponse.json({
                message: 'Invoice added and transactions updated successfully',
                status: 200
            }, { status: 200 });
 
        } else {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }
    } catch (error) {
        console.error('Server Error:', error);
 
        if (error.code == 'ER_DUP_ENTRY') {
            return NextResponse.json({
                message: 'InvoiceID already exists',
                status: 409
            }, { status: 409 });
        }
 
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        let marketerMobile = decoded.mobile;
        const role = decoded.role;
 
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
 
                marketerMobile = num?.created_by;
            }
 
            const list = await querys({
                query: `SELECT i.invoiceId,i.created_by,i.created_at,MIN(f.farmer_name) AS farmer_name,tx.total_farmer_amount,tx.total_quantity
                FROM invoice i
                LEFT JOIN (SELECT invoiceId,SUM(farmer_amount) AS total_farmer_amount,SUM(quantity) AS total_quantity FROM transactions GROUP BY invoiceId) tx ON tx.invoiceId = i.invoiceId 
                LEFT JOIN farmers f ON f.farmer_mobile = i.farmer_mobile WHERE i.created_by = ?
                GROUP BY i.invoiceId, i.created_by, i.created_at, tx.total_farmer_amount, tx.total_quantity
                ORDER BY i.created_at DESC;
                    `,
                values: [marketerMobile]
            })
            return NextResponse.json({
                message: 'Data listed',
                data: list,
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