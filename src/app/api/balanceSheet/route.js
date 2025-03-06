export const dynamic = "force-dynamic";
import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];

        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());
        let userMobile = decoded.mobile;

        const exp = await req.json();

        if (decoded.role === "marketer" || decoded.role === "assistant") {
            if (decoded.role === "assistant") {
                const [num] = await querys({
                    query: `SELECT created_by FROM users WHERE user_id = ?`,
                    values: [decoded.userId]
                });

                if (!num) {
                    return NextResponse.json({ message: "User not found", status: 404 }, { status: 404 });
                }

                userMobile = num?.created_by;
            }

            const sum = exp.rent + exp.wage + exp.expenditure + exp.fuel + exp.electricity + exp.water + exp.mobile + exp.travel + exp.miscellneous;

            const result = await querys({
                query: `INSERT INTO balance_sheet (rent, emp_wage, daily_expenditure, fuel, electricity, water,
                mobile_bill, travel, miscellaneous, expenditure_date, created_by, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                values: [exp.rent, exp.wage, exp.expenditure, exp.fuel, exp.electricity, exp.water, exp.mobile, exp.travel,
                    exp.miscellneous, exp.date, userMobile, sum]
            });

            if (result.affectedRows > 0) {
                return NextResponse.json({ message: "Data added successfully", status: 200 }, { status: 200 });
            } else {
                return NextResponse.json({ message: "Data not added", status: 400 }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: "Unauthorized", status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
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
                    return NextResponse.json({ message: "User not found", status: 404 }, { status: 404 });
                }

                userMobile = num?.created_by;
            }

            const [{ financialYear }] = await querys({
                query: `SELECT financialYear FROM default_setting WHERE marketer_mobile = ?`,
                values: [userMobile]
            }) || [{ financialYear: 1 }];

            const yearStart = financialYear || 1;

            const userData = await querys({
                query: `SELECT user_id, created_at FROM users WHERE user_mobile = ?`,
                values: [userMobile]
            });

            if (!userData || userData.length === 0) {
                return NextResponse.json({ message: "User not found", status: 404 }, { status: 404 });
            }

            const { created_at } = userData[0];
            const createdAt = new Date(created_at);
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const monthsSinceCreation = Math.min(3, currentYear - createdAt.getFullYear());

            const generateFinancialYears = (startYear, createdYear) => {
                const yearsResponse = [];
                let count = Math.min(3, currentYear - createdYear);

                if (startYear === 4) {
                    let year = currentYear;
                    while (count-- > 0) {
                        yearsResponse.push({ value: `${year}-${year - 1}`, label: `${year}-${year - 1}` });
                        year--;
                    }
                } else {
                    let year = currentYear - count;
                    while (count-- > 0) {
                        yearsResponse.push({ value: `${year}`, label: `${year}` });
                        year--;
                    }
                }
                return yearsResponse;
            };

            const yearsResponse = generateFinancialYears(yearStart, createdAt.getFullYear());
            const transactionPeriods = ["thisMonth"];

            if (monthsSinceCreation > 24) {
                transactionPeriods.push("lastMonth", "thisQuarter", "lastQuarter", "thisYear", "lastYear");
            } else if (monthsSinceCreation >= 12) {
                transactionPeriods.push("lastMonth", "thisQuarter", "lastQuarter");
                if (currentMonth >= yearStart) {
                    transactionPeriods.push("thisYear");
                } else {
                    transactionPeriods.push("thisYear", "lastYear");
                }
            } else if (monthsSinceCreation >= 3) {
                transactionPeriods.push("lastMonth", "thisQuarter");
                if (currentMonth >= yearStart) {
                    transactionPeriods.push("thisYear");
                } else {
                    transactionPeriods.push("lastQuarter", "thisYear", "lastYear");
                }
            } else if (monthsSinceCreation >= 2) {
                transactionPeriods.push("lastMonth", "thisQuarter");
                if (currentMonth >= yearStart) {
                    transactionPeriods.push("thisYear");
                } else {
                    transactionPeriods.push("lastQuarter", "thisYear", "lastYear");
                }
            } else if (monthsSinceCreation === 1) {
                transactionPeriods.push("lastMonth");
                if (currentMonth >= yearStart) {
                    transactionPeriods.push("thisQuarter", "thisYear");
                } else {
                    transactionPeriods.push("thisQuarter", "lastQuarter", "thisYear", "lastYear");
                }
            }

            const uniqueTransactionPeriods = [...new Set(transactionPeriods)];

            const formatResponse = (items) => items.map(item => ({
                value: item,
                label: item.replace(/([A-Z])/g, " $1").trim()
            }));

            return NextResponse.json({
                message: "Success",
                data: [...formatResponse(uniqueTransactionPeriods), ...yearsResponse],
                status: 200
            }, { status: 200 });

        } else {
            return NextResponse.json({ message: "Unauthorized", status: 403 }, { status: 403 });
        }
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ message: "Server Error", status: 500 }, { status: 500 });
    }
}
