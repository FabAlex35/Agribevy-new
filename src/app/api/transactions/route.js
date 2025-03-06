export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

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
                query: `SELECT DISTINCT t.id, t.transaction_id, t.product_id, t.marketer_mobile, t.amount, t.quantity as sold, t.veg_name, t.commission, t.wage, t.rent, t.created_at as soldDate, p.vegetable_id,t.farmer_status,t.buyer_status,t.invoice_Id,
                p.proposed_price, p.quantity as original, p.unit, p.image, t.farmer_rent, t.farmer_wage,
                p.created_at as addedDate, f.farmer_name, f.farmer_mobile,  f.farmer_address, b.buyer_name, b.buyer_mobile,
                b.buyer_address, u.user_name, u.user_address, d.logo, d.magamai ,vl.tamil_name FROM transactions t
                JOIN users u ON t.marketer_mobile = u.user_mobile
                LEFT JOIN products p ON t.product_id = p.product_id
                LEFT JOIN farmers f ON t.farmer_mobile = f.farmer_mobile AND t.marketer_mobile=f.marketer_mobile
                LEFT JOIN buyers b ON t.buyer_mobile = b.buyer_mobile AND t.marketer_mobile=b.marketer_mobile
                LEFT JOIN vegetables v ON p.vegetable_id = v.veg_id
                LEFT JOIN veg_list vl ON v.list_id = vl.veg_id
                LEFT JOIN default_setting d ON t.marketer_mobile = d.marketer_mobile
                 WHERE t.marketer_mobile = ?`,
                values: [mobile]
            });

            if (rows) {
                return NextResponse.json({
                    message: 'Transaction Listed successfully',
                    data: rows,
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
        let mobile = decoded.mobile;

        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const user = searchParams.get('user');
        const phone = searchParams.get('phone');
        const data = await req.json();

        if (role === 'marketer' || role === 'assistant') {
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

                mobile = num?.created_by;
            }

            // Handle payment scenario
            if (data.payment) {
                const paymentAmount = parseInt(data.payment, 10);

                const rows = await querys({
                    query: `SELECT * FROM transactions WHERE ${user}_mobile = ? AND ${user}_status = 'pending' ORDER BY created_at ASC`,
                    values: [phone]
                });

                if (rows.length == 0) {
                    return NextResponse.json({
                        message: 'No Data Found',
                        status: 404
                    }, { status: 404 });
                }

                const insertResult = await querys({
                    query: `INSERT INTO accounts (amount, marketer_mobile, mobile, user) VALUES (?, ?, ?, ?)`,
                    values: [paymentAmount, mobile, phone, user]
                });

                if (insertResult.affectedRows <= 0) {
                    return NextResponse.json({
                        message: 'Failed to insert payment record.',
                        status: 500
                    }, { status: 500 });
                }

                let totalPaid = 0;
                for (const transaction of rows) {
                    if (totalPaid >= paymentAmount) break;

                    const transactionPayment = user === 'farmer' ? transaction.farmer_payment : transaction.buyer_payment;

                    if (transactionPayment <= (paymentAmount - totalPaid)) {
                        // Full payment for this transaction
                        const updateResult = await querys({
                            query: `UPDATE transactions SET ${user}_status = 'paid', ${user}_payment = 0 WHERE transaction_id = ?`,
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
                            query: `UPDATE transactions SET ${user}_payment = ?, ${user}_status = 'pending' WHERE transaction_id = ?`,
                            values: [remainingAmount, transaction.transaction_id]
                        });

                        if (updateResult.affectedRows <= 0) {
                            return NextResponse.json({
                                message: `Failed to update transaction ${transaction.transaction_id} payment status.`,
                                status: 500
                            }, { status: 500 });
                        }

                        totalPaid = paymentAmount; // All payment exhausted
                    }
                }
                return NextResponse.json({
                    message: 'Data updated successfully',
                    status: 200
                }, { status: 200 });
            }
            // Handle advance scenario
            else if (data.advance) {
                const table = user === 'farmer' ? 'farmers' : 'buyers';

                const amountData = await querys({
                    query: `SELECT advance FROM ${table} WHERE ${user}_mobile = ?`,
                    values: [phone]
                });

                if (amountData.length > 0) {
                    const currentAdvance = parseInt(amountData[0].advance, 10);
                    const newAdvance = parseInt(data.advance, 10);

                    const insertResult = await querys({
                        query: `INSERT INTO accounts (advance, marketer_mobile, mobile, user) VALUES (?, ?, ?, ?)`,
                        values: [newAdvance, mobile, phone, user]
                    });

                    if (insertResult.affectedRows <= 0) {
                        return NextResponse.json({
                            message: 'Failed to insert payment record.',
                            status: 500
                        }, { status: 500 });
                    }

                    const updateResult = await querys({
                        query: `UPDATE ${table} SET advance = ? WHERE ${user}_mobile = ?`,
                        values: [currentAdvance + newAdvance, phone]
                    });

                    if (updateResult.affectedRows <= 0) {
                        return NextResponse.json({
                            message: 'Failed to update advance amount.',
                            status: 500
                        }, { status: 500 });
                    }

                    return NextResponse.json({
                        message: 'Data updated successfully',
                        status: 200
                    }, { status: 200 });

                } else {
                    return NextResponse.json({
                        message: 'No farmer or buyer found with the given mobile number.',
                        status: 404
                    }, { status: 404 });
                }
            }

        } else {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}
