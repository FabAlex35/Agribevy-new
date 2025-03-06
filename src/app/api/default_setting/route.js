export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        
        const data = await req.formData()
        
        const logo = data.get('file')
        const commission = parseFloat(data.get('commission'))
        const magamai = parseFloat(data.get('magamai'))
        const weekoff = data.get('weekoff')
        const magamaiSource = data.get('magamaiSource')
        const language = data.get('language')
        const app_language = data.get('app_language')
        const magamaiType = data.get('magamaiType')
        const year = parseInt(data.get('financialYear'))
        const billMode = data.get('bill_type')
        const magamai_show = parseInt(data.get("magamai_show"))
        
        const initialVisibleColumns = [
            'Product', 'Farmer', 'Buyer', 'Farmer Bill', 'Sold at', 'Buyer Amount'
        ];
        if (!logo) {
            return NextResponse.json({
                status: 400,
                message: 'No file uploaded'
            }, { status: 400 });
        }

        const mimeType = logo.type;
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!validMimeTypes.includes(mimeType)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid file type. Only JPEG, PNG, and JPG are allowed.'
            }, { status: 400 });
        }

        const bytes = await logo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const extname = path.extname(logo.name);
        const basename = path.basename(logo.name, extname);

        // Create new filename with a timestamp before the extension
        const newName = `${basename}-${Date.now().toString()}${extname}`;

        // Specify the directory on the local PC
        const uploadDirectory = 'C:\\images'; // Change to your desired location

        // Create the full path for storing the file
        const storePath = path.join(uploadDirectory, newName);

        // Write the file to the new location
        await writeFile(storePath, buffer);

        const marketerMobile = decoded.mobile
        const role = decoded.role

        if (role == 'marketer') {

            // Insert new product into database
            const result = await querys({
                query: `INSERT INTO default_setting (commission, weekoff, magamai, logo, marketer_mobile,financialYear,magamaiSource,salesColumn,language,app_language,magamaiType, bill_type, magamai_show) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                values: [commission, weekoff, magamai, storePath, marketerMobile, year, magamaiSource, initialVisibleColumns, language, app_language, magamaiType, billMode, magamai_show]
            });

            // Check if insertion was successful
            if (result.affectedRows > 0) {
                return NextResponse.json({
                    message: 'Default values added successfully',
                    data: {bill_type:billMode,show:magamai_show,type:magamaiSource},
                    status: 200
                }, { status: 200 });
            }

            return NextResponse.json({
                message: 'Failed to add Default values',
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

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                message: 'Farmer already exists',
                status: 400
            }, { status: 400 });
        }


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

        if (decoded.role == 'marketer') {
            const [rows] = await querys({
                query: `SELECT * FROM default_setting WHERE marketer_mobile = ?`,
                values: [decoded.mobile]
            })

            if (rows) {
                return NextResponse.json({
                    message: 'Default Setting Listed successfully',
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

        const data = await req.formData();
        const logo = data.get('file');
        const commission = parseFloat(data.get('commission'));
        const magamai = parseFloat(data.get('magamai'));
        const weekoff = data.get('weekoff');
        const magamaiSource = data.get('magamaiSource')
        const year = parseInt(data.get('financialYear'));
        const existing = data.get("existingLogo");
        const language = data.get("language");
        const app_language = data.get("app_language")
        const magamaiType = data.get("magamaiType")
        const billMode = data.get("bill_type")
        const magamai_show = parseInt(data.get("magamai_show"))

        const marketerMobile = decoded.mobile;
        const role = decoded.role;

        if (role !== 'marketer') {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

        let storePath = existing; // Default to existing logo path

        // Check if a new file has been uploaded
        if (!existing && logo) {
            const mimeType = logo.type;
            const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validMimeTypes.includes(mimeType)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid file type. Only JPEG, PNG, and JPG are allowed.'
                }, { status: 400 });
            }

            // await writeFile(uploadPath, buffer);
            const bytes = await logo.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const extname = path.extname(logo.name);
            const basename = path.basename(logo.name, extname);

            // Create new filename with a timestamp before the extension
            const newName = `${basename}-${Date.now().toString()}${extname}`;

            // Specify the directory on the local PC
            const uploadDirectory = 'C:\\images'; // Change to your desired location

            // Create the full path for storing the file
            storePath = path.join(uploadDirectory, newName);

            // Write the file to the new location
            await writeFile(storePath, buffer);
        }

        // Perform an UPDATE operation, including the logo if it has been changed
        const query = !existing
            ? `UPDATE default_setting SET commission = ?, weekoff = ?, magamai = ?, logo = ?, financialYear = ?, magamaiSource = ?, language = ?, app_language = ? , magamaiType = ?,
            bill_type = ? WHERE marketer_mobile = ?`
            : `UPDATE default_setting SET commission = ?, weekoff = ?, magamai = ?, financialYear = ?, magamaiSource = ?, language = ?, app_language = ?, magamaiType = ?, bill_type = ?,
            magamai_show = ? WHERE marketer_mobile = ?`;

        const values = logo
            ? [commission, weekoff, magamai, storePath, year, magamaiSource, language, app_language, magamaiType, billMode, marketerMobile]  // Including logo path
            : [commission, weekoff, magamai, year, magamaiSource, language, app_language, magamaiType, billMode, magamai_show, marketerMobile,];            // Without logo path if not updated

        const result = await querys({ query, values });

        // Check if the update was successful
        if (result.affectedRows > 0) {
            return NextResponse.json({
                message: 'Default values updated successfully',
                data: {bill_type:billMode,show:magamai_show,type:magamaiSource},
                status: 200
            }, { status: 200 });
        }

        return NextResponse.json({
            message: 'Failed to update Default values',
            status: 400
        }, { status: 400 });

    } catch (error) {
        console.error('Server Error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                message: 'Entry already exists',
                status: 400
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}
