export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        const ids = await req.json();
        // const ids = vegetable.veg_id;
 
        let vegetable_id;
        let mobile = decoded.mobile;
 
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
                mobile = num?.created_by;
            }
 
            const check = await querys({
                query: `SELECT * FROM vegetables WHERE marketer_mobile = ?`,
                values: [mobile]
            });
 
            if (check.length > 0) {
                if (ids.length > 0) {
                    const oldIds = check.map(item => item.list_id);
                    const deselectedIds = oldIds.filter(id => !ids.includes(id));
 
                    if (deselectedIds.length > 0) {
                        for (let id of deselectedIds) {
                            await querys({
                                query: `UPDATE vegetables SET status = 0 WHERE list_id = ? AND marketer_mobile = ?`,
                                values: [id, mobile]
                            });
                        }
                    }
 
                    for (let id of ids) {
                        const vegetableExists = check.some(item => item.list_id === id);
                        if (!vegetableExists) {
                            const [{ veg_name }] = await querys({
                                query: `SELECT veg_name FROM veg_list WHERE veg_id = ?`,
                                values: [id]
                            });
                            vegetable_id = `${veg_name}_${mobile}`;
 
                            await querys({
                                query: `INSERT INTO vegetables (veg_id, veg_name, marketer_mobile, list_id, status) VALUES (?, ?, ?, ?, ?)`,
                                values: [vegetable_id, veg_name, mobile, id, 1]
                            });
                        } else {
                            const vegetableWithStatusZero = check.find(item => item.list_id === id && item.status === 0);
                            if (vegetableWithStatusZero) {
                                await querys({
                                    query: `UPDATE vegetables SET status = 1 WHERE list_id = ? AND marketer_mobile = ?`,
                                    values: [id, mobile]
                                });
                            }
                        }
                    }
                } else {
                    return NextResponse.json({
                        message: 'Make sure to select at least one vegetable',
                        status: 400
                    }, { status: 400 });
                }
            }
            else {
                if (ids.length > 0) {
                    for (let id of ids) {
                        const [{ veg_name }] = await querys({
                            query: `SELECT veg_name FROM veg_list WHERE veg_id = ?`,
                            values: [id]
                        })
                        vegetable_id = `${veg_name}_${mobile}`;
                        await querys({
                            query: `INSERT INTO vegetables (veg_id, veg_name, marketer_mobile, list_id, status) VALUES (?, ?, ?, ?, ?)`,
                            values: [vegetable_id, veg_name, mobile, id, 1]
                        });
                    }
                } else {
                    return NextResponse.json({
                        message: 'Make sure to select at least one vegetable',
                        status: 400
                    }, { status: 400 });
                }
            }
 
            return NextResponse.json({
                message: 'Vegetable added/updated successfully',
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
                message: 'Vegetable already exists',
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

            // Fetch inventory data with tamil_name from the veg_list table
            const query = await querys({
                query: `SELECT v.*, vl.tamil_name FROM vegetables v
                        LEFT JOIN veg_list vl ON v.list_id = vl.veg_id
                        WHERE v.marketer_mobile = ? AND v.status = ?`,
                values: [marketerMobile, 1]
            });

            // Return the inventory data
            return NextResponse.json({
                message: 'Vegetable Listed successfully',
                data: query,
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
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}
