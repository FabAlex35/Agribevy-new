export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];

        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        const { userId: marketerId, role, mobile } = decoded;

        const user = await req.json();

        if (!user.name || !user.password || !user.mobile) {
            return NextResponse.json({ message: "Missing required fields", status: 400 }, { status: 400 });
        }

        if (!user.access?.accounts && !user.access?.inventory && !user.access?.sales) {
            return NextResponse.json({ message: "Access is missing", status: 422 }, { status: 422 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPW = await bcrypt.hash(user.password, salt);
        const id = nanoid();

        if (role === "marketer") {
            const [list] = await querys({ query: `SELECT * FROM users WHERE user_id = ?`, values: [marketerId] });

            const rows = await querys({
                query: `INSERT INTO users (user_id, user_name, user_pwd, user_mobile, user_role, user_address, market, access, created_by) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                values: [id, user.name, hashPW, user.mobile, user.role, "No need", list?.market, user.access, mobile]
            });

            if (rows.affectedRows > 0) {
                return NextResponse.json({ message: "Assistant registered successfully", status: 200 }, { status: 200 });
            } else {
                return NextResponse.json({ message: "Failed to register assistant", status: 400 }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: "Unauthorized", status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.log(error);
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ message: "Mobile Number already exists", status: 409 }, { status: 409 });
        }
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];

        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        const { mobile, role } = decoded;

        if (role === "marketer") {
            const rows = await querys({ query: `SELECT * FROM users WHERE created_by = ?`, values: [mobile] });

            return NextResponse.json({
                message: "Assistants Listed successfully",
                status: 200,
                data: rows.length > 0 ? rows : []
            }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Unauthorized", status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
    }
}
