import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const response = NextResponse.json({
            message: "Successfully logged out",
            status: 200,
        });

        response.headers.append("x-token", ""); 
        response.headers.append("Authorization", ""); 

        return response;
    } catch (error) {
        console.error("Error during logout:", error);
        return NextResponse.json(
            { message: "Failed to log out", status: 500 },
            { status: 500 }
        );
    }
}
