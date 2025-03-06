export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {  
    try {
    
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1]; 

        // Extract role from middleware-decoded token (middleware passes the request)
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        
        if (decoded.role !== "marketer" && decoded.role !== "assistant") {
            return NextResponse.json({ message: "Unauthorized", status: 403 }, { status: 403 });
        }

        const rows = await querys({
            query: "SELECT veg_name, veg_id, path, tamil_name FROM veg_list WHERE status=1",
            values: []
        });

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: "No Data Found", status: 404 }, { status: 404 });
        }

        return NextResponse.json({
            message: "Vegetables Listed successfully",
            data: rows,
            status: 200
        }, { status: 200 });

    } catch (error) {
        console.error("Error in /api/admin/vegetables:", error);
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
    }
}
