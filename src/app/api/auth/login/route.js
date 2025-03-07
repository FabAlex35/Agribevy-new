import { querys } from "@/src/app/lib/DbConnection";
import { generateToken, showRole, generateRefreshToken } from "@/src/app/lib/Token";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { mobile, password } = await req.json();

        if (!mobile || !password) {
            return NextResponse.json({ message: "Missing mobile or password", status: 400 }, { status: 400 });
        }

        // Fetch user from DB
        const rows = await querys({
            query: "SELECT * FROM users WHERE user_mobile = ?",
            values: [mobile],
        });

        if (rows.length === 0) {
            return NextResponse.json({ message: "No user found with this mobile number", status: 404 }, { status: 404 });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.user_pwd);
        if (!match) {
            return NextResponse.json({ message: "Incorrect password", status: 400 }, { status: 400 });
        }

        // Check subscription and role
        let subs = { id: null, status: 0 };
        let isSetting;
        const role = showRole(user);

        if (role === "marketer" || role === "assistant") {
            let marketerMobile = mobile;

            if (role === "assistant") {
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_mobile = ?`,
                    values: [mobile],
                });

                if (!num) {
                    return NextResponse.json({ message: "User not found", status: 404 }, { status: 404 });
                }
                marketerMobile = num?.created_by;
            }

            const [settings] = await querys({
                query: "SELECT * FROM default_setting WHERE marketer_mobile = ?",
                values: [marketerMobile],
            });

            isSetting = settings ? true : false;

            const [{ user_id }] = await querys({
                query: "SELECT user_id FROM users WHERE user_mobile = ?",
                values: [marketerMobile],
            });

            const sub = await querys({
                query: "SELECT * FROM subscription_list WHERE user_id = ?",
                values: [user_id],
            });

            if (sub.length > 0) {
                subs = { id: sub[0]?.user_id, status: sub[0]?.sub_status };
            }
        }

        // Generate tokens
        const accessToken = await generateToken(user, subs);
        const refreshToken = await generateRefreshToken(user, subs);

        console.log(accessToken,'***********',refreshToken,'1111111111111111');

        const response = NextResponse.json({
            message: "Successfully logged in",
            data: { user_id: user.user_id, user_mobile: user.user_mobile, isSetting, role, accessToken, refreshToken },
            status: 200,
        });

        response.headers.append("Authorization", `Bearer ${accessToken}`); 
        response.headers.append("x-token", `Bearer ${refreshToken}`); 

        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
    }
}
