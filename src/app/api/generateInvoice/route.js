export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { querys } from '@/src/app/lib/DbConnection';

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        let userMobile = decoded.mobile;

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
                query: `SELECT DISTINCT f.* FROM farmers f WHERE f.marketer_mobile = ? AND f.farmer_mobile IN (SELECT t.farmer_mobile FROM transactions t WHERE t.marketer_mobile = f.marketer_mobile AND t.invoiceId IS NULL);`,
                values: [userMobile]
            });

            return NextResponse.json({
                message: 'Farmers Listed successfully',
                status: 200,
                data: allBuyer
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
