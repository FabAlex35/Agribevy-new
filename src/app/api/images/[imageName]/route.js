import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request, { params }) {
    const { imageName } = params; // Extract the dynamic image name from the URL

    // Define the directory where images are stored
    const imagePath = path.join('C:/images', imageName);

    try {
        // Read the image file
        const imageBuffer = await fs.readFile(imagePath);

        // Return the image as a response with the correct Content-Type
        return new NextResponse(imageBuffer, {
            headers: { 'Content-Type': 'image/jpeg' }, // Adjust MIME type if needed
        });
    } catch (error) {
        // Return a 404 error if the file is not found
        return new NextResponse('File not found', { status: 404 });
    }
}
