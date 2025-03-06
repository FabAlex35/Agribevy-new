export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";
 
export async function GET(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const id = decoded.userId;
        const role = decoded.role;
 
        let mobileColumn;
        let mobile;
        let total;
 
        switch (role) {
            case 'farmer':
                mobileColumn = 'farmer_mobile';
                mobile = decoded.mobile;
                total = 'farmer_amount';
                break;
            case 'buyer':
                mobileColumn = 'buyer_mobile';
                mobile = decoded.mobile;
                total = 'buyer_amount';
                break;
            case 'marketer':
                mobileColumn = 'marketer_mobile';
                mobile = decoded.mobile;
                total = 'buyer_amount';  // Assuming it's the same as for buyers
                break;
            case 'assistant':
                mobileColumn = 'marketer_mobile';
                total = 'buyer_amount';
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_id = ?`,
                    values: [id]
                });
 
                if (!num) {
                    return NextResponse.json({
                        message: 'User not found',
                        status: 404
                    }, { status: 404 });
                }
 
                mobile = num?.created_by;
                break;
 
            default:
                return NextResponse.json({
                    message: 'Invalid role',
                    status: 400
                }, { status: 400 });
        }
 
        // Get user creation date
        const [userCreationData] = await querys({
            query: `SELECT created_at FROM users WHERE user_id = ?`,
            values: [id]
        });
 
        const userCreatedAt = userCreationData?.created_at;
 
        if (!userCreatedAt) {
            return NextResponse.json({
                message: 'User creation date not found',
                status: 404
            }, { status: 404 });
        }
        const eachSummary = async (days) => {
            const [rows] = await querys({
                query: `SELECT SUM(amount) AS amount, COUNT(*) AS count FROM (
                            SELECT SUM(${total}) AS amount
                            FROM transactions
                            WHERE created_at >= CURDATE() - INTERVAL ? DAY AND ${mobileColumn} = ?
                            GROUP BY product_id) AS aggregated`,
                values: [days, mobile]
            });
            return rows;
        };

        const todaySummary = async () => {
            const [rows] = await querys({
                query: `SELECT SUM(amount) AS amount, COUNT(*) AS count FROM (
                            SELECT SUM(${total}) AS amount
                            FROM transactions
                            WHERE DATE(created_at) = CURDATE() AND ${mobileColumn} = ?
                            GROUP BY product_id) AS aggregated`,
                values: [mobile]
            });
            return rows;
        };
        // Query for daily transaction summary
        const queryTransactionSummary = async () => {
            const rows = await querys({
                query: `WITH date_series AS (
                        SELECT CURDATE() - INTERVAL n.n DAY AS transaction_day
                        FROM (
                            SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
                        ) n
                    )
                    SELECT
                        DATE_FORMAT(ds.transaction_day, '%Y-%m-%d') AS name,
                        COALESCE(COUNT(t.id), 0) AS transaction_count,
                        COALESCE(SUM(t.${total}), 0) AS sales  -- Use total based on role
                    FROM
                        date_series ds
                    LEFT JOIN
                        transactions t ON DATE(t.created_at) = ds.transaction_day AND t.${mobileColumn} = ?
                    WHERE ds.transaction_day >= DATE(?) -- Start from the user creation day (include it)
                    GROUP BY
                        ds.transaction_day
                    ORDER BY
                        ds.transaction_day;`,
                values: [mobile, userCreatedAt]
            });
            return rows;
        };
 
        // Query for weekly summary
        const queryMonthlySummary = async () => {
            const rows = await querys({
                query: `
                    SELECT
                    CONCAT(DATE_FORMAT(ws.week_start, '%Y-%m-%d'), ' - ', DATE_FORMAT(ws.week_end, '%Y-%m-%d')) AS name,
                    COALESCE(SUM(CASE WHEN td.transaction_date BETWEEN ws.week_start AND ws.week_end THEN td.transaction_count ELSE 0 END), 0) AS transaction_count,
                    COALESCE(SUM(CASE WHEN td.transaction_date BETWEEN ws.week_start AND ws.week_end THEN td.${total} ELSE 0 END), 0) AS sales  
                FROM
                    (
                        SELECT
                            DATE(DATE_SUB(CURDATE() , INTERVAL (n.n * 7) DAY) - INTERVAL 6 DAY) AS week_start,
                            DATE(DATE_SUB(CURDATE() , INTERVAL (n.n * 7) DAY)) AS week_end
                        FROM (
                            SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                        ) n
                    ) AS ws
                LEFT JOIN
                    (
                        SELECT
                            DATE(created_at) AS transaction_date,
                            COUNT(id) AS transaction_count,
                            SUM(${total}) AS ${total}  
                        FROM
                            transactions
                        WHERE
                            created_at <= DATE_ADD(CURDATE() , INTERVAL 1 DAY) -- Up to today
                            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
                            AND ${mobileColumn} = ?
                        GROUP BY
                            DATE(created_at)
                    ) AS td ON DATE(td.transaction_date) BETWEEN ws.week_start AND ws.week_end
                WHERE ws.week_start >= DATE(?) -- Ensure weeks start from the user creation date
                GROUP BY
                    ws.week_start, ws.week_end
                ORDER BY
                    ws.week_start;`,
                values: [mobile, userCreatedAt]
            });
            return rows;
        };
 
        // Fetch summaries
        const week = await queryTransactionSummary();
        const month = await queryMonthlySummary();
        const eachWeek = await eachSummary(6);
        const eachMonth = await eachSummary(29);
        const today=await todaySummary()
        const [userNameRows] = await querys({
            query: `SELECT user_name FROM users WHERE user_id = ?`,
            values: [id]
        });
 
        const data = {
            'name': userNameRows,
            week,
            month,
            eachWeek,eachMonth,today
        };
 
        return NextResponse.json({
            message: 'Transaction Listed successfully',
            data,
            status: 200
        }, { status: 200 });
 
    } catch (error) {
        console.error('Server Error:', error);
 
        return NextResponse.json({
            message: 'Server Error',
            status: 500
        }, { status: 500 });
    }
}
