export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const data = await req.formData();
        const products = [];
        let index = 0;

        // Extract products from FormData
        while (data.has(`products[${index}][name]`)) {
            const product = {
                name: data.get(`products[${index}][name]`),
                veg_id: data.get(`products[${index}][veg_id]`),
                farmer: data.get(`products[${index}][farmer]`),
                mobile: data.get(`products[${index}][mobile]`),
                quantity: parseInt(data.get(`products[${index}][quantity]`), 10) || 0,
                unit: data.get(`products[${index}][unit]`),
                price: parseInt(data.get(`products[${index}][price]`), 10) || 0,
                farmer_wage: parseInt(data.get(`products[${index}][farmer_wage]`), 10) || 0,
                farmer_rent: parseInt(data.get(`products[${index}][farmer_rent]`), 10) || 0,
                sack_price: parseInt(data.get(`products[${index}][sack_price]`), 10) || 0,
                file: data.get(`products[${index}][file]`)
            };
            products.push(product);
            index++;
        }

        if (products.length === 0) {
            return NextResponse.json({
                message: 'No products provided',
                status: 400
            }, { status: 400 });
        }

        let marketerMobile = decoded.mobile;
        const role = decoded.role;

        if (role !== 'marketer' && role !== 'assistant') {
            return NextResponse.json({
                message: 'Unauthorized',
                status: 403
            }, { status: 403 });
        }

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

            marketerMobile = num?.created_by;
        }

        // Validate vegetable ownership for the marketer
        const vegIds = products.map(product => product.veg_id);

        let existingVegetables;
        try {
            if (vegIds.length === 0) {
                return NextResponse.json({
                    message: 'No vegetable IDs provided',
                    status: 400
                }, { status: 400 });
            }

            // Modify the query to handle the array properly
            existingVegetables = await querys({
                query: `SELECT veg_id FROM vegetables WHERE veg_id IN (${vegIds.map(() => '?').join(',')}) AND marketer_mobile = ?`,
                values: [...vegIds, marketerMobile] // Spread vegIds into individual parameters
            });
        } catch (error) {
            console.error("Database Query Error:", error);
            return NextResponse.json({
                message: 'Error fetching vegetables',
                status: 500
            }, { status: 500 });
        }

        // Check query results
        if (!existingVegetables || !Array.isArray(existingVegetables)) {
            console.error("Unexpected Query Result:", existingVegetables);
            return NextResponse.json({
                message: 'Failed to validate vegetables',
                status: 500
            }, { status: 500 });
        }

        const validVegIds = new Set(existingVegetables.map(veg => veg.veg_id)); // Extract valid vegetable IDs
        for (const product of products) {
            if (!validVegIds.has(product.veg_id)) {
                return NextResponse.json({
                    message: `Invalid vegetable ID: ${product.veg_id}`,
                    status: 404
                }, { status: 404 });
            }
        }

        // Fetch and set farmer_wage from wages table for each product
        for (const product of products) {
            const [wageRecord] = await querys({
                query: `SELECT wage FROM wages WHERE marketer_mobile = ? AND from_kg <= ? AND to_kg >= ? LIMIT 1`,
                values: [marketerMobile, product.quantity, product.quantity]
            });

            if (wageRecord) {
                product.farmer_wage = wageRecord.wage; 
            }
            else {
                product.farmer_wage = 0;
            }
        }
        // Prepare and execute database inserts
        const insertPromises = products.map(async (product) => {
            const id = nanoid();
            let storePath;

            if (product.file) {
                const mimeType = product.file.type;
                const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

                if (!validMimeTypes.includes(mimeType)) {
                    throw new Error(`Invalid file type for ${product.name}. Only JPEG, PNG, and JPG are allowed.`);
                }

                const bytes = await product.file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const extname = path.extname(product.file.name);
                const basename = path.basename(product.file.name, extname);

                // Create new filename with a timestamp
                const newName = `${basename}-${Date.now().toString()}${extname}`;
                const uploadDirectory = 'C:\\images';
                storePath = path.join(uploadDirectory, newName);

                // Write the file to the new location
                await writeFile(storePath, buffer);
            } else {

                const [{ list_id }] = await querys({
                    query: `SELECT list_id FROM vegetables WHERE veg_id=?`,
                    values: [product.veg_id]
                })

                const [{ path }] = await querys({
                    query: `SELECT path FROM veg_list WHERE veg_id=?`,
                    values: [list_id]
                })
                // Default image path
                // storePath = "C:\\images\\veg.jpg";
                storePath = path;

            }

            return querys({
                query: `INSERT INTO products (product_id, vegetable_id, proposed_price,             farmer_mobile, quantity, quantity_available, quantity_sold, unit, image, farmer_wage, farmer_rent,sack_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)`,
                values: [id, product.veg_id, product.price, product.mobile, product.quantity, product.quantity, 0, product.unit, storePath, product.farmer_wage, product.farmer_rent, product.sack_price]
            });
        });

        const results = await Promise.all(insertPromises);

        // Check if all inserts were successful
        if (results.every(result => result.affectedRows > 0)) {
            return NextResponse.json({
                message: 'All products added successfully',
                status: 200
            }, { status: 200 });
        }

        return NextResponse.json({
            message: 'Some products failed to be added',
            status: 400
        }, { status: 400 });

    } catch (error) {
        console.error('Server Error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                message: 'Duplicate product found',
                status: 409
            }, { status: 409 });
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

        const rows = await querys({
            query: `SELECT DISTINCT p.product_id, p.quantity, p.image, p.unit, p.quantity_available, p.proposed_price, v.veg_id, v.veg_name,
                    u.user_name AS farmer_name, CASE WHEN p.quantity_available = 0 THEN 'sold' 
                    WHEN p.quantity = p.quantity_available THEN 'notyet' ELSE 'partialsold' END AS status
                    FROM products p JOIN vegetables v ON p.vegetable_id = v.veg_id JOIN farmers f ON 
                    p.farmer_mobile = f.farmer_mobile JOIN users u ON p.farmer_mobile = u.user_mobile 
                    WHERE p.farmer_mobile = ?`,
            values: [decoded.mobile]
        });

        if (rows) {
            return NextResponse.json({
                message: 'Product Listed successfully',
                data: rows,
                status: 200
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: 'No Data Found',
                status: 404
            }, { status: 404 });
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

        const productList = await req.json();
        if (!Array.isArray(productList) || productList.length === 0) {
            return NextResponse.json({
                message: 'Invalid payload',
                status: 400
            }, { status: 400 });
        }
        const marketerMobile = decoded.role === 'assistant'
            ? await getMarketerMobileForAssistant(decoded.userId)
            : decoded.mobile;

        const user_name = await getUserName(marketerMobile);
        const invoiceId = await generateInvoiceId(user_name, marketerMobile);

        for (const product of productList) {
            const trans_id = nanoid(15);
            const {
                buyer_name,
                sold,
                unit,
                amount,
                paid,
                commission,
                wageCheck,
                rentCheck,
                wage,
                rent,
                mobile,
                status,
                product_id
            } = product;

            const soldQty = parseInt(sold, 10);
            const soldAmount = parseFloat(amount);

            const productData = await getProductDetails(product_id);

            if (!productData) {
                return NextResponse.json({
                    message: `Product with ID ${product_id} not found`,
                    status: 404
                }, { status: 404 });
            }

            const existingTransactions = await querys({
                query: `SELECT * FROM transactions WHERE product_id = ?`,
                values: [product_id]
            });

            let [{ magamaiType }] = await querys({
                query: 'SELECT magamaiType FROM default_setting WHERE marketer_mobile = ?',
                values: [marketerMobile]
            });

            let farRent, farWage, sackPrice, magamai;

            if (existingTransactions.length > 0) {
                // Set to 0 if transactions already exist
                farRent = 0;
                farWage = 0;
                sackPrice = 0;
                if (magamaiType === "sack") {
                    magamai = 0
                }
            } else {
                // Use values from the productData
                farRent = parseInt(productData.farmer_rent, 10);
                farWage = parseInt(productData.farmer_wage, 10);
                sackPrice = parseFloat(productData.sack_price);
                if (magamaiType === "sack" && sackPrice != 0) {
                    magamai = productData.magamai ? parseFloat(productData.magamai) : 0
                }
                else if (magamaiType === "sack" && sackPrice == 0) {
                    magamai = 0
                }
            }

            if (productData.quantity_available < soldQty) {
                return NextResponse.json({
                    message: `Insufficient quantity available for product ID ${product_id}`,
                    status: 400
                }, { status: 400 });
            }

            const farmerAdvance = await getFarmerAdvance(productData.farmer_mobile);
            const buyerAdvance = await getBuyerAdvance(mobile);
            if (magamaiType === "percentage") {
                magamai = productData.magamai ? parseInt(productData.magamai, 10) : 0;
            }
            const com = Math.ceil(soldAmount * (commission / 100));


            const magamaiSource = await getMagamaiSource(marketerMobile);

            let fAmount = (soldAmount - (com + farRent + farWage)) + sackPrice;
            if (magamaiSource === 'farmer') {
                if (magamaiType === "sack") {
                    fAmount = ((soldAmount - (com + magamai + farRent + farWage)) + sackPrice)
                }
                if (magamaiType === "percentage") {
                    const magamaiCut = Math.ceil(com * (magamai / 100));
                    fAmount = (soldAmount - (com + farRent + magamaiCut + farWage)) + sackPrice;
                }
            }

            const bAmount =
                parseFloat(soldAmount) +
                (wageCheck ? parseFloat(wage) : 0) +
                (rentCheck ? parseFloat(rent) : 0);

            const { finalFarmerAdvance, finalFarmerAmount } = adjustFarmerAdvance(farmerAdvance, fAmount, productData.farmer_mobile);
            const { finalBuyerAdvance, finalBuyerAmount } = adjustBuyerAdvance(buyerAdvance, bAmount, mobile, paid);

            if (paid) {
                await insertAccountRecord(soldAmount, marketerMobile, mobile, buyer_name.split('-')[0]);
            }

            await updateProduct(product_id, productData.quantity_available - soldQty, productData.quantity_sold + soldQty);

            await insertTransaction({
                trans_id,
                vegetable_id: productData.vegetable_id,
                product_id,
                marketer_mobile: marketerMobile,
                buyer_mobile: mobile,
                amount: soldAmount,
                farmer_mobile: productData.farmer_mobile,
                quantity: soldQty,
                veg_name: productData.veg_name,
                commission: commission,
                farmer_payment: finalFarmerAmount,
                buyer_payment: finalBuyerAmount,
                rent: rent,
                wage: wage,
                magamai: magamai,
                magamai_src: magamaiSource,
                magamai_type: magamaiType,
                farmer_status: finalFarmerAmount === 0 ? 'paid' : 'pending',
                farmer_amount: fAmount,
                buyer_status: finalBuyerAmount === 0 ? 'paid' : 'pending',
                buyer_amount: bAmount,
                farmer_advance: farmerAdvance,
                buyer_advance: buyerAdvance,
                invoiceId,
                farmer_rent: farRent,
                farmer_wage: farWage,
                sack_price: sackPrice,
                f_quantity: soldQty,
                f_amount: soldAmount
            });
        }

        return NextResponse.json({
            message: 'Products updated successfully',
            status: 200
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}

// Utility Functions

async function getMarketerMobileForAssistant(userId) {
    const [num] = await querys({
        query: `SELECT created_by FROM users WHERE user_id = ?`,
        values: [userId]
    });
    if (!num) throw new Error('User not found');
    return num.created_by;
}

async function getUserName(mobile) {
    const [{ user_name }] = await querys({
        query: 'SELECT user_name FROM users WHERE user_mobile = ?',
        values: [mobile]
    });
    return user_name;
}

async function generateInvoiceId(userName, marketerMobile) {
    const check = await querys({
        query: `SELECT MAX(invoice_Id) AS last_invoice_id FROM transactions WHERE marketer_mobile = ?`,
        values: [marketerMobile]
    });

    let invoiceNumber;
    if (!check[0].last_invoice_id) {
        invoiceNumber = 1;
    } else {
        const lastInvoiceId = check[0].last_invoice_id;
        const invoiceNumberStr = lastInvoiceId.split('-')[1];
        invoiceNumber = parseInt(invoiceNumberStr, 10) + 1;
    }
    const paddedInvoiceId = invoiceNumber.toString().padStart(4, '0');
    return `${userName}-${paddedInvoiceId}`;
}

async function getProductDetails(productId) {
    const [exists] = await querys({
        query: `SELECT p.product_id, p.quantity, p.vegetable_id, p.quantity_sold, p.quantity_available, p.sack_price,p.farmer_mobile,
                p.proposed_price, p.farmer_rent, p.farmer_wage, v.veg_name, v.marketer_mobile AS marketer_mobile,
                d.magamai FROM products p
                JOIN vegetables v ON p.vegetable_id = v.veg_id
                LEFT JOIN default_setting d ON d.marketer_mobile = v.marketer_mobile
                WHERE p.product_id = ?`,
        values: [productId]
    });
    return exists;
}

async function getFarmerAdvance(farmerMobile) {
    const [farAdvance] = await querys({
        query: `SELECT advance FROM farmers WHERE farmer_mobile = ?`,
        values: [farmerMobile]
    });
    return parseInt(farAdvance.advance, 10) || 0;
}

async function getBuyerAdvance(buyerMobile) {
    const [buyAdvance] = await querys({
        query: `SELECT advance FROM buyers WHERE buyer_mobile = ?`,
        values: [buyerMobile]
    });
    return parseInt(buyAdvance.advance, 10) || 0;
}

async function getMagamaiSource(marketerMobile) {
    const [magamaiSource] = await querys({
        query: 'SELECT magamaiSource FROM default_setting WHERE marketer_mobile = ?',
        values: [marketerMobile]
    });
    return magamaiSource?.magamaiSource;
}

function adjustFarmerAdvance(advance, amount, farmerMobile) {
    let finalAdvance = 0;
    let finalAmount = 0;

    if (advance > amount) {
        finalAdvance = advance - amount;
        finalAmount = 0;
    } else {
        finalAmount = amount - advance;
    }

    querys({
        query: `UPDATE farmers SET advance = ? WHERE farmer_mobile = ?`,
        values: [finalAdvance, farmerMobile]
    });

    return { finalFarmerAdvance: finalAdvance, finalFarmerAmount: finalAmount };
}

function adjustBuyerAdvance(advance, amount, buyerMobile, paid) {
    let finalAdvance = 0;
    let finalAmount = 0;

    if (paid) {
        finalAmount = 0;
    } else if (advance > amount) {
        finalAdvance = advance - amount;
        finalAmount = 0;
    } else {
        finalAmount = amount - advance;
    }

    querys({
        query: `UPDATE buyers SET advance = ? WHERE buyer_mobile = ?`,
        values: [finalAdvance, buyerMobile]
    });

    return { finalBuyerAdvance: finalAdvance, finalBuyerAmount: finalAmount };
}

async function insertAccountRecord(amount, marketerMobile, buyerMobile, userName) {
    await querys({
        query: `INSERT INTO accounts (amount, marketer_mobile, mobile, user, advance) VALUES (?, ?, ?, ?, ?)`,
        values: [amount, marketerMobile, buyerMobile, userName, 0]
    });
}

async function updateProduct(productId, quantityAvailable, quantitySold) {
    await querys({
        query: `UPDATE products SET quantity_available = ?, quantity_sold = ? WHERE product_id = ?`,
        values: [quantityAvailable, quantitySold, productId]
    });
}

async function insertTransaction(data) {
    await querys({
        query: `INSERT INTO transactions (transaction_id, vegetable_id, product_id, marketer_mobile, buyer_mobile, amount, farmer_mobile, quantity, veg_name, commission, farmer_payment, buyer_payment, rent, wage, magamai, magamai_src, magamai_type, farmer_status, farmer_amount, buyer_status, buyer_amount, farmer_advance, buyer_advance, invoiceId,             farmer_rent, farmer_wage, invoice_Id,sack_price, f_quantity, f_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values: [
            data.trans_id, data.vegetable_id, data.product_id, data.marketer_mobile, data.buyer_mobile, data.amount,
            data.farmer_mobile, data.quantity, data.veg_name, data.commission, data.farmer_payment, data.buyer_payment,
            data.rent, data.wage, data.magamai, data.magamai_src, data.magamai_type, data.farmer_status, data.farmer_amount, data.buyer_status,
            data.buyer_amount, data.farmer_advance, data.buyer_advance, null, data.farmer_rent, data.farmer_wage, data.invoiceId, data.sack_price, data.quantity, data.amount
        ]
    });
}

