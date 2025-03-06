export const dynamic = "force-dynamic";

import { querys } from "@/src/app/lib/DbConnection";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
     
        const authHeader = req.headers.get("Authorization");
        const accessToken = authHeader?.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString());

        const gets = new URL(req.url).pathname.split('/').filter(Boolean).pop();
   
        let userMobile = decoded.mobile;

        if (decoded.role === 'marketer' || decoded.role === 'assistant') {
            if (decoded.role === 'assistant') {
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

            const [yearStart] = await querys({
                query: `SELECT financialYear FROM default_setting WHERE marketer_mobile = ?`,
                values: [userMobile]
            });
            let financialYear = yearStart ? yearStart.financialYear : 1
            
            let timePeriod = ""            
            let query = `SELECT DISTINCT f.farmer_name AS name,t.farmer_amount AS amount,DATE(t.created_at)AS created_at,
                        'farmer' AS type FROM transactions t JOIN farmers f ON t.farmer_mobile = f.farmer_mobile
                        AND t.marketer_mobile = f.marketer_mobile WHERE t.marketer_mobile = ?`
                        
                        switch (gets) {                            
                            case 'thisMonth':
                                query += `
                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                    AND MONTH(t.created_at) = MONTH(CURRENT_DATE)
                                `;
                                timePeriod = `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`;
                                break;
                            case 'lastMonth':
                                query += `
                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                    AND MONTH(t.created_at) = MONTH(CURRENT_DATE) - 1
                                `;
                                const lastMonth = new Date();
                                lastMonth.setMonth(lastMonth.getMonth() - 1);
                                timePeriod = `${lastMonth.toLocaleString('default', { month: 'short' })} ${lastMonth.getFullYear()}`;
                                break;
                            case 'thisQuarter':
                                
                                let quarterStart = "", quarterEnd = "";
                                const currentMonth = new Date().getMonth() + 1;
                                if (financialYear === 1) {
                                    if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE) + 1
                                            AND MONTH(t.created_at) BETWEEN 1 AND 3
                                        `;
                                        quarterStart = "JAN", quarterEnd = "MAR";
                                    } else if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 4 AND 6
                                        `;
                                        quarterStart = "APRIL", quarterEnd = "JUNE";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 7 AND 9
                                        `;
                                        quarterStart = "JULY", quarterEnd = "SEPT";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 10 AND 12
                                        `;
                                        quarterStart = "OCT", quarterEnd = "DEC";
                                    }
                                } else if (financialYear === 4) {
                                    if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE) + 1
                                            AND MONTH(t.created_at) BETWEEN 4 AND 6
                                        `;
                                        quarterStart = "APRIL", quarterEnd = "JUNE";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 7 AND 9
                                        `;
                                        quarterStart = "JULY", quarterEnd = "SEPT";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 10 AND 12
                                        `;
                                        quarterStart = "OCT", quarterEnd = "DEC";
                                    } else if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE) + 1
                                            AND MONTH(t.created_at) BETWEEN 1 AND 3
                                        `;
                                        quarterStart = "JAN", quarterEnd = "MAR";
                                    }
                                }
                                timePeriod = `${quarterStart} - ${quarterEnd} ${new Date().getFullYear()}`;
                                break;
            
                            case 'lastQuarter':
                                let lquarterStart = "", lquarterEnd = "";
                                if (financialYear === 1) {
                                    const currentMonth = new Date().getMonth() + 1;
                                    if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1
                                                    AND MONTH(t.created_at) BETWEEN 10 AND 12
                                                `;
                                        lquarterStart = "OCT", lquarterEnd = "DEC";
                                    } else if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 1 AND 3
                                                `;
                                        lquarterStart = "JAN", lquarterEnd = "MAR";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 4 AND 6
                                                `;
                                        lquarterStart = "APRIL", lquarterEnd = "JUNE";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 7 AND 9
                                                `;
                                        lquarterStart = "JULY", lquarterEnd = "SEPT";
                                    }
                                } else if (financialYear === 4) {
                                    const currentMonth = new Date().getMonth() + 1;
                                    if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 1 AND 3
                                                `;
                                        lquarterStart = "JAN", lquarterEnd = "MAR";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 4 AND 6
                                                `;
                                        lquarterStart = "APRIL", lquarterEnd = "JUNE";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 7 AND 9
                                                `;
                                        lquarterStart = "JULY", lquarterEnd = "SEPT";
                                    } else if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1
                                                    AND MONTH(t.created_at) BETWEEN 10 AND 12
                                                `;
                                        lquarterStart = "OCT", lquarterEnd = "DEC";
                                    }
                                }
                                timePeriod = `${lquarterStart} - ${lquarterEnd} ${new Date().getFullYear()}`;
                                break;
            
                            case 'thisYear':
                                if (financialYear === 1) {
                                    query += `
                                                AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            `;
                                    timePeriod = `${new Date().getFullYear()}`;
                                } else if (financialYear === 4) {
                                    query += `
                                                AND (
                                                    (MONTH(t.created_at) >= ${financialYear}) OR
                                                    (MONTH(t.created_at) < ${financialYear} AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1)
                                                )
                                            `;
                                    timePeriod = `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
                                }
            
                                break;
            
                            case 'lastYear':
                                if (financialYear === 1) {
                                    query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1
                                                `;
                                    timePeriod = `${new Date().getFullYear() - 1}`;
                                } else if (financialYear === 4) {
                                    query += `
                                                    AND (
                                                    (MONTH(t.created_at) < ${financialYear}) AND YEAR(t.created_at) = YEAR(CURRENT_DATE) OR
                                                    (MONTH(t.created_at) > ${financialYear} AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1)
                                                )
                                                `;
                                    timePeriod = `${new Date().getFullYear() - 2}-${new Date().getFullYear() - 1}`;
                                }
                                break;
            
            
                            default:
                                if (gets.includes('-')) {
                                    const [startYear, endYear] = gets.split('-').map(year => parseInt(year.trim()));
                                    query += `
                                                    AND (
                                                        (YEAR(t.created_at) = ${startYear} AND MONTH(t.created_at) >= 4) OR
                                                        (YEAR(t.created_at) = ${endYear} AND MONTH(t.created_at) <= 3) OR
                                                        (YEAR(t.created_at) > ${startYear} AND YEAR(t.created_at) < ${endYear})
                                                    )
                                                `;
                                } else {
                                    query += `
                                                    AND YEAR(t.created_at) = ${gets}
                                                `;
                                }
                                timePeriod = gets;
                                break;
                        }
 
                       query += ` UNION ALL
 
                        SELECT DISTINCT b.buyer_address AS name,t.buyer_amount AS amount,DATE(t.created_at) AS created_at,
                        'buyer' AS type FROM transactions t JOIN buyers b ON t.buyer_mobile = b.buyer_mobile
                        AND t.marketer_mobile = b.marketer_mobile WHERE t.marketer_mobile = ?`

                        switch (gets) {
                            case 'thisMonth':
                                query += `
                                    
                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                    AND MONTH(t.created_at) = MONTH(CURRENT_DATE)
                                `;
                                timePeriod = `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`;
                                break;
                            case 'lastMonth':
                                query += `
                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                    AND MONTH(t.created_at) = MONTH(CURRENT_DATE) - 1
                                `;
                                const lastMonth = new Date();
                                lastMonth.setMonth(lastMonth.getMonth() - 1);
                                timePeriod = `${lastMonth.toLocaleString('default', { month: 'short' })} ${lastMonth.getFullYear()}`;
                                break;
                            case 'thisQuarter':
                                let quarterStart = "", quarterEnd = "";
                                const currentMonth = new Date().getMonth() + 1;
                                if (financialYear === 1) {
                                    if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE) + 1
                                            AND MONTH(t.created_at) BETWEEN 1 AND 3
                                        `;
                                        quarterStart = "JAN", quarterEnd = "MAR";
                                    } else if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 4 AND 6
                                        `;
                                        quarterStart = "APRIL", quarterEnd = "JUNE";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 7 AND 9
                                        `;
                                        quarterStart = "JULY", quarterEnd = "SEPT";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 10 AND 12
                                        `;
                                        quarterStart = "OCT", quarterEnd = "DEC";
                                    }
                                } else if (financialYear === 4) {
                                    if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE) + 1
                                            AND MONTH(t.created_at) BETWEEN 4 AND 6
                                        `;
                                        quarterStart = "APRIL", quarterEnd = "JUNE";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 7 AND 9
                                        `;
                                        quarterStart = "JULY", quarterEnd = "SEPT";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            AND MONTH(t.created_at) BETWEEN 10 AND 12
                                        `;
                                        quarterStart = "OCT", quarterEnd = "DEC";
                                    } else if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                            AND YEAR(t.created_at) = YEAR(CURRENT_DATE) + 1
                                            AND MONTH(t.created_at) BETWEEN 1 AND 3
                                        `;
                                        quarterStart = "JAN", quarterEnd = "MAR";
                                    }
                                }
                                timePeriod = `${quarterStart} - ${quarterEnd} ${new Date().getFullYear()}`;
                                break;
            
                            case 'lastQuarter':
                                let lquarterStart = "", lquarterEnd = "";
                                if (financialYear === 1) {
                                    const currentMonth = new Date().getMonth() + 1;
                                    if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1
                                                    AND MONTH(t.created_at) BETWEEN 10 AND 12
                                                `;
                                        lquarterStart = "OCT", lquarterEnd = "DEC";
                                    } else if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 1 AND 3
                                                `;
                                        lquarterStart = "JAN", lquarterEnd = "MAR";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 4 AND 6
                                                `;
                                        lquarterStart = "APRIL", lquarterEnd = "JUNE";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 7 AND 9
                                                `;
                                        lquarterStart = "JULY", lquarterEnd = "SEPT";
                                    }
                                } else if (financialYear === 4) {
                                    const currentMonth = new Date().getMonth() + 1;
                                    if (currentMonth >= 4 && currentMonth <= 6) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 1 AND 3
                                                `;
                                        lquarterStart = "JAN", lquarterEnd = "MAR";
                                    } else if (currentMonth >= 7 && currentMonth <= 9) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 4 AND 6
                                                `;
                                        lquarterStart = "APRIL", lquarterEnd = "JUNE";
                                    } else if (currentMonth >= 10 && currentMonth <= 12) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                                    AND MONTH(t.created_at) BETWEEN 7 AND 9
                                                `;
                                        lquarterStart = "JULY", lquarterEnd = "SEPT";
                                    } else if (currentMonth >= 1 && currentMonth <= 3) {
                                        query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1
                                                    AND MONTH(t.created_at) BETWEEN 10 AND 12
                                                `;
                                        lquarterStart = "OCT", lquarterEnd = "DEC";
                                    }
                                }
                                timePeriod = `${lquarterStart} - ${lquarterEnd} ${new Date().getFullYear()}`;
                                break;
            
                            case 'thisYear':
                                if (financialYear === 1) {
                                    query += `
                                                AND YEAR(t.created_at) = YEAR(CURRENT_DATE)
                                            `;
                                    timePeriod = `${new Date().getFullYear()}`;
                                } else if (financialYear === 4) {
                                    query += `
                                                AND (
                                                    (MONTH(t.created_at) >= ${financialYear}) OR
                                                    (MONTH(t.created_at) < ${financialYear} AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1)
                                                )
                                            `;
                                    timePeriod = `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
                                }
            
                                break;
            
                            case 'lastYear':
                                if (financialYear === 1) {
                                    query += `
                                                    AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1
                                                `;
                                    timePeriod = `${new Date().getFullYear() - 1}`;
                                } else if (financialYear === 4) {
                                    query += `
                                                    AND (
                                                    (MONTH(t.created_at) < ${financialYear}) AND YEAR(t.created_at) = YEAR(CURRENT_DATE) OR
                                                    (MONTH(t.created_at) > ${financialYear} AND YEAR(t.created_at) = YEAR(CURRENT_DATE) - 1)
                                                )
                                                `;
                                    timePeriod = `${new Date().getFullYear() - 2}-${new Date().getFullYear() - 1}`;
                                }
                                break;
            
            
                            default:
                                if (gets.includes('-')) {
                                    const [startYear, endYear] = gets.split('-').map(year => parseInt(year.trim()));
                                    query += `
                                                    AND (
                                                        (YEAR(t.created_at) = ${startYear} AND MONTH(t.created_at) >= 4) OR
                                                        (YEAR(t.created_at) = ${endYear} AND MONTH(t.created_at) <= 3) OR
                                                        (YEAR(t.created_at) > ${startYear} AND YEAR(t.created_at) < ${endYear})
                                                    )
                                                `;
                                } else {
                                    query += `
                                                    AND YEAR(t.created_at) = ${gets}
                                                `;
                                }
                                timePeriod = gets;
                                break;
                        }

                
                      query +=  ` UNION ALL
 
                        SELECT DISTINCT null AS name,b.total AS amount,DATE(b.expenditure_date) AS created_at,'expense' AS type
                        FROM balance_sheet b WHERE b.created_by = ?`;

            switch (gets) {
                case 'thisMonth':
                    query += `
                        
                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                        AND MONTH(b.expenditure_date) = MONTH(CURRENT_DATE)
                    `;
                    timePeriod = `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`;
                    break;
                case 'lastMonth':
                    query += `
                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                        AND MONTH(b.expenditure_date) = MONTH(CURRENT_DATE) - 1
                    `;
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    timePeriod = `${lastMonth.toLocaleString('default', { month: 'short' })} ${lastMonth.getFullYear()}`;
                    break;
                case 'thisQuarter':
                    let quarterStart = "", quarterEnd = "";
                    const currentMonth = new Date().getMonth() + 1;
                    if (financialYear === 1) {
                        if (currentMonth >= 1 && currentMonth <= 3) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) + 1
                                AND MONTH(b.expenditure_date) BETWEEN 1 AND 3
                            `;
                            quarterStart = "JAN", quarterEnd = "MAR";
                        } else if (currentMonth >= 4 && currentMonth <= 6) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                AND MONTH(b.expenditure_date) BETWEEN 4 AND 6
                            `;
                            quarterStart = "APRIL", quarterEnd = "JUNE";
                        } else if (currentMonth >= 7 && currentMonth <= 9) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                AND MONTH(b.expenditure_date) BETWEEN 7 AND 9
                            `;
                            quarterStart = "JULY", quarterEnd = "SEPT";
                        } else if (currentMonth >= 10 && currentMonth <= 12) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                AND MONTH(b.expenditure_date) BETWEEN 10 AND 12
                            `;
                            quarterStart = "OCT", quarterEnd = "DEC";
                        }
                    } else if (financialYear === 4) {
                        if (currentMonth >= 4 && currentMonth <= 6) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) + 1
                                AND MONTH(b.expenditure_date) BETWEEN 4 AND 6
                            `;
                            quarterStart = "APRIL", quarterEnd = "JUNE";
                        } else if (currentMonth >= 7 && currentMonth <= 9) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                AND MONTH(b.expenditure_date) BETWEEN 7 AND 9
                            `;
                            quarterStart = "JULY", quarterEnd = "SEPT";
                        } else if (currentMonth >= 10 && currentMonth <= 12) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                AND MONTH(b.expenditure_date) BETWEEN 10 AND 12
                            `;
                            quarterStart = "OCT", quarterEnd = "DEC";
                        } else if (currentMonth >= 1 && currentMonth <= 3) {
                            query += `
                                AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) + 1
                                AND MONTH(b.expenditure_date) BETWEEN 1 AND 3
                            `;
                            quarterStart = "JAN", quarterEnd = "MAR";
                        }
                    }
                    timePeriod = `${quarterStart} - ${quarterEnd} ${new Date().getFullYear()}`;
                    break;

                case 'lastQuarter':
                    let lquarterStart = "", lquarterEnd = "";
                    if (financialYear === 1) {
                        const currentMonth = new Date().getMonth() + 1;
                        if (currentMonth >= 1 && currentMonth <= 3) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) - 1
                                        AND MONTH(b.expenditure_date) BETWEEN 10 AND 12
                                    `;
                            lquarterStart = "OCT", lquarterEnd = "DEC";
                        } else if (currentMonth >= 4 && currentMonth <= 6) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                        AND MONTH(b.expenditure_date) BETWEEN 1 AND 3
                                    `;
                            lquarterStart = "JAN", lquarterEnd = "MAR";
                        } else if (currentMonth >= 7 && currentMonth <= 9) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                        AND MONTH(b.expenditure_date) BETWEEN 4 AND 6
                                    `;
                            lquarterStart = "APRIL", lquarterEnd = "JUNE";
                        } else if (currentMonth >= 10 && currentMonth <= 12) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                        AND MONTH(b.expenditure_date) BETWEEN 7 AND 9
                                    `;
                            lquarterStart = "JULY", lquarterEnd = "SEPT";
                        }
                    } else if (financialYear === 4) {
                        const currentMonth = new Date().getMonth() + 1;
                        if (currentMonth >= 4 && currentMonth <= 6) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                        AND MONTH(b.expenditure_date) BETWEEN 1 AND 3
                                    `;
                            lquarterStart = "JAN", lquarterEnd = "MAR";
                        } else if (currentMonth >= 7 && currentMonth <= 9) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                        AND MONTH(b.expenditure_date) BETWEEN 4 AND 6
                                    `;
                            lquarterStart = "APRIL", lquarterEnd = "JUNE";
                        } else if (currentMonth >= 10 && currentMonth <= 12) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                        AND MONTH(b.expenditure_date) BETWEEN 7 AND 9
                                    `;
                            lquarterStart = "JULY", lquarterEnd = "SEPT";
                        } else if (currentMonth >= 1 && currentMonth <= 3) {
                            query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) - 1
                                        AND MONTH(b.expenditure_date) BETWEEN 10 AND 12
                                    `;
                            lquarterStart = "OCT", lquarterEnd = "DEC";
                        }
                    }
                    timePeriod = `${lquarterStart} - ${lquarterEnd} ${new Date().getFullYear()}`;
                    break;

                case 'thisYear':
                    if (financialYear === 1) {
                        query += `
                                    AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE)
                                `;
                        timePeriod = `${new Date().getFullYear()}`;
                    } else if (financialYear === 4) {
                        query += `
                                    AND (
                                        (MONTH(b.expenditure_date) >= ${financialYear}) OR
                                        (MONTH(b.expenditure_date) < ${financialYear} AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) - 1)
                                    )
                                `;
                        timePeriod = `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
                    }

                    break;

                case 'lastYear':
                    if (financialYear === 1) {
                        query += `
                                        AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) - 1
                                    `;
                        timePeriod = `${new Date().getFullYear() - 1}`;
                    } else if (financialYear === 4) {
                        query += `
                                        AND (
                                        (MONTH(b.expenditure_date) < ${financialYear}) AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) OR
                                        (MONTH(b.expenditure_date) > ${financialYear} AND YEAR(b.expenditure_date) = YEAR(CURRENT_DATE) - 1)
                                    )
                                    `;
                        timePeriod = `${new Date().getFullYear() - 2}-${new Date().getFullYear() - 1}`;
                    }
                    break;


                default:
                    if (gets.includes('-')) {
                        const [startYear, endYear] = gets.split('-').map(year => parseInt(year.trim()));
                        query += `
                                        AND (
                                            (YEAR(b.expenditure_date) = ${startYear} AND MONTH(b.expenditure_date) >= 4) OR
                                            (YEAR(b.expenditure_date) = ${endYear} AND MONTH(b.expenditure_date) <= 3) OR
                                            (YEAR(b.expenditure_date) > ${startYear} AND YEAR(b.expenditure_date) < ${endYear})
                                        )
                                    `;
                    } else {
                        query += `
                                        AND YEAR(b.expenditure_date) = ${gets}
                                    `;
                    }
                    timePeriod = gets;
                    break;
            }
            const accountsData = await querys({ query, values: [userMobile, userMobile, userMobile] });
            const [userData] = await querys({
                query: `SELECT
                            d.logo, d.marketer_mobile, u.user_name, u.user_address
                        FROM default_setting d
                        LEFT JOIN users u ON u.user_mobile = d.marketer_mobile
                        WHERE d.marketer_mobile = ?; `, values: [userMobile]
            });
            const totalFarmerAmount = accountsData
                .filter(account => account.type === 'farmer')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const totalBuyerAmount = accountsData
                .filter(account => account.type === 'buyer')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const totalExpAmount = accountsData
                .filter(account => account.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const transaction_total = totalBuyerAmount - (totalFarmerAmount + totalExpAmount);
            const gross = totalBuyerAmount - totalFarmerAmount;
            const response = {
                accounts: accountsData,
                transaction_total,
                totalBuyerAmount,
                totalExpAmount,
                totalFarmerAmount,
                gross, timePeriod,userData
            };

            return NextResponse.json({
                message: 'Account and balance details retrieved successfully',
                data: response,
                status: 200
            }, { status: 200 });

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
        
        const id = new URL(req.url).pathname.split('/').filter(Boolean).pop();
        const details = await req.json()
      
        let userMobile = decoded.mobile;

        const requiredFields = ['rent', 'wage', 'expenditure', 'fuel', 'electricity', 'water', 'mobile', 'travel', 'miscellaneous', 'date'];
        for (const field of requiredFields) {
            if (!(field in details)) {
                return NextResponse.json({
                    message: `Missing required field: ${field}`,
                    status: 400
                }, { status: 400 });
            }
        }

        if (decoded.role === 'marketer' || decoded.role === 'assistant') {
            if (decoded.role === 'assistant') {
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
            let sum = details.rent + details.wage + details.expenditure + details.fuel + details.electricity + details.water + details.mobile + details.travel +
                details.miscellaneous
            const result = await querys({
                query: `UPDATE balance_sheet  SET rent = ?, emp_wage = ?, daily_expenditure = ?, fuel = ?, electricity = ?, water = ?, mobile_bill = ?, travel = ?, miscellaneous = ?, expenditure_date = ?,total=? WHERE id = ? AND created_by=?`,
                values: [details.rent, details.wage, details.expenditure, details.fuel, details.electricity, details.water, details.mobile, details.travel,
                details.miscellaneous, details.date, sum, id, userMobile]
            });


            if (result.affectedRows > 0) {
                return NextResponse.json({
                    message: 'Data updated successfully',
                    status: 200
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: 'Data not updated',
                    status: 400
                }, { status: 400 });
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