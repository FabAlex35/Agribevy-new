export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { querys } from '@/src/app/lib/DbConnection';

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const farmer = await req.json();

        // Input validation
        if (!farmer.name || !farmer.mobile || !farmer.address) {
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
                query: `SELECT * FROM farmers WHERE marketer_mobile = ? AND farmer_mobile = ? AND status = ?`,
                values: [userMobile, farmer.mobile, 0]
            })

            const [inActive] = await querys({
                query: `SELECT * FROM farmers WHERE marketer_mobile = ? AND farmer_name = ? AND status = ?`,
                values: [userMobile, farmer.name, 0]
            })

            if (active) {
                const [already] = await querys({
                    query: `SELECT * FROM farmers WHERE marketer_mobile = ? AND farmer_name = ? AND status = ?`,
                    values: [userMobile, farmer.name, 1]
                })

                if (already) {
                    return NextResponse.json({
                        message: 'Farmer Name already exists',
                        status: 400
                    }, { status: 400 });
                }

                await querys({
                    query: `UPDATE farmers SET farmer_name = ?, farmer_address=?,status = ? WHERE marketer_mobile = ? AND farmer_mobile = ?`,
                    values: [farmer.name, farmer.address,1, userMobile, farmer.mobile]
                })

                return NextResponse.json({
                    message: 'Farmer Activated successfully',
                    status: 200
                }, { status: 200 });
            }

            if (inActive) {
                await querys({
                    query: `INSERT INTO farmers (marketer_mobile, farmer_name, farmer_mobile, farmer_address, status) VALUES (?, ?, ?, ?, ?)`,
                    values: [userMobile, farmer.name, farmer.mobile, farmer.address, 1]
                });

                return NextResponse.json({
                    message: 'Farmer Added successfully',
                    status: 200
                }, { status: 200 });
            }

            const existingFarmer = await querys({
                query: `SELECT * FROM farmers 
                         WHERE marketer_mobile = ? 
                         AND (farmer_name = ? OR farmer_mobile = ?)`,
                values: [userMobile, farmer.name, farmer.mobile]
            });

            // Initialize flags for duplicates
            let nameExists = false;
            let mobileExists = false;

            // Check if there are any existing records
            if (existingFarmer.length > 0) {
                // Loop through existing records to identify duplicates
                existingFarmer.forEach(farmers => {
                    if (farmers.farmer_name === farmer.name) {
                        nameExists = true;
                    }
                    if (farmers.farmer_mobile === farmer.mobile) {
                        mobileExists = true;
                    }
                });
            }

            // Prepare the response based on the found duplicates
            if (nameExists && mobileExists) {
                return NextResponse.json({
                    message: 'Farmer Name and Number already exists',
                    status: 400
                }, { status: 400 });
            } else if (nameExists) {
                return NextResponse.json({
                    message: 'Farmer Name already exists',
                    status: 400
                }, { status: 400 });
            } else if (mobileExists) {
                return NextResponse.json({
                    message: 'Farmer Mobile Number already exists',
                    status: 400
                }, { status: 400 });
            }

            await querys({
                query: `INSERT INTO farmers (marketer_mobile, farmer_name, farmer_mobile, farmer_address,status) VALUES (?, ?, ?, ?,?)`,
                values: [userMobile, farmer.name, farmer.mobile, farmer.address, 1]
            });

            return NextResponse.json({
                message: 'Farmer added successfully',
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
                message: 'Farmer already exists',
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
                query: `SELECT * FROM farmers WHERE marketer_mobile = ? AND status=1`,
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
