export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const { pathname } = new URL(req.url)
        const segments = pathname.split('/').filter(segment => segment);
        const id = segments.pop();
        const trans_id = nanoid(15)

        const product = await req.json()

        const sold = parseInt(product.sold, 10);
        var amount = parseInt(product.amount, 10);
        const commission = parseFloat(product.commission);
        const rent = parseInt(product.rent, 10);
        const wage = parseInt(product.wage, 10);
        const paid = product.paid
        const userName = product?.buyer_name?.split('-')[0]


        if (product.unit == 'kg') {
            amount = amount * sold
        }

        if (decoded.role == 'marketer' || decoded.role == 'assistant') {

            let marketerMobile = decoded.mobile

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

                marketerMobile = num?.created_by
            }

            const [exists] = await querys({
                query: `SELECT p.product_id, p.quantity, p.vegetable_id, p.quantity_sold, p.quantity_available, p.farmer_mobile, p.sack_price,
                        p.proposed_price, p.farmer_rent, p.farmer_wage, v.veg_name, v.marketer_mobile AS marketer_mobile,
                        d.magamai FROM products p
                        JOIN vegetables v ON p.vegetable_id = v.veg_id
                        LEFT JOIN default_setting d ON d.marketer_mobile = v.marketer_mobile
                        LEFT JOIN farmers f ON p.farmer_mobile= f.farmer_mobile AND v.marketer_mobile=f.marketer_mobile
                        WHERE p.product_id = ?`,
                values: [id]
            });

            if (exists) {
                if (exists.quantity_available < sold) {
                    return NextResponse.json({
                        message: 'Insufficient quantity available',
                        status: 400
                    }, { status: 400 });
                }

                let [{ user_name }] = await querys({
                    query: 'SELECT user_name FROM users WHERE user_mobile = ?',
                    values: [marketerMobile]
                });

                const [far_advance] = await querys({
                    query: `SELECT * FROM farmers WHERE farmer_mobile = ?`,
                    values: [exists.farmer_mobile]
                })

                const [buy_advance] = await querys({
                    query: `SELECT * FROM buyers WHERE buyer_mobile = ?`,
                    values: [product.mobile]
                })
                const checks = await querys({
                    query: `SELECT * FROM transactions WHERE product_id = ?`,
                    values: [id]
                })

                let [magamaiSource] = await querys({
                    query: 'SELECT magamaiSource FROM default_setting WHERE marketer_mobile = ?',
                    values: [marketerMobile]
                });

                let [{ magamaiType }] = await querys({
                    query: 'SELECT magamaiType FROM default_setting WHERE marketer_mobile = ?',
                    values: [marketerMobile]
                });

                let check = await querys({
                    query: `SELECT MAX(invoice_Id) AS last_invoice_id FROM transactions WHERE marketer_mobile = ?`,
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

                let invoice = `${user_name}-${paddedInvoiceId}`;

                // Check if the invoice already exists
                let invoiceCheck = await querys({
                    query: `SELECT COUNT(*) AS invoice_count FROM transactions WHERE invoice_Id = ?`,
                    values: [invoice]
                });

                if (invoiceCheck[0].invoice_count > 0) {
                    return NextResponse.json({
                        message: 'Same invoice id already exists',
                        status: 400
                    }, { status: 400 });
                }

                let far_rent
                let far_wage;
                let sack_price
                let magamai
                if (checks.length > 0) {
                    far_rent = 0
                    far_wage = 0
                    sack_price = 0
                    if (magamaiType === "sack") {
                        magamai = 0
                    }
                } else {
                    far_rent = parseInt(exists.farmer_rent)
                    far_wage = parseInt(exists.farmer_wage)
                    sack_price = parseFloat(exists.sack_price)
                    if (magamaiType === "sack" && sack_price != 0) {
                        magamai = exists.magamai ? parseFloat(exists.magamai) : 0
                    }
                    else if (magamaiType === "sack" && sack_price == 0) {
                        magamai = 0
                    }
                }
                if (magamaiType === "percentage") {
                    magamai = exists.magamai ? parseInt(exists.magamai, 10) : 0
                }

                const com = Math.ceil(amount * (commission / 100))
                let f_amount = ((amount - (com + far_rent + far_wage)) + sack_price)

                if (magamaiSource?.magamaiSource == 'farmer') {
                    if (magamaiType === "sack") {
                        f_amount = ((amount - (com + magamai + far_rent + far_wage)) + sack_price)
                    }
                    if (magamaiType === "percentage") {
                        let mam = Math.ceil(com * (magamai / 100))
                        f_amount = ((amount - (com + mam + far_rent + far_wage)) + sack_price)
                    }
                }

                const b_amount = (amount + wage + rent)
                const f_advance = parseInt(far_advance.advance, 10)
                const b_advance = parseInt(buy_advance.advance, 10)
                let amount1;

                if (f_advance > f_amount) {
                    const newAd = f_advance - f_amount
                    amount1 = 0
                    await querys({
                        query: `UPDATE farmers SET advance = ? WHERE farmer_mobile = ?`,
                        values: [newAd, exists.farmer_mobile]
                    })

                } else if (f_advance == f_amount) {
                    amount1 = 0
                    await querys({
                        query: `UPDATE farmers SET advance = ? WHERE farmer_mobile = ?`,
                        values: [0, exists.farmer_mobile]
                    })

                } else {
                    amount1 = f_amount - f_advance
                    await querys({
                        query: `UPDATE farmers SET advance = ? WHERE farmer_mobile = ?`,
                        values: [0, exists.farmer_mobile]
                    })

                }
                let amount2;

                if (paid) {
                    amount2 = 0
                    await querys({
                        query: `INSERT INTO accounts (amount, marketer_mobile, mobile, user, advance) VALUES (?, ?, ?, ?, ?)`,
                        values: [amount, marketerMobile, product.mobile, userName, 0]
                    })
                } else {
                    if (b_advance > b_amount) {
                        amount2 = 0
                        const newAd = b_advance - b_amount
                        await querys({
                            query: `UPDATE buyers SET advance = ? WHERE buyer_mobile = ?`,
                            values: [newAd, product.mobile]
                        })

                    } else if (b_advance == b_amount) {
                        amount2 = 0
                        await querys({
                            query: `UPDATE buyers SET advance = ? WHERE buyer_mobile = ?`,
                            values: [0, product.mobile]
                        })

                    } else {
                        amount2 = b_amount - b_advance
                        await querys({
                            query: `UPDATE buyers SET advance = ? WHERE buyer_mobile = ?`,
                            values: [0, product.mobile]
                        })

                    }
                }
                await querys({
                    query: `UPDATE products SET quantity_available = ?, quantity_sold = ? WHERE product_id = ?`,
                    values: [exists.quantity_available - sold, exists.quantity_sold + sold, id]
                });

                await querys({
                    query: `INSERT INTO transactions (transaction_id, vegetable_id, product_id, marketer_mobile, buyer_mobile, amount, magamai_src, magamai_type,
                        farmer_mobile, quantity, veg_name, commission, farmer_payment, buyer_payment, rent, wage,magamai, farmer_status, farmer_amount,buyer_status, buyer_amount, farmer_advance, buyer_advance, invoiceId,farmer_rent, farmer_wage, invoice_Id,sack_price, f_quantity, f_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    values: [trans_id, exists.vegetable_id, id, exists.marketer_mobile, product.mobile, amount, magamaiSource?.magamaiSource, magamaiType,
                        exists.farmer_mobile, sold, exists.veg_name, commission, amount1, amount2, rent, wage, magamai, amount1 === 0 ? "paid" : "pending", f_amount, amount2 === 0 ? "paid" : "pending", b_amount, f_advance, b_advance, null, far_rent, far_wage, invoice, sack_price, sold, amount]
                });

                return NextResponse.json({
                    message: 'Product Updated successfully',
                    status: 200
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: 'Product not found',
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


export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const { pathname } = new URL(req.url)
        const segments = pathname.split('/').filter(segment => segment);
        const encodes = segments.pop();
        const id = decodeURIComponent(encodes)

        if (decoded.role == 'marketer' || decoded.role == 'assistant') {

            const rows = await querys({
                query: `SELECT DISTINCT p.product_id, p.quantity_available, p.proposed_price, 
                    v.veg_id, v.veg_name, f.farmer_name AS farmer_name, u.user_name AS marketer_name, p.image, p.unit, d.commission, d.magamai FROM products p
                    JOIN vegetables v ON p.vegetable_id = v.veg_id
                    LEFT JOIN users u ON v.marketer_mobile = u.user_mobile
                    LEFT JOIN farmers f ON p.farmer_mobile = f.farmer_mobile AND v.marketer_mobile=f.marketer_mobile
                    LEFT JOIN default_setting d ON v.marketer_mobile = d.marketer_mobile
                    WHERE v.veg_id = ? AND p.quantity_available != ?`,
                values: [id, 0]
            });

            if (rows) {
                return NextResponse.json({
                    message: 'Product Listed successfully',
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

export async function DELETE(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const { pathname } = new URL(req.url)
        const segments = pathname.split('/').filter(segment => segment);
        const id = segments.pop();

        const role = decoded.role

        if (role == 'marketer' || decoded.role == 'assistant') {
            const rows = await querys({
                query: `DELETE FROM products WHERE product_id = ?`,
                values: [id]
            });

            if (rows.affectedRows > 0) {
                return NextResponse.json({
                    message: 'Product Deleted successfully',
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
