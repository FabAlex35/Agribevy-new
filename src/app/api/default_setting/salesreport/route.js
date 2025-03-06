export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const data = await req.json();
        const columns = data

        let marketerMobile = decoded.mobile;

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

                marketerMobile = num?.created_by
            }

            const query = await querys({
                query: `UPDATE default_setting SET salesColumn = ? WHERE marketer_mobile=?`,
                values: [columns, marketerMobile]
            })

            // Check if the update was successful
            if (query.affectedRows > 0) {
                return NextResponse.json({
                    message: 'Columns updated successfully',
                    status: 200
                }, { status: 200 });
            }

            return NextResponse.json({
                message: 'Failed to update Default values',
                status: 400
            }, { status: 400 });
        } else {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 400
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Server Error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                message: 'Entry already exists',
                status: 400
            }, { status: 400 });
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

                marketerMobile = num?.created_by
            }

            const [columns]= await querys({
                query: `SELECT salesColumn FROM default_setting WHERE marketer_mobile = ?`,
                values: [marketerMobile]
            })

            if (columns) {
                return NextResponse.json({
                    message: 'Default Setting Listed successfully',
                    data: columns?.salesColumn,
                    status: 200
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: 'No Data Found',
                    status: 404
                }, { status: 404 });
            }
        }
        else {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 400
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Server Error:', error);

        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}