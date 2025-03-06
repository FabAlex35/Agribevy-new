export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { querys } from '@/src/app/lib/DbConnection';

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const buyer = await req.json();

        // Input validation
        if (!buyer.name || !buyer.mobile || !buyer.address) {
            return NextResponse.json({
                message: 'Invalid input',
                status: 400
            }, { status: 400 });
        }
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

            const [active] = await querys({
                query: `SELECT * FROM buyers WHERE marketer_mobile = ? AND buyer_mobile = ? AND status = ?`,
                values: [userMobile, buyer.mobile, 0]
            })

            const [inActive] = await querys({
                query: `SELECT * FROM buyers WHERE marketer_mobile = ? AND buyer_name = ? AND status = ?`,
                values: [userMobile, buyer.name, 0]
            })

            if (active) {
                const [already] = await querys({
                    query: `SELECT * FROM buyers WHERE marketer_mobile = ? AND buyer_name = ? AND status = ?`,
                    values: [userMobile, buyer.name, 1]
                })

                if (already) {
                    return NextResponse.json({
                        message: 'Buyer Name already exists',
                        status: 400
                    }, { status: 400 });
                }

                await querys({
                    query: `UPDATE buyers SET buyer_name = ?, buyer_address = ?, status = ? WHERE marketer_mobile = ? AND buyer_mobile = ?`,
                    values: [buyer.name, buyer.address, 1, userMobile, buyer.mobile]
                })

                return NextResponse.json({
                    message: 'Buyer Activated successfully',
                    status: 200
                }, { status: 200 });
            }

            if (inActive) {
                await querys({
                    query: `INSERT INTO buyers (marketer_mobile, buyer_name, buyer_mobile, buyer_address, status) VALUES (?, ?, ?, ?, ?)`,
                    values: [userMobile, buyer.name, buyer.mobile, buyer.address, 1]
                });

                return NextResponse.json({
                    message: 'Buyer Added successfully',
                    status: 200
                }, { status: 200 });
            }


            const existingBuyer = await querys({
                query: `SELECT * FROM buyers 
                         WHERE marketer_mobile = ? 
                         AND (buyer_name = ? OR buyer_mobile = ?)`,
                values: [userMobile, buyer.name, buyer.mobile]
            });

            // Initialize flags for duplicates
            let nameExists = false;
            let mobileExists = false;

            // Check if there are any existing records
            if (existingBuyer.length > 0) {
                // Loop through existing records to identify duplicates
                existingBuyer.forEach(buyers => {
                    if (buyers.buyer_name === buyer.name) {
                        nameExists = true;
                    }
                    if (buyers.buyer_mobile === buyer.mobile) {
                        mobileExists = true;
                    }
                });
            }

            // Prepare the response based on the found duplicates
            if (nameExists && mobileExists) {
                return NextResponse.json({
                    message: 'Buyer Name and Number already exists',
                    status: 400
                }, { status: 400 });
            } else if (nameExists) {
                return NextResponse.json({
                    message: 'Buyer Name already exists',
                    status: 400
                }, { status: 400 });
            } else if (mobileExists) {
                return NextResponse.json({
                    message: 'Buyer Mobile Number already exists',
                    status: 400
                }, { status: 400 });
            }


            await querys({
                query: `INSERT INTO buyers (marketer_mobile, buyer_name, buyer_mobile, buyer_address,status) VALUES (?, ?, ?, ?,?)`,
                values: [userMobile, buyer.name, buyer.mobile, buyer.address, 1]
            });

            return NextResponse.json({
                message: 'Buyer added successfully',
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
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                message: 'Buyer already exists',
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
                query: `SELECT * FROM buyers WHERE marketer_mobile = ? AND status=1`,
                values: [userMobile]
            });

            return NextResponse.json({
                message: 'Buyers Listed successfully',
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
