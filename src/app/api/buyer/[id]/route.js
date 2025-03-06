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
                    query: `SELECT 
    t.invoice_Id,
    SUM(t.quantity) AS quantity,
    SUM(t.buyer_payment) AS buyer_payment,
    SUM(t.buyer_amount) AS buyer_amount,
    MAX(t.created_at) AS soldDate,
    CASE 
        WHEN SUM(CASE WHEN t.buyer_status = 'pending' THEN 1 ELSE 0 END) > 0 
        THEN 'pending' 
        ELSE 'paid' 
    END AS buyer_status,
    MAX(b.buyer_name) AS buyer_name,
    MAX(b.buyer_mobile) AS buyer_mobile,
    MAX(b.buyer_address) AS buyer_address,
    MAX(u.user_name) AS user_name,
    MAX(u.user_address) AS user_address,
    MAX(d.logo) AS logo,
    MAX(d.magamai) AS magamai,
    SUM(t.wage) AS total_wage,
    SUM(t.rent) AS total_rent,
    GROUP_CONCAT(DISTINCT v.veg_name) AS veg_name,
    MAX(vl.tamil_name) AS tamil_name,
    JSON_ARRAYAGG(t.transaction_id) AS transaction_id,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'veg_name', v.veg_name,
            'quantity', t.quantity,
            'amount', t.amount
        )
    ) AS details,
    GROUP_CONCAT(DISTINCT t.marketer_mobile) AS marketer_mobile
FROM 
    transactions t
JOIN 
    products p ON t.product_id = p.product_id
LEFT JOIN 
    users u ON t.marketer_mobile = u.user_mobile
LEFT JOIN 
    buyers b ON t.buyer_mobile = b.buyer_mobile AND t.marketer_mobile = b.marketer_mobile
LEFT JOIN 
    vegetables v ON p.vegetable_id = v.veg_id
LEFT JOIN 
    veg_list vl ON v.list_id = vl.veg_id
LEFT JOIN 
    default_setting d ON t.marketer_mobile = d.marketer_mobile
WHERE 
    t.buyer_mobile = ? 
    AND t.marketer_mobile = ? 
    AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
GROUP BY 
    t.invoice_Id;
`,
                    values: [user, userMobile]
                }),

                querys({ query: `SELECT * FROM transactions WHERE buyer_mobile = ? AND buyer_status = 'pending'`, values: [user] }),

                querys({ query: `SELECT * FROM buyers WHERE buyer_mobile = ? AND marketer_mobile=?`, values: [user, userMobile] }),

                querys({
                    query: `SELECT COALESCE(SUM(a.amount), 0), COALESCE(SUM(a.advance), 0),
                        COALESCE(SUM(a.amount), 0) + COALESCE(SUM(a.advance), 0) AS total_sum
                    FROM accounts a WHERE a.mobile = ? GROUP BY a.mobile;`, values: [user]
                })
            ]);

            // Calculate total amounts
            const totalAmount = allData.reduce((sum, { buyer_payment }) => sum + buyer_payment, 0);
            const totalAdvance = advanceData.length ? advanceData[0].advance : 0;
            const sum = total[0]?.total_sum || 0

            if (transactions.length > 0) {
                return NextResponse.json({
                    message: 'Buyer transaction Listed',
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

        const buyer = await req.json();
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
                query: `SELECT * FROM buyers WHERE marketer_mobile = ? AND buyer_name = ? AND status = ?`,
                values: [userMobile, buyer.name, 1]
            })

            if (active) {
                return NextResponse.json({
                    message: 'Buyer Name Already Exists',
                    status: 400
                }, { status: 400 });
            }

            const allBuyer = await querys({
                query: `UPDATE buyers SET buyer_name = ?, buyer_address = ? WHERE buyer_mobile = ? AND marketer_mobile = ?`,
                values: [buyer.name, buyer.address, mobile, userMobile]
            });

            return NextResponse.json({
                message: 'Buyer Updated successfully',
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
                query: `UPDATE buyers SET status = ? WHERE buyer_mobile = ? AND marketer_mobile = ?`,
                values: [0, mobile, userMobile]
            });

            return NextResponse.json({
                message: 'Buyer Removed successfully',
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