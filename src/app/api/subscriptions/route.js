export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { querys } from "../../lib/DbConnection";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        let userId = decoded.userId;
        let role = decoded.role;

        if (role === 'assistant') {
            const [{ created_by }] = await querys({
                query: `SELECT created_by FROM users WHERE user_id = ?`,
                values: [userId]
            })

            const [{ user_id }] = await querys({
                query: `SELECT user_id FROM users WHERE user_mobile = ?`,
                values: [created_by]
            })

            userId = user_id;
        }

        const subscription = await querys({
            query: `SELECT * FROM subscription_list WHERE user_id = ?`,
            values: [userId]
        })

        if(subscription.length > 0){
            return NextResponse.json({
                message: 'Subscription Details',
                data: subscription[0],
                status: 200
            }, { status: 200 }); 
        }else{
            const sub_detail = {
                status: 0,
                user_id: userId,
                days: null,
                sub_id: null,
                is_show: 0
            } 
            return NextResponse.json({
                message: 'Subscription Details',
                data: sub_detail,
                status: 200
            }, { status: 200 }); 
        }

    } catch (error) {
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}


export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        
        let userId = decoded.userId;
        let role = decoded.role;

        if (role === 'assistant') {
            const [{ created_by }] = await querys({
                query: `SELECT created_by FROM users WHERE user_id = ?`,
                values: [userId]
            });

            const [{ user_id }] = await querys({
                query: `SELECT user_id FROM users WHERE user_mobile = ?`,
                values: [created_by]
            });

            userId = user_id;
        }

        // Update subscription visibility
        await querys({
            query: `UPDATE subscription_list SET is_show = ? WHERE user_id = ?`,
            values: [0, userId]
        });

        return NextResponse.json({
            message: 'Subscription Updated',
            status: 200
        }, { status: 200 });
       
    } catch (error) {
        return NextResponse.json({
            message: 'Server Error',
        }, { status: 500 });
    }
}
