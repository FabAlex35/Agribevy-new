export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
     
        const data = await req.json();
        const { wages } = data; // Expecting an array of wage objects

        if (!Array.isArray(wages) || wages.length === 0) {
            return NextResponse.json({
                status: 400,
                message: "Wages array is required and cannot be empty."
            }, { status: 400 });
        }

        let userMobile = decoded.mobile;
        const role = decoded.role;

        if (role === "marketer" || role === "assistant") {

            if (role === "assistant") {
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_id = ?`,
                    values: [decoded.userId]
                });

                if (!num) {
                    return NextResponse.json({
                        message: "User not found",
                        status: 404
                    }, { status: 404 });
                }

                userMobile = num?.created_by;
            }

            for (const wag of wages) {
                const { from_kg, to_kg, wage } = wag;

                if ((!from_kg&&from_kg!=0) || !to_kg || (!wage&&wage!=0)) {
                    return NextResponse.json({
                        status: 400,
                        message: `Wage entry with missing fields: from_kg=${from_kg}, to_kg=${to_kg}, wage=${wage}`
                    }, { status: 400 });
                }

                // Check if the wage range already exists for this marketer
                const [overlappingRange] = await querys({
                    query: `
                        SELECT * FROM wages 
                        WHERE marketer_mobile = ? 
                        AND (
                            (from_kg <= ? AND to_kg >= ?) OR  -- Existing range overlaps with new range
                            (from_kg >= ? AND from_kg <= ?)  -- New range starts within existing range
                        )
                    `,
                    values: [userMobile, to_kg, from_kg, from_kg, to_kg]
                });

                if (overlappingRange) {
                    return NextResponse.json({
                        status: 409,
                        message: `Wage range '${from_kg}-${to_kg}' overlaps with an existing range '${overlappingRange.from_kg}-${overlappingRange.to_kg}'.`
                    }, { status: 409 });
                }

                // Insert new wage into database
                const result = await querys({
                    query: `INSERT INTO wages (wage_id, from_kg, to_kg, wage, marketer_mobile) VALUES (?, ?, ?, ?, ?)`,
                    values: [nanoid(), from_kg, to_kg, wage, userMobile]
                });

                if (result.affectedRows === 0) {
                    return NextResponse.json({
                        status: 400,
                        message: `Failed to add wage for range '${from_kg}-${to_kg}'.`
                    }, { status: 400 });
                }
            }

            return NextResponse.json({
                message: "All wages added successfully.",
                status: 200
            }, { status: 200 });

        } else {
            return NextResponse.json({
                message: "Unauthorized",
                status: 403
            }, { status: 403 });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({
            message: "Server Error",
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
        if (decoded.role === "marketer" || decoded.role === "assistant") {

            if (decoded.role === "assistant") {
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_id = ?`,
                    values: [decoded.userId]
                });

                if (!num) {
                    return NextResponse.json({
                        message: "User not found",
                        status: 404
                    }, { status: 404 });
                }

                userMobile = num?.created_by;
            }

            const rows = await querys({
                query: `SELECT * FROM wages WHERE marketer_mobile = ? ORDER BY from_kg ASC`,
                values: [userMobile]
            });

            if (rows) {
                return NextResponse.json({
                    message: "Wages listed successfully",
                    data: rows,
                    status: 200
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: "No Data Found",
                    status: 404
                }, { status: 404 });
            }
        } else {
            return NextResponse.json({
                message: "Unauthorized",
                status: 403
            }, { status: 403 });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({
            message: "Server Error",
            status: 500
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
     
        const data = await req.json();
        const { from_kg, to_kg, wage, wage_id } = data;

        if (!wage_id || (!from_kg && from_kg!=0) || !to_kg || (!wage&&wage!=0)) {
            return NextResponse.json({
                status: 400,
                message: "All fields are required"
            }, { status: 400 });
        }

        const role = decoded.role;
        let userMobile = decoded.mobile;

        if (role === "marketer" || role === "assistant") {

            if (role === "assistant") {
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_id = ?`,
                    values: [decoded.userId]
                });

                if (!num) {
                    return NextResponse.json({
                        message: "User not found",
                        status: 404
                    }, { status: 404 });
                }

                userMobile = num?.created_by;
                const [exists] = await querys({
                    query: `SELECT * FROM wages WHERE wage_id = ? AND marketer_mobile = ?`,
                    values: [wage_id, userMobile]
                });

                if (!exists) {
                    return NextResponse.json({
                        message: "Unauthorized or Wage not found",
                        status: 403
                    }, { status: 403 });
                }
            }

            const [overlappingRange] = await querys({
                query: `
                    SELECT * FROM wages 
                    WHERE marketer_mobile = ? 
                    AND wage_id != ? 
                    AND (
                        (from_kg <= ? AND to_kg >= ?) OR  -- Existing range overlaps with new range
                        (from_kg >= ? AND from_kg <= ?)  -- New range starts within existing range
                    )
                `,
                values: [userMobile, wage_id, to_kg, from_kg, from_kg, to_kg]
            });

            if (overlappingRange) {
                return NextResponse.json({
                    status: 409,
                    message: `Wage range '${from_kg}-${to_kg}' overlaps with an existing range '${overlappingRange.from_kg}-${overlappingRange.to_kg}'.`
                }, { status: 409 });
            }

            // Update the wage in the database
            const result = await querys({
                query: `UPDATE wages SET from_kg = ?, to_kg = ?, wage = ? WHERE wage_id = ?`,
                values: [from_kg, to_kg, wage, wage_id]
            });

            if (result.affectedRows > 0) {
                return NextResponse.json({
                    message: "Wage updated successfully",
                    status: 200
                }, { status: 200 });
            }

            return NextResponse.json({
                message: "Failed to update wage",
                status: 400
            }, { status: 400 });
        } else {
            return NextResponse.json({
                message: "Unauthorized",
                status: 403
            }, { status: 403 });
        }
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({
            message: "Server Error",
            status: 500
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
       
        const { searchParams } = new URL(req.url);
        const wage_id = searchParams.get("wage_id");

        if (!wage_id) {
            return NextResponse.json({
                message: "Wage ID is required",
                status: 400
            }, { status: 400 });
        }

        let userMobile = decoded.mobile;
        const role = decoded.role;

        if (role === "marketer" || role === "assistant") {

            if (role === "assistant") {
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_id = ?`,
                    values: [decoded.userId]
                });

                if (!num) {
                    return NextResponse.json({
                        message: "User not found",
                        status: 404
                    }, { status: 404 });
                }

                userMobile = num?.created_by;
            }

            // Check if the wage exists and belongs to this marketer
            const [existingWage] = await querys({
                query: `SELECT * FROM wages WHERE wage_id = ? AND marketer_mobile = ?`,
                values: [wage_id, userMobile]
            });

            if (!existingWage) {
                return NextResponse.json({
                    message: "Wage not found or unauthorized access",
                    status: 404
                }, { status: 404 });
            }

            // Delete the wage
            const result = await querys({
                query: `DELETE FROM wages WHERE wage_id = ?`,
                values: [wage_id]
            });

            if (result.affectedRows > 0) {
                return NextResponse.json({
                    message: "Wage deleted successfully",
                    status: 200
                }, { status: 200 });
            }

            return NextResponse.json({
                message: "Failed to delete wage",
                status: 400
            }, { status: 400 });
        } else {
            return NextResponse.json({
                message: "Unauthorized",
                status: 403
            }, { status: 403 });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({
            message: "Server Error",
            status: 500
        }, { status: 500 });
    }
}
