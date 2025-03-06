import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const mobile = new URL(req.url).pathname.split('/').filter(Boolean).pop();
        const data = await req.json();

        // Check if the user exists by their mobile
        const user  = await querys({
            query: 'SELECT * FROM users WHERE user_mobile = ?',
            values: [mobile]
        });

       if(user[0].user_role == 'marketer') {
        if (user.length != 0) {
            // Check if subscription data exists
            const [sub_data] = await querys({
                query: "SELECT * FROM subscriptions WHERE subscription_id = ?",
                values: [data?.id]
            });

            if (!sub_data) {
                return NextResponse.json({
                    message: 'Subscription Plan not found',
                    status: 400
                }, { status: 400 });
            }

            // Check if the user already has a subscription
            const check = await querys({
                query: "SELECT * FROM subscription_list WHERE user_id = ?",
                values: [user[0]?.user_id]
            });

            const today = new Date();
            const currentDate = today.toISOString().split('T')[0];

            // Ensure subscription_days exists and is a valid number
            const subscriptionDays = sub_data?.subscription_days || 0;
            today.setDate(today.getDate() + subscriptionDays);
            const endDate = today.toISOString().split('T')[0];

           

            // If the user doesn't have a subscription, insert a new one
            if (check.length === 0) {
                const setSubscription = await querys({
                    query: "INSERT INTO subscription_list (sub_id, start_date, sub_status, end_date, user_id, days, is_show) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    values: [sub_data?.subscription_id, currentDate, 1, endDate, user[0]?.user_id, sub_data?.subscriptionDays, 0]
                });

                return NextResponse.json({
                    message: 'Successfully Add Subscription',
                    status: 200
                }, { status: 200 });

            } else {
                // If the user already has a subscription, update it
                const setSubscription = await querys({
                    query: "UPDATE subscription_list SET sub_id = ?, start_date = ?, sub_status = ?, end_date = ?, days = ? WHERE user_id = ?",
                    values: [sub_data?.subscription_id, currentDate, 1, endDate, sub_data?.subscriptionDays, user[0]?.user_id]
                });

                return NextResponse.json({
                    message: 'Successfully Update Subscription',
                    status: 200
                }, { status: 200 });
            }
        } else {
            return NextResponse.json({
                message: 'No user found',
                status: 400
            }, { status: 400 });
        }
       }else{
            return NextResponse.json({
                message: 'Make Sure the user is Marketer',
                status: 400
            }, { status: 400 });
       }
        
    } catch (error) {
        console.error('Server Error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                message: 'Subscription for user already exists',
                status: 409
            }, { status: 409 });
        }

        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}
