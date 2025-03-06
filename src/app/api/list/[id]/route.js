export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        
        let marketerMobile = decoded.mobile;
        const role = decoded.role;

        // Extract phone number from the URL path
        const { pathname } = new URL(req.url);
        const segments = pathname.split('/').filter(segment => segment);
        const id = segments.pop();

        const vegetables = await req.json();

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

                marketerMobile = num?.created_by;
            }

            for (let vegetable of vegetables) {
                // Check if the shortcut_key already exists for this marketer
                const [existing] = await querys({
                    query: `SELECT veg_id FROM vegetables WHERE shortcut_key = ? AND marketer_mobile = ? AND veg_id != ?`,
                    values: [vegetable.shortcut_key, marketerMobile, vegetable.veg_id]
                });

                if (existing) {
                    return NextResponse.json({
                        message: `Shortcut key '${vegetable.shortcut_key}' is already in use for this marketer`,
                        status: 400
                    }, { status: 400 });
                }

                // Update the vegetable record with the new shortcut_key
                await querys({
                    query: `UPDATE vegetables SET shortcut_key = ? WHERE veg_id = ? AND marketer_mobile = ?`,
                    values: [vegetable.shortcut_key, vegetable.veg_id, marketerMobile]
                });
            }

            return NextResponse.json({
                message: 'Shortcut Added/Updated successfully',
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



export async function DELETE(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const role = decoded.role;

        // Extract phone number from the URL path
        const { pathname } = new URL(req.url);
        const segments = pathname.split('/').filter(segment => segment);
        const id = segments.pop();

        if (role == 'marketer') {
            // Fetch inventory data for the marketer
            const query = await querys({
                query: `UPDATE vegetables SET status=? WHERE veg_id = ?`,
                values: [0,id]
            });

            // Return the inventory data
            return NextResponse.json({
                message: 'Vegetable Removed successfully',
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