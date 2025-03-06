export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { querys } from '@/src/app/lib/DbConnection';

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const marketer = await req.json();

        // Input validation
        if (!marketer.name || !marketer.mobile || !marketer.address) {
            return NextResponse.json({
                message: 'Invalid input',
                status: 400
            }, { status: 400 });
        }

        let userMobile = decoded.mobile;

        if (decoded.role == 'buyer') {

            const existingBuyer = await querys({
                query: `SELECT * FROM marketers 
                         WHERE buyer_mobile = ? 
                         AND (marketer_name = ? OR marketer_mobile = ?)`,
                values: [userMobile, marketer.name, marketer.mobile]
            });

            // Initialize flags for duplicates
            let nameExists = false;
            let mobileExists = false;

            // Check if there are any existing records
            if (existingBuyer.length > 0) {
                // Loop through existing records to identify duplicates
                existingBuyer.forEach(marketers => {
                    if (marketers.marketer_name === marketer.name) {
                        nameExists = true;
                    }
                    if (marketers.marketer_mobile === marketer.mobile) {
                        mobileExists = true;
                    }
                });
            }

            // Prepare the response based on the found duplicates
            if (nameExists && mobileExists) {
                return NextResponse.json({
                    message: 'Marketer Name and Number already exists',
                    status: 400
                }, { status: 400 });
            } else if (nameExists) {
                return NextResponse.json({
                    message: 'Marketer Name already exists',
                    status: 400
                }, { status: 400 });
            } else if (mobileExists) {
                return NextResponse.json({
                    message: 'Marketer Mobile Number already exists',
                    status: 400
                }, { status: 400 });
            }

            await querys({
                query: `INSERT INTO marketers (buyer_mobile, marketer_name, marketer_mobile, marketer_address) VALUES (?, ?, ?, ?)`,
                values: [userMobile, marketer.name, marketer.mobile, marketer.address]
            });

            return NextResponse.json({
                message: 'Marketer added successfully',
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
                message: 'Marketer already exists',
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

        if (decoded.role == 'buyer') {
            const allMarketers = await querys({
                query: `SELECT * FROM marketers WHERE buyer_mobile = ?`,
                values: [userMobile]
            });

            return NextResponse.json({
                message: 'Marketers Listed successfully',
                status: 200,
                data: allMarketers
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