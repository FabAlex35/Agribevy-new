export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        // Extract phone number from the URL path
        const user = new URL(req.url).pathname.split('/').filter(Boolean).pop();

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
            const [transactions, allData, advanceData, total] = await Promise.all([
                querys({
                    query: `SELECT DISTINCT t.transaction_id, t.product_id, t.quantity AS sold, t.created_at AS soldDate, p.unit,
                        p.farmer_rent, p.quantity AS original, p.created_at AS purchasedDate, p.vegetable_id, p.image,
                        t.farmer_amount, t.farmer_status, p.proposed_price, p.farmer_wage, p.created_at AS addedDate,
                        f.farmer_name, f.farmer_mobile, f.farmer_address, u.user_name, u.user_address, d.logo, t.veg_name,
                        t.commission, t.magamai, p.farmer_wage, t.farmer_advance, t.marketer_mobile,
                        t.amount,t.farmer_payment,vl.tamil_name
                        FROM transactions t
                        LEFT JOIN products p ON t.product_id = p.product_id
                        LEFT JOIN default_setting d ON t.marketer_mobile = d.marketer_mobile
                        LEFT JOIN farmers f ON t.farmer_mobile = f.farmer_mobile AND t.marketer_mobile=f.marketer_mobile
                        LEFT JOIN vegetables v ON p.vegetable_id = v.veg_id
                        LEFT JOIN veg_list vl ON v.list_id = vl.veg_id
                        LEFT JOIN users u ON t.marketer_mobile = u.user_mobile
                        WHERE t.farmer_mobile = ? AND t.marketer_mobile=?
                        
                        AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)

                        UNION ALL
 
                        SELECT DISTINCT NULL AS transaction_id, p.product_id, p.quantity_available AS sold, NULL AS soldDate, p.unit,
                        p.farmer_rent, p.quantity AS original, p.created_at AS purchasedDate, p.vegetable_id,p.image, CASE WHEN p.unit ='kg' THEN p.quantity_available * p.proposed_price ELSE p.proposed_price END AS farmer_amount,
                        NULL AS farmer_status, p.proposed_price,  p.farmer_wage,  p.created_at AS addedDate, NULL AS farmer_name,
                        NULL AS farmer_mobile, NULL AS farmer_address, NULL AS user_name, NULL AS user_address, NULL AS logo, v.veg_name,
                        NULL AS commission, NULL AS magamai, p.farmer_wage, NULL AS farmer_advance, NULL AS marketer_mobile,NULL AS amount, NULL AS farmer_payment,vl.tamil_name
                        
                        FROM products p
                        LEFT JOIN vegetables v ON p.vegetable_id = v.veg_id
                        LEFT JOIN veg_list vl ON v.list_id = vl.veg_id
                        WHERE p.quantity_available > 0 AND p.farmer_mobile=? AND v.marketer_mobile=?
                        AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);`, values: [user, userMobile, user, userMobile]
                }),

                querys({ query: `SELECT * FROM transactions WHERE farmer_mobile = ? AND farmer_status = 'pending' AND marketer_mobile=?`, values: [user, userMobile] }),

                querys({ query: `SELECT * FROM farmers WHERE farmer_mobile = ? AND marketer_mobile=?`, values: [user,userMobile] }),
                querys({
                    query: `SELECT COALESCE(SUM(a.amount), 0), COALESCE(SUM(a.advance), 0),
                        COALESCE(SUM(a.amount), 0) + COALESCE(SUM(a.advance), 0) AS total_sum
                    FROM accounts a WHERE a.mobile = ? AND a.marketer_mobile=? GROUP BY a.mobile;`, values: [user, userMobile]
                })
            ]);

            // Calculate total amounts
            const totalAmount = allData.reduce((sum, { farmer_payment }) => sum + farmer_payment, 0);
            const totalAdvance = advanceData.length ? advanceData[0].advance : 0;
            const sum = total[0]?.total_sum || 0

            if (transactions.length > 0) {
                return NextResponse.json({
                    message: 'Farmer transaction Listed',
                    status: 200,
                    data: { totalAdvance, totalAmount, transactions, sum }
                }, { status: 200 });
            } else {
                return NextResponse.json({ message: 'User not found', status: 404 }, { status: 404 });
            }
        } else {
            return NextResponse.json({ message: 'Unauthorized', status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ message: 'Server Error', status: 500 }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const farmer = await req.json();
        let userMobile = decoded.mobile;
        const mobile = new URL(req.url).pathname.split('/').filter(Boolean).pop();

        if (decoded.role == 'marketer' || decoded.role == 'assistant') {

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

            const [active] = await querys({
                query: `SELECT * FROM farmers WHERE marketer_mobile = ? AND farmer_name = ? AND status = ?`,
                values: [userMobile, farmer.name, 1]
            })

            if (active) {
                return NextResponse.json({
                    message: 'Farmer Name Already Exists',
                    status: 400
                }, { status: 400 });
            }

            const allFarmer = await querys({
                query: `UPDATE farmers SET farmer_name = ?, farmer_address = ? WHERE farmer_mobile = ? AND marketer_mobile = ?`,
                values: [farmer.name, farmer.address, mobile, userMobile]
            });

            return NextResponse.json({
                message: 'Farmer Updated successfully',
                status: 200,
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

    } catch (error) {
        console.error('Server Error:', error);
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

        let userMobile = decoded.mobile;
        const mobile = new URL(req.url).pathname.split('/').filter(Boolean).pop();

        if (decoded.role == 'marketer' || decoded.role == 'assistant') {

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

            const allBuyer = await querys({
                query: `UPDATE farmers SET status = ? WHERE farmer_mobile = ? AND marketer_mobile = ?`,
                values: [0, mobile, userMobile]
            });

            return NextResponse.json({
                message: 'Farmer Removed successfully',
                status: 200,
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}