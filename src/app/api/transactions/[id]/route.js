export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
       
        const { pathname } = new URL(req.url)
        const segments = pathname.split('/').filter(segment => segment);
        const id = segments.pop();

        const rows = await querys({
            query: `SELECT * FROM transactions WHERE product_id = ?`,
            values: [id]
        });

        const rows1 = await querys({
            query: ` SELECT p.proposed_price, p.quantity, p.created_at, v.veg_name, u.user_name FROM products p 
                    JOIN vegetables v ON p.vegetable_id = v.veg_id JOIN users u ON v.marketer_mobile = u.user_mobile
                    WHERE p.product_id = ?`,
            values: [id]
        });

        if (rows && rows1) {
            return NextResponse.json({
                message: 'Transaction Listed successfully',
                data: {
                    detail: rows1,
                    transaction: rows
                },
                status: 200
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: 'No Data Found',
                status: 404
            }, { status: 404 });
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
 
        const { pathname } = new URL(req.url);
        const segments = pathname.split('/').filter(segment => segment);
        const type = segments.pop();
 
        const data = await req.json();
        const paymentAmount = parseInt(data.payment, 10);
        const ids = data.id
        const user = data.role
        const phone =data.phone
        const userName = data.name
 
        const role = decoded.role;
        let marketerMobile=decoded.mobile
 
        // Check if the role is valid
        if (!role || (role !== 'marketer' && role !== 'assistant')) {
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
 
            marketerMobile = num?.created_by;
        }
 
        const insertResult = await querys({
            query: `INSERT INTO accounts (amount, marketer_mobile, mobile, user) VALUES (?, ?, ?, ?)`,
            values: [paymentAmount, marketerMobile, phone, userName]
        });
 
        if (insertResult.affectedRows <= 0) {
            return NextResponse.json({
                message: 'Failed to insert payment record.',
                status: 500
            }, { status: 500 });
        }
 
        if (user == 'buyer') {
                let totalPaid = paymentAmount;
                for (const transactionId of ids) {
                    if (totalPaid <= 0) break;
 
                    const [rows] = await querys({
                        query: `SELECT buyer_payment, buyer_status FROM transactions WHERE transaction_id = ?`,
                        values: [transactionId]
                    });
 
                    if (!rows) {
                        return NextResponse.json({
                            message: `Transaction ${transactionId} not found`,
                            status: 404
                        }, { status: 404 });
                    }
 
                    const currentPayment = rows.buyer_payment;
 
                    if (currentPayment <= totalPaid) {
                        await querys({
                            query: 'UPDATE transactions SET buyer_payment = ?, buyer_status = "paid" WHERE transaction_id = ?',
                            values: [0, transactionId]
                        });
                        totalPaid -= currentPayment;
                    } else {
                        const remaining=currentPayment-totalPaid
                        await querys({
                            query: 'UPDATE transactions SET buyer_payment = ?, buyer_status = "pending" WHERE transaction_id = ?',
                            values: [remaining, transactionId]
                        });
                        totalPaid = 0;
                    }
                }
        } else {
            if (type === 'single') {
                const [rows] = await querys({
                    query: `SELECT farmer_payment, farmer_status FROM transactions WHERE transaction_id = ?`,
                    values: [ids]
                });
 
                if (!rows) {
                    return NextResponse.json({
                        message: 'Transaction not found',
                        status: 404
                    }, { status: 404 });
                }
 
                const currentPayment = rows.farmer_payment;
 
                if (currentPayment === paymentAmount) {
                    await querys({
                        query: 'UPDATE transactions SET farmer_payment = ?, farmer_status = "paid" WHERE transaction_id = ?',
                        values: [0, ids]
                    });
                } else {
                    const balance = currentPayment - paymentAmount;
                    await querys({
                        query: 'UPDATE transactions SET farmer_payment = ?, farmer_status = "pending" WHERE transaction_id = ?',
                        values: [balance, ids]
                    });
                }
            } else {
                let totalPaid = paymentAmount;
                for (const transactionId of ids) {
                    if (totalPaid <= 0) break;
 
                    const [rows] = await querys({
                        query: `SELECT farmer_payment, farmer_status FROM transactions WHERE transaction_id = ?`,
                        values: [transactionId]
                    });
 
                    if (!rows) {
                        return NextResponse.json({
                            message: `Transaction ${transactionId} not found`,
                            status: 404
                        }, { status: 404 });
                    }
 
                    const currentPayment = rows.farmer_payment;
 
                    if (currentPayment <= totalPaid) {
                        await querys({
                            query: 'UPDATE transactions SET farmer_payment = ?, farmer_status = "paid" WHERE transaction_id = ?',
                            values: [0, transactionId]
                        });
                        totalPaid -= currentPayment;
                    } else {
                        const remaining=currentPayment-totalPaid
                        await querys({
                            query: 'UPDATE transactions SET farmer_payment = ?, farmer_status = "pending" WHERE transaction_id = ?',
                            values: [remaining, transactionId]
                        });
                        totalPaid = 0;
                    }
                }
            }
        }
 
        return NextResponse.json({
            message: 'Transaction(s) updated successfully',
            status: 200
        });
 
    } catch (error) {
        console.error(error);
 
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}