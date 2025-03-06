export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];

        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        const { role } = decoded;
        const { id } = params;
        const user = await req.json();

        if (!user.name || !user.mobile || !user.access) {
            return NextResponse.json({ message: "Missing required fields", status: 400 }, { status: 400 });
        }

        if (role === "marketer") {
            const result = await querys({
                query: `UPDATE users SET user_name = ?, user_mobile = ?, access = ? WHERE user_id = ?`,
                values: [user.name, user.mobile, user.access, id]
            });

            if (result.affectedRows > 0) {
                return NextResponse.json({ message: "Assistant updated successfully", status: 200 }, { status: 200 });
            } else {
                return NextResponse.json({ message: "Assistant not found", status: 404 }, { status: 404 });
            }
        } else {
            return NextResponse.json({ message: "Unauthorized", status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.error("Server Error:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ message: "Mobile Number already exists", status: 409 }, { status: 409 });
        }
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];

        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        const { role } = decoded;
        const { id } = params;

        if (role === "marketer") {
            const result = await querys({
                query: `DELETE FROM users WHERE user_id = ?`,
                values: [id]
            });

            if (result.affectedRows > 0) {
                return NextResponse.json({ message: "Assistant removed successfully", status: 200 }, { status: 200 });
            } else {
                return NextResponse.json({ message: "Assistant not found", status: 404 }, { status: 404 });
            }
        } else {
            return NextResponse.json({ message: "Unauthorized", status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
    }
}
