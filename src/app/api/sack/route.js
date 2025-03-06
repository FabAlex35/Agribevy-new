export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
import { nanoid } from 'nanoid';

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const data = await req.json();
        const { sacks } = data; // Expecting an array of sack objects

        if (!Array.isArray(sacks) || sacks.length === 0) {
            return NextResponse.json({
                status: 400,
                message: "Sacks array is required and cannot be empty."
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

            for (const sack of sacks) {
                const { sack_type, sack_price } = sack;

                if (!sack_type || !sack_price) {
                    return NextResponse.json({
                        status: 400,
                        message: `Sack entry with missing fields: sack_type=${sack_type}, sack_price=${sack_price}`
                    }, { status: 400 });
                }

                // Check if sack_type already exists for this marketer
                const [existingSack] = await querys({
                    query: `SELECT * FROM sacks WHERE sack_type = ? AND marketer_mobile = ?`,
                    values: [sack_type, userMobile]
                });

                if (existingSack) {
                    return NextResponse.json({
                        status: 409,
                        message: `Sack type '${sack_type}' already exists.`
                    }, { status: 409 });
                }

                // Insert new sack into database
                const result = await querys({
                    query: `INSERT INTO sacks (sack_id, sack_type, sack_price, marketer_mobile) VALUES (?, ?, ?, ?)`,
                    values: [nanoid(), sack_type, sack_price, userMobile]
                });

                if (result.affectedRows === 0) {
                    return NextResponse.json({
                        status: 400,
                        message: `Failed to add sack '${sack_type}'.`
                    }, { status: 400 });
                }
            }

            return NextResponse.json({
                message: "All sacks added successfully.",
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
        if (decoded.role == 'marketer' || decoded.role == 'assistant') {

            if (decoded.role == 'assistant') {
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

                userMobile = num?.created_by
            }
            const rows = await querys({
                query: `SELECT * FROM sacks WHERE marketer_mobile = ?`,
                values: [userMobile]
            })

            if (rows) {
                return NextResponse.json({
                    message: 'Sacks Listed successfully',
                    data: rows,
                    status: 200
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: 'No Data Found',
                    status: 404
                }, { status: 404 });
            }
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


export async function PUT(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const data = await req.json();
        const { sack_type, sack_price, sack_id } = data;

        if (!sack_id || !sack_type || !sack_price) {
            return NextResponse.json({
                status: 400,
                message: 'All fields are required'
            }, { status: 400 });
        }

        const role = decoded.role;
        let userMobile = decoded.mobile

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

                userMobile = num?.created_by;
                const [exists] = await querys({
                    query: `SELECT * FROM sacks WHERE sack_id = ? AND marketer_mobile = ?`,
                    values: [sack_id, userMobile]
                });

                if (!exists) {
                    return NextResponse.json({
                        message: 'Unauthorized or Sack not found',
                        status: 403
                    }, { status: 403 });
                }
            }

            // Check if sack_capacity already exists for this marketer
            const [existingSack] = await querys({
                query: `SELECT * FROM sacks WHERE sack_type = ? AND marketer_mobile = ? AND sack_id != ?`,
                values: [sack_type, userMobile,sack_id]
            });

            if (existingSack) {
                return NextResponse.json({
                    message: 'Sack already exists',
                    status: 409 // Conflict
                }, { status: 409 });
            }


            // Update the sack in the database
            const result = await querys({
                query: `UPDATE sacks SET sack_type = ?, sack_price = ? WHERE sack_id = ?`,
                values: [sack_type, sack_price, sack_id]
            });

            if (result.affectedRows > 0) {
                return NextResponse.json({
                    message: 'Sack updated successfully',
                    status: 200
                }, { status: 200 });
            }

            return NextResponse.json({
                message: 'Failed to update sack',
                status: 400
            }, { status: 400 });
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

        const { searchParams } = new URL(req.url);
        const sack_id = searchParams.get('sack_id');

        if (!sack_id) {
            return NextResponse.json({
                message: 'Sack ID is required',
                status: 400
            }, { status: 400 });
        }

        let userMobile = decoded.mobile;
        const role = decoded.role;

        if (role == 'marketer' || role == "assistant") {

            if (role == 'assistant') {
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

                userMobile = num?.created_by;
            }

            // Check if the sack exists and belongs to this marketer
            const [existingSack] = await querys({
                query: `SELECT * FROM sacks WHERE sack_id = ? AND marketer_mobile = ?`,
                values: [sack_id, userMobile]
            });

            if (!existingSack) {
                return NextResponse.json({
                    message: 'Sack not found or unauthorized access',
                    status: 404
                }, { status: 404 });
            }

            // Delete the sack
            const result = await querys({
                query: `DELETE FROM sacks WHERE sack_id = ?`,
                values: [sack_id]
            });

            if (result.affectedRows > 0) {
                return NextResponse.json({
                    message: 'Sack deleted successfully',
                    status: 200
                }, { status: 200 });
            }

            return NextResponse.json({
                message: 'Failed to delete sack',
                status: 400
            }, { status: 400 });
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

