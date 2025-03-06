export const dynamic = "force-dynamic";

import { querys } from '@/src/app/lib/DbConnection';
import { generateRefreshToken, generateToken, showRole } from '@/src/app/lib/Token';
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import cookie from 'cookie';


export async function POST(req) {
    try {
        const user = await req.json()

        // Validate input values
        if (!user.name || !user.password || !user.mobile) {
            return NextResponse.json({
                message: 'Missing required fields: name, password, and mobile are required',
                status: 400
            }, { status: 400 });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashPW = await bcrypt.hash(user.password, salt)
        const id = nanoid();
        const sack_id = nanoid()
        let subs = {
            id:null,
            status:0,
        };

        // Check if the mobile number already exists
        const existingUser = await querys({
            query: 'SELECT * FROM users WHERE user_mobile = ?',
            values: [user.mobile]
        });

        if (existingUser.length > 0) {
            return NextResponse.json({
                message: 'Phone Number Already Exists',
                status: 409
            }, { status: 409 });
        }

        const existingFarmer = await querys({
            query: 'SELECT * FROM farmers WHERE farmer_mobile = ?',
            values: [user.mobile]
        });

        if (existingFarmer.length > 0 && user.role != 'farmer') {
            return NextResponse.json({
                message: 'You already exists as Farmer',
                status: 409
            }, { status: 409 });
        }

        const existingBuyer = await querys({
            query: 'SELECT * FROM buyers WHERE buyer_mobile = ?',
            values: [user.mobile]
        });

        if (existingBuyer.length > 0 && user.role != 'buyer') {
            return NextResponse.json({
                message: 'You already exists as Buyer',
                status: 409
            }, { status: 409 });
        }

        const rows = await querys({
            query: `INSERT INTO users (user_id, user_name, user_pwd, user_mobile, user_role, user_address, market, access, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            values: [id, user.name, hashPW, user.mobile, user.role, user.address, user.market || 'No need', '{}', 'own']
        });

        let users;
        if (rows.affectedRows > 0) {
            if (user.role === "marketer") {
                const rows = await querys({
                    query: `INSERT INTO sacks (sack_id, sack_type, sack_price,marketer_mobile) VALUES (?, ?, ?, ?)`,
                    values: [sack_id, "sack0/Box", 0, user.mobile]
                });
            }

            const [data] = await querys({
                query: `SELECT * FROM users WHERE user_id = ?`,
                values: [id]
            });
          
            users = data

            const response = NextResponse.json({
                message: 'User Registered successfully',
                status: 200
            }, { status: 200 })

            const accessToken = await generateToken(data,subs)
            const refreshToken = await generateRefreshToken(data)
            const role = showRole(users);

            response.headers.append('Set-Cookie', cookie.serialize('accessToken', accessToken, {
                httpOnly: true,  
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60,
                path: '/',
            }));

            response.headers.append('Set-Cookie', cookie.serialize('refreshToken', refreshToken, {
                httpOnly: true,  
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60,
                path: '/',
            }));

            response.headers.append('Set-Cookie', cookie.serialize('role', role, {
                httpOnly: false,  
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict', 
                maxAge: 24 * 60 * 60, 
                path: '/',
            }));

            return response
        } else {
            return NextResponse.json({
                message: 'Failed to register user',
                status: 400
            }, { status: 400 });
        }
    } catch (error) {
        console.log(error);
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

        // get user details
        const user = await req.json()
        const userId = decoded.userId;

        const rows = await querys({
            query: `UPDATE users SET user_name = ?, user_address = ?, market = ? WHERE user_id = ?`,
            values: [user.name, user.address, user.market || null, userId]
        });

        // Check if any rows were affected
        if (rows.affectedRows > 0) {
            return NextResponse.json({
                message: 'User updated successfully',
                status: 200
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: 'No user found with the given ID',
                status: 404
            }, { status: 404 });
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

        const userId = decoded.userId;

        // Perform the deletion
        const result = await querys({
            query: `DELETE FROM users WHERE user_id = ?`,
            values: [userId]
        });

        // Check if the deletion was successful
        if (result.affectedRows > 0) {
            // Create response with a cleared cookie
            const response = NextResponse.json({
                message: 'User deleted successfully',
                status: 200
            }, { status: 200 });

            // Clear the cookie
            response.headers.append('Set-Cookie', cookie.serialize('accessToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                expires: new Date(0), // Set expiration date in the past to clear the cookie
                path: '/',
            }));

            return response;
        } else {
            return NextResponse.json({
                message: 'User not found',
                status: 404
            }, { status: 404 });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}

export async function GET(req) {
    try {
         const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        
        const userId = decoded.userId;

        // Fetch user data from the database
        const rows = await querys({
            query: `SELECT * FROM users WHERE user_id = ?`,
            values: [userId]
        });

        // Check if any rows were returned
        if (rows.length > 0) {
            return NextResponse.json({
                message: 'User fetched successfully',
                status: 200,
                data: rows[0]
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: 'User not found',
                status: 404
            }, { status: 404 });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}