"use client";
import AccessDenied from "@/src/Components/AccessDenied";
import Loader from "@/src/Components/Loader";
import React, { useEffect, useState } from "react";
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import html2canvas from 'html2canvas';
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";
import { getBalanceSheetDetailsAPI, getSalesColumnAPI, getSalesReportAPI, getSheetOptionsAPI, updateSalesColumnAPI } from "@/src/Components/Api";
import * as XLSX from "xlsx";
import DataTable from 'react-data-table-component';
import addNotoSansTamilFont from "@/src/Components/MyFont"
import { useRouter } from "next/navigation";
import ModalBoxError from "@/src/Components/ModalBoxError";
const Accounts = () => {
    const user = useSelector((state) => state?.user?.userDetails);
    const language = useSelector((state) => state?.user?.language)
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const [successMsg, setSuccessMsg] = useState(null);
    const [mode, setMode] = useState("balancesheet")
    const [errMsg, setErrMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [selectedLabel, setSelectedLabel] = useState("");
    const [options, setOptions] = useState(null);
    const [gross, setGross] = useState(null);
    const [timePeriod, setTimePeriod] = useState(null)
    const [userDetails, setUserDetails] = useState(null)
    const [selectedDate, setSelectedDate] = useState("");
    const [sales, setSales] = useState(null);
    const router = useRouter()
    const initialVisibleColumns = [
        'Product', 'Farmer', 'Buyer', 'Farmer Bill', 'Sold at', 'Buyer Amount'
    ];

    const getAllOptions = async () => {
        setLoading(true);
        const response = await getSheetOptionsAPI();
        if (response?.status === 200) {
            setOptions(response?.data);
            setLoading(false);
            setTimePeriod(null)
        } else {
            setErrMsg(response.message);
            // setTimeout(() => {
            //     setErrMsg(null);
            // }, 2000);
            setLoading(false);
        }
    };

    const getAllColumns = async () => {
        setLoading(true);
        const response = await getSalesColumnAPI();
        if (response?.status === 200) {
            setVisibleColumns(response?.data);
            setLoading(false);
        } else {
            setErrMsg(response.message);
            // setTimeout(() => {
            //     setErrMsg(null);
            // }, 2000);
            setLoading(false);
        }
    };

    const getBalanceSheet = async () => {
        setLoading(true);
        const response = await getBalanceSheetDetailsAPI(selectedPeriod);
        if (response?.status === 200) {
            setGross(response?.data);
            setLoading(false);
            setTimePeriod(response?.data?.timePeriod)
            setUserDetails(response?.data?.userData)
        } else {
            setErrMsg(response.message);
            // setTimeout(() => {
            //     setErrMsg(null);
            // }, 2000);
            setLoading(false);
        }
    };

    const getSalesReport = async () => {
        setLoading(true);
        const response = await getSalesReportAPI(selectedDate);
        if (response?.status === 200) {
            console.log(response?.data?.sales);

            setSales(response?.data?.sales);
            setUserDetails(response?.data?.userData)
            setLoading(false);
        } else {
            setErrMsg(response.message);
            // setTimeout(() => {
            //     setErrMsg(null);
            // }, 2000);
            setLoading(false);
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };
    const downloadInvoiceAsPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait A4 size, mm units
        const pageWidth = pdf.internal.pageSize.width;

        // Extract the image path for the logo
        const path = userDetails.logo.split('\\');
        const ImageURL = `http://localhost:3000/api/images/${path[path.length - 1]}`;

        // Load the logo image (you can use an asynchronous method if needed)
        const img = new Image();
        img.src = ImageURL;

        img.onload = () => {
            // Set initial Y position
            let currentY = 10; // Starting position for the first content (logo)

            // Add the logo to the PDF (reduce size for better balance)
            const logoWidth = 20;  // Reduced width of the logo
            const logoHeight = 20; // Reduced height of the logo
            pdf.addImage(img, 'JPEG', (pageWidth - logoWidth) / 2, currentY, logoWidth, logoHeight);

            // Increase Y position after adding the logo
            currentY += logoHeight + 5; // Add 5mm padding after the logo

            // User info text below the logo (centered)
            const userName = userDetails.user_name || 'User Name'; // Use actual user name
            const userAddress = userDetails.user_address || 'User Address'; // Use actual user address
            const marketerMobile = userDetails.marketer_mobile || 'Mobile Number'; // Use actual mobile number

            // Add user name (bold and centered)
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            const userNameWidth = pdf.getTextWidth(userName);
            pdf.text(userName, (pageWidth - userNameWidth) / 2, currentY); // Center the user name
            currentY += 5; // Move to next line

            // Add user address (normal text and centered)
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const userAddressWidth = pdf.getTextWidth(userAddress);
            pdf.text(userAddress, (pageWidth - userAddressWidth) / 2, currentY); // Center the address
            currentY += 5; // Move to next line

            // Add marketer mobile (normal text and centered)
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const marketerMobileWidth = pdf.getTextWidth(marketerMobile);
            pdf.text(marketerMobile, (pageWidth - marketerMobileWidth) / 2, currentY); // Center the mobile
            currentY += 10; // Move down a bit before heading

            // Add Balance Sheet Heading (centered)
            const heading = `Balance Sheet Report for ${timePeriod}`;
            const subHeading = `Generated on: ${new Date().toLocaleDateString('en-IN')}`;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            const headingWidth = pdf.getTextWidth(heading);
            pdf.text(heading, (pageWidth - headingWidth) / 2, currentY); // Center the heading
            currentY += 10; // Add some space below the heading

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            const subHeadingWidth = pdf.getTextWidth(subHeading);
            pdf.text(subHeading, (pageWidth - subHeadingWidth) / 2, currentY); // Center the subheading
            currentY += 20; // Move to next section after subheading

            // Extract table data from the DOM
            const tableElement = document.getElementById('invoice'); // Replace 'table-id' with your actual table ID
            const rows = Array.from(tableElement.querySelectorAll('tbody tr')).map(row =>
                Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim())
            );

            const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.innerText.trim());

            // Add the table to the PDF
            const tableStartY = currentY; // Start position after the heading
            pdf.autoTable({
                head: [headers],  // Table headers
                body: rows,       // Table rows
                startY: tableStartY, // Position below the headings
                margin: { left: 10, right: 10 },
                styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [200, 200, 200] }, // Light gray header background
            });

            // Calculate the Y position for the summary list
            const lastTableY = pdf.lastAutoTable.finalY; // Get the last Y position of the table
            const remainingSpace = 297 - lastTableY; // A4 height = 297mm
            let currentSummaryY = lastTableY + 10; // Position for the summary list

            // Define summary data
            const summaries = [
                { label: "Total Credit(INR):", value: gross?.totalBuyerAmount || 0, color: 'green' },
                { label: "Debit to Farmers(INR):", value: gross?.totalFarmerAmount || 0, color: 'red' },
                { label: "Gross Profit(INR):", value: gross?.gross || 0, color: gross?.gross > 0 ? 'green' : 'red' },
                { label: "Operational Expenses(INR):", value: gross?.totalExpAmount || 0, color: 'red' },
                { label: "Net Profit(INR):", value: gross?.transaction_total || 0, color: gross?.transaction_total > 0 ? 'green' : 'red' },
            ];

            // Check if the list fits on the current page
            const lineHeight = 8; // Height for each line
            const requiredSpace = summaries.length * lineHeight; // Total space for the summary list

            // Add a new page if there's no space left
            if (requiredSpace > remainingSpace) {
                pdf.addPage();
                currentSummaryY = 10; // Reset Y position for new page
            }

            // Render the summary list on the right side
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            const labelX = pageWidth / 2 + 10; // X position for labels (right side)
            const valueX = pageWidth - 40; // X position for values (aligned further to the right)

            summaries.forEach(item => {
                // Render the label
                pdf.setTextColor(0, 0, 0); // Black text for labels
                pdf.text(item.label, labelX, currentSummaryY);

                // Render the value
                pdf.setTextColor(item.color === 'green' ? 0 : 255, item.color === 'green' ? 128 : 0, 0); // Green or red for value
                pdf.text(`${cleanText(item.value)}`, valueX, currentSummaryY, { align: 'right' }); // Align value to the right

                currentSummaryY += lineHeight; // Move to the next line
            });

            // Save the PDF
            pdf.save(`balance-sheet-${timePeriod}.pdf`);
        };
    };

    // Helper function to clean text
    const cleanText = (text) =>
        String(text || 0)
            .replace(/[^0-9₹.,-]/g, '') // Allow only digits, ₹, periods, commas, and hyphens
            .trim();

    const downloadInvoiceAsPDFSales = async () => {
        const pdf = new jsPDF('l', 'mm', 'a4'); // Portrait A4 size, mm units
        const pageWidth = pdf.internal.pageSize.width;

        // Extract the image path for the logo
        const path = userDetails.logo.split('\\');
        const ImageURL = `http://localhost:3000/api/images/${path[path.length - 1]}`;

        // Load the logo image (you can use an asynchronous method if needed)
        const img = new Image();
        img.src = ImageURL;

        img.onload = () => {
            // Set initial Y position
            let currentY = 10; // Starting position for the first content (logo)

            // Add the logo to the PDF (reduce size for better balance)
            const logoWidth = 20;  // Reduced width of the logo
            const logoHeight = 20; // Reduced height of the logo
            pdf.addImage(img, 'JPEG', (pageWidth - logoWidth) / 2, currentY, logoWidth, logoHeight);

            // Increase Y position after adding the logo
            currentY += logoHeight + 5; // Add 5mm padding after the logo

            // User info text below the logo (centered)
            const userName = userDetails.user_name || 'User Name'; // Use actual user name
            const userAddress = userDetails.user_address || 'User Address'; // Use actual user address
            const marketerMobile = userDetails.marketer_mobile || 'Mobile Number'; // Use actual mobile number

            // Add user name (bold and centered)
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            const userNameWidth = pdf.getTextWidth(userName);
            pdf.text(userName, (pageWidth - userNameWidth) / 2, currentY); // Center the user name
            currentY += 5; // Move to next line

            // Add user address (normal text and centered)
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const userAddressWidth = pdf.getTextWidth(userAddress);
            pdf.text(userAddress, (pageWidth - userAddressWidth) / 2, currentY); // Center the address
            currentY += 5; // Move to next line

            // Add marketer mobile (normal text and centered)
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const marketerMobileWidth = pdf.getTextWidth(marketerMobile);
            pdf.text(marketerMobile, (pageWidth - marketerMobileWidth) / 2, currentY); // Center the mobile
            currentY += 10; // Move down a bit before heading

            // Add Balance Sheet Heading (centered)
            const heading = `Sales Report for ${selectedDate}`;
            const subHeading = `Generated on: ${new Date().toLocaleDateString('en-IN')}`;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            const headingWidth = pdf.getTextWidth(heading);
            pdf.text(heading, (pageWidth - headingWidth) / 2, currentY); // Center the heading
            currentY += 10; // Add some space below the heading

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            const subHeadingWidth = pdf.getTextWidth(subHeading);
            pdf.text(subHeading, (pageWidth - subHeadingWidth) / 2, currentY); // Center the subheading
            currentY += 20; // Move to next section after subheading

            // // Extract table data from the DOM
            // const tableElement = document.getElementById('sales'); // Replace 'table-id' with your actual table ID
            // const rows = Array.from(tableElement.querySelectorAll('tbody tr')).map(row =>
            //     Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim())
            // );

            // const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.innerText.trim());


            // const tableStartY = currentY; // Start position after the heading
            // pdf.autoTable({
            //     head: [headers],  // Table headers
            //     body: rows,       // Table rows
            //     startY: tableStartY, // Position below the headings
            //     margin: { left: 10, right: 10 },
            //     styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
            //     headStyles: { fillColor: [200, 200, 200] }, // Light gray header background
            // });
            // const columns = allColumns?.filter((col) => visibleColumns?.includes(col.columnName));
            // const visibleHeaders=columns.map((v,i)=>{
            //     return v.name
            // })
            // pdf.addFileToVFS("MyFont.ttf", addNotoSansTamilFont);
            // pdf.addFont("MyFont.ttf", "MyFont", "normal");
            // pdf.setFont("MyFont");


            const headers = visibleColumns;
            const rows = sales.map((sale) =>
                headers.map((header) => {
                    const column = allColumns.find(col => col.columnName === header);
                    return column ? column.selector(sale) : "";
                })
            );

            // Add the table to the PDF
            pdf.autoTable({
                head: [headers],
                body: rows,
                startY: currentY,
                styles: { font: "MyFont", fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [200, 200, 200] },
            });
            // Save the PDF
            pdf.save(`sales-report-${selectedDate}.pdf`);
        };
    };


    const handlePeriodChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedPeriod(selectedValue);

        // Find the corresponding label
        const selectedOption = options?.find(option => option.value === selectedValue);
        setSelectedLabel(selectedOption?.label || '');
    };
    const handleDateChange = (event) => {
        setSelectedDate(event.target.value)
    }


    const exportToExcel = () => {
        // Check if data exists
        if (!gross?.accounts) {
            alert("No data available to export!");
            return;
        }

        // Prepare the transaction data in the format that Excel expects
        const data = gross?.accounts?.map((row) => ({
            Date: new Date(row.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            }),
            From: row.type === "buyer" ? row.name : "-",
            To: row.type === "farmer" ? row.name : "-",
            "Credit (₹)": row.type === "buyer" ? `₹ ${row.amount}` : "-",
            "Debit (₹)": row.type === "farmer" || row.type === "expense" ? `₹ ${row.amount}` : "-"
        }));

        // Add summary data at the end of the rows
        const totalFarmerAmount = gross?.totalFarmerAmount || 0;
        const totalBuyerAmount = gross?.totalBuyerAmount || 0;
        const totalExpAmount = gross?.totalExpAmount || 0;
        const grossProfit = gross?.gross || 0;
        const transactionTotal = gross?.transaction_total || 0;

        // Add a new row for the summary at the end of the data
        data.push({
            Date: "Summary",
            From: "",
            To: "",
            "Credit (₹)": `₹ ${totalBuyerAmount}`,
            "Debit (₹)": `₹ ${totalFarmerAmount + totalExpAmount}`
        });

        // Add another row for Gross Profit, Operational Expenses, and Net Profit
        data.push({
            Date: "Gross Profit",
            From: "",
            To: "",
            "Credit (₹)": `₹ ${grossProfit}`,
            "Debit (₹)": "-"
        });

        data.push({
            Date: "Operational Expenses",
            From: "",
            To: "",
            "Credit (₹)": "-",
            "Debit (₹)": `₹ ${totalExpAmount}`
        });

        data.push({
            Date: "Net Profit",
            From: "",
            To: "",
            "Credit (₹)": `₹ ${transactionTotal}`,
            "Debit (₹)": "-"
        });

        // Prepare the summary at the top of the sheet
        const summaryData = [
            {
                "Balance Sheet Report for": `${timePeriod}`, // Heading
                "Generated On": `${new Date().toLocaleDateString('en-IN')}` // Date of generation
            }
        ];

        // Create a new workbook
        const ws = XLSX.utils.json_to_sheet(summaryData, { header: ["Balance Sheet", "Generated On"] });  // Add summary info first

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Date column width
            { wch: 20 }, // From column width
            { wch: 20 }, // To column width
            { wch: 15 }, // Credit column width
            { wch: 15 }  // Debit column width
        ];

        // Append transaction data
        const ws2 = XLSX.utils.json_to_sheet(data, { header: ["Date", "From", "To", "Credit (₹)", "Debit (₹)"] });  // Transaction data

        const boldRowsIndexes = [data.length - 1, data.length - 2, data.length - 3, data.length - 4]; // Indices for summary, gross profit, etc.

        // Iterate over each row index and apply bold styling
        boldRowsIndexes.forEach((index) => {
            const rowIndex = index + 2; // Excel row index starts from 1, and data starts from row 2 (after the header row)

            // Loop through each column of the row and apply the bold style
            ['A', 'B', 'C', 'D', 'E'].forEach(col => {
                const cellAddress = `${col}${rowIndex}`;
                if (ws2[cellAddress]) {
                    if (!ws2[cellAddress].s) {
                        ws2[cellAddress].s = {}; // Ensure there is a style object
                    }
                    ws2[cellAddress].s.font = { bold: true }; // Set the font to bold
                }
            });
        });
        // Combine the summary and transaction data into one sheet
        XLSX.utils.sheet_add_json(ws, data, { origin: -1 });

        // Create a new workbook and append the sheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");

        // Export to Excel
        XLSX.writeFile(wb, `balance-sheet-${timePeriod}.xlsx`);
    };

    // const exportToExcelSales = () => {
    //     // Check if data exists
    //     if (!sales || sales.length === 0) {
    //         alert("No data available to export!");
    //         return;
    //     }

    //     // Prepare the summary data
    //     const summaryData = [
    //         ["Field", "Value"],
    //         ["Sales Report for", selectedDate || "N/A"],
    //         ["Generated On", new Date().toLocaleDateString("en-IN")]
    //     ];

    //     // Prepare data for export based on the table structure
    //     const data = sales.map((sale) => ([
    //         sale?.veg_name || "",
    //         sale?.farmer_name || "",
    //         sale?.buyer_address || "",
    //         `₹${sale?.farmer_amount}` || 0,
    //         `₹${sale?.amount}` || 0,
    //         `₹${sale?.buyer_amount}` || 0,
    //         sale?.farmer_status || "",
    //         sale?.buyer_status || "",
    //         (() => {
    //             const amount = Number(sale?.amount);
    //             const commission = Number(sale?.commission);
    //             return isNaN(amount) || isNaN(commission) ? "Invalid data" : `₹${((amount * commission) / 100).toFixed(2)}`;
    //         })(),
    //         (() => {
    //             const amount = Number(sale?.amount);
    //             const commissionPercent = Number(sale?.commission);
    //             const magamaiPercent = Number(sale?.magamai);
    //             if (isNaN(amount) || isNaN(commissionPercent) || isNaN(magamaiPercent)) {
    //                 return "Invalid data";
    //             }
    //             const commission = (amount * commissionPercent) / 100;
    //             const magamai = (commission * magamaiPercent) / 100;
    //             return `₹${magamai.toFixed(2)}`;
    //         })(),
    //         `₹${sale?.farmer_wage}` || 0,
    //         `₹${sale?.farmer_rent}` || 0,
    //         `₹${sale?.wage}` || 0,
    //         `₹${sale?.rent}` || 0
    //     ]));

    //     // Define headers for the table
    //     const tableHeaders = [
    //         "Product", "Farmer", "Buyer", "Farmer Bill", "Sold at", "Buyer Amount",
    //         "Farmer Payment", "Buyer Payment", "Commission", "Magamai", "Farmer Coolie", "Farmer Rent", "Buyer Coolie", "Buyer Rent"
    //     ];

    //     // Combine summary and table data
    //     const combinedData = [
    //         ...summaryData,
    //         [], // Empty row as a separator
    //         tableHeaders,
    //         ...data
    //     ];

    //     // Create a sheet from combined data
    //     const sheet = XLSX.utils.aoa_to_sheet(combinedData);

    //     // Set column widths
    //     sheet['!cols'] = [
    //         { wch: 15 }, // Product
    //         { wch: 20 }, // Farmer
    //         { wch: 20 }, // Buyer
    //         { wch: 10 }, // Bill (F)
    //         { wch: 10 }, // Sold at
    //         { wch: 10 }, // Amount (B)
    //         { wch: 10 }, // Payment (F)
    //         { wch: 10 }, // Payment (B)
    //         { wch: 10 }, // Commission
    //         { wch: 10 }, // Magamai
    //         { wch: 10 }, // Coolie (F)
    //         { wch: 10 }, // Rent (F)
    //         { wch: 10 }, // Coolie (B)
    //         { wch: 10 }  // Rent (B)
    //     ];

    //     // Create workbook and append the single sheet
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, sheet, "Sales Report");

    //     // Export the workbook
    //     XLSX.writeFile(wb, `sales-report-${selectedDate || "unknown"}.xlsx`);
    // };


    const exportToExcelSales = () => {
        // Check if there is data to export
        if (!sales || sales.length === 0) {
            alert("No data available to export!");
            return;
        }

        // Get the visible column headers (using the `name` field for column labels)
        const visibleColumnHeaders = columns.map((col) => col.columnName);

        // Prepare the summary data
        const summaryData = [
            ["Field", "Value"],
            ["Sales Report for", selectedDate || "N/A"],
            ["Generated On", new Date().toLocaleDateString("en-IN")],
        ];

        const currencyColumns = [
            'Farmer Bill',
            'Buyer Amount',
            'Sold at',
            'Commission',
            'Magamai',
            'Farmer Coolie',
            'Buyer Coolie',
            'Farmer Rent',
            'Buyer Rent'
        ];

        // Map sales data to include only visible columns with formatting for currency
        const data = sales.map((sale) =>
            columns.map((col) => {
                // If a selector function exists, evaluate it; otherwise, fallback to direct access
                let value = col.selector && typeof col.selector === "function"
                    ? col.selector(sale)
                    : sale[col.columnName];

                // Format value with rupee symbol if it matches one of the currency columns
                if (currencyColumns.includes(col.columnName)) {
                    // Ensure value is a number and format it with ₹ symbol
                    value = value && !isNaN(value)
                        ? `₹${parseFloat(value).toFixed(2)}`
                        : value; // Keep as-is if not a valid number
                }

                // Create a cell object with the value and alignment style
                const cell = {
                    v: value || 0, // Value
                    s: {
                        alignment: {
                            horizontal: "left", // Set alignment to left
                        }
                    }
                };

                return cell;
            })
        );


        // Create a cell object with the value and alignment style
        const columnss = allColumns?.filter((col) => visibleColumns?.includes(col.columnName));
        const visibleHeaders = columnss.map((v, i) => {
            return v.name
        })

        // Combine summary and sales data
        const combinedData = [
            ...summaryData,
            [], // Empty row as a separator
            visibleHeaders, // Add visible column headers
            ...data,
        ];

        // Create an Excel sheet from the combined data
        const sheet = XLSX.utils.aoa_to_sheet(combinedData);

        // Dynamically set column widths based on visible columns
        sheet["!cols"] = visibleHeaders.map(() => ({ wch: 20 })); // Adjust `wch` for desired width

        // Create a new workbook and append the sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "Sales Report");

        // Export the workbook to a file
        XLSX.writeFile(workbook, `sales-report-${selectedDate || "unknown"}.xlsx`);
    };


    const swicthBalance = () => {
        setMode("balancesheet")

    }

    const swicthSales = () => {
        setMode("sales")
        setGross(null)
        setSelectedPeriod(null)
        setTimePeriod(null)
        setUserDetails(null)
    }

    const allColumns = [
        {
            name: translations[app_language]?.vegetable,
            selector: (row) => row.veg_name,
            columnName: "Product", minWidth: '120px'
        },
        { name: translations[app_language]?.farmer, selector: (row) => row.farmer_name, columnName: "Farmer", minWidth: '120px' },
        { name: translations[app_language]?.buyer, selector: (row) => row.buyer_address, columnName: "Buyer", minWidth: '140px' },
        { name: translations[app_language]?.farmerBill, selector: (row) => row.farmer_amount, cell: (row) => <span className="text-danger fw-bold">{row.farmer_amount}</span>, columnName: "Farmer Bill", minWidth: '180px' },
        { name: translations[app_language]?.soldAt, selector: (row) => row.amount, columnName: "Sold at", minWidth: '180px' },
        { name: translations[app_language]?.buyerAmount, selector: (row) => row.buyer_amount, cell: (row) => <span className="text-success fw-bold">{row.buyer_amount}</span>, columnName: "Buyer Amount", minWidth: '200px' },
        { name: translations[app_language]?.farmerPayment, selector: (row) => row.farmer_status, columnName: "Farmer Payment", minWidth: '200px' },
        { name: translations[app_language]?.buyerPayment, selector: (row) => row.buyer_status, columnName: "Buyer Payment", minWidth: '200px' },
        {
            name: translations[app_language]?.commission,
            selector: (row) => {
                const amount = Number(row.amount);
                const commission = Number(row.commission);
                if (isNaN(amount) || isNaN(commission)) return 'Invalid data';
                return ((amount * commission) / 100).toFixed(2);
            }, columnName: "Commission", minWidth: '120px'
        },
        {
            name: translations[app_language]?.magamai,
            selector: (row) => {
                const amount = Number(row.amount);
                const commissionPercent = Number(row.commission);
                const magamaiPercent = Number(row.magamai);
                if (isNaN(amount) || isNaN(commissionPercent) || isNaN(magamaiPercent)) return 'Invalid data';
                const commission = (amount * commissionPercent) / 100;
                return ((commission * magamaiPercent) / 100).toFixed(2);
            }, columnName: "Magamai", minWidth: '120px'
        },
        { name: translations[app_language]?.farmerCoolie, selector: (row) => row.farmer_wage, columnName: "Farmer Coolie", minWidth: '150px' },
        { name: translations[app_language]?.farmerRent, selector: (row) => row.farmer_rent, columnName: "Farmer Rent", minWidth: '180px' },
        { name: translations[app_language]?.buyerCoolie, selector: (row) => row.wage, columnName: "Buyer Coolie", minWidth: '180px' },
        { name: translations[app_language]?.buyerRent, selector: (row) => row.rent, columnName: "Buyer Rent", minWidth: '180px' },
    ];

    const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
    const [isSelectorVisible, setIsSelectorVisible] = useState(false);
    const handleColumnToggle = (columnName) => {
        setVisibleColumns((prev) =>
            prev.includes(columnName)
                ? prev.filter((col) => col !== columnName)
                : [...prev, columnName]
        );
    };

    const columns = allColumns?.filter((col) => visibleColumns?.includes(col.columnName));

    const changeColumns = async () => {
        setLoading(true)
        const response = await updateSalesColumnAPI(visibleColumns)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setLoading(false)
            setIsSelectorVisible(false)
            setTimeout(() => {
                setSuccessMsg(null)
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setLoading(false)
            // setTimeout(() => {
            //     setErrMsg(null)
            // }, 2000)
        }
    }

    const handleCloseError = () => {
        setErrMsg(null)
    }

    useEffect(() => {
        getAllOptions();
        getAllColumns()
    }, []);

    return (
        <div className="app-container larger">
            {user?.user_role === "marketer" || (user?.user_role === "assistant" && user?.access?.accounts) ? (
                <>
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            <div className='head pt-2 mb-2 d-flex align-items-center justify-content-between'>
                                <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/inventory")}>{translations[app_language]?.back}</button>
                                <h2 className='primary-color text-center flex-grow-1 m-0'>
                                    {translations[app_language]?.reports}
                                </h2>
                            </div>
                            <ul className="nav nav-pills mb-3 mt-0" id="pills-tab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className={`nav-link ${mode === "balancesheet" ? "active" : ""}`} id="pills-home-tab" onClick={swicthBalance}>{translations[app_language]?.balanceSheet}</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className={`nav-link ${mode === "sales" ? "active" : ""}`} id="pills-profile-tab" onClick={swicthSales}>{translations[app_language]?.salesReport}</button>
                                </li>
                            </ul>
                            {mode === "balancesheet" &&
                                <div className="balance-container container">
                                    <div className="balance-header row mb-4">
                                        <div className="col-md-6">
                                            <div className="balance-controls d-flex gap-3">
                                                <select
                                                    className="balance-select form-select w-50"
                                                    value={selectedPeriod}
                                                    onChange={handlePeriodChange}
                                                >
                                                    <option value="">Select Period</option>
                                                    {options?.map((period) => (
                                                        <option key={period?.value} value={period?.value}>
                                                            {period?.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="balance-generate btn"
                                                    onClick={getBalanceSheet}
                                                    disabled={!selectedPeriod}
                                                >
                                                    {translations[app_language]?.generate}
                                                </button>
                                            </div>
                                        </div>
                                        {gross &&
                                            <div className="col-md-6 d-flex gap-2 justify-content-end align-items-center">
                                                <button className="submit-btn py-2 px-2" onClick={downloadInvoiceAsPDF}>{translations[app_language]?.exportPDF}</button>
                                                <button className="submit-btn py-2 px-2" onClick={exportToExcel}>{translations[app_language]?.exportExcel}</button>
                                            </div>}
                                    </div>
                                    {gross && (
                                        <div className="balance-content card">
                                            <div className="">
                                                <div className="balance-summary">
                                                    <div
                                                        className={`row py-3 border-bottom ${gross?.transaction_total > 0
                                                            ? "bg-success text-white"
                                                            : "bg-danger text-white"
                                                            }`}
                                                    >
                                                        <div className="col-md-8">
                                                            <h5 className="balance-operational-title mb-0">{translations[app_language]?.netProfit}</h5>
                                                        </div>
                                                        <div className="col-md-4 text-end">
                                                            <span className="balance-gross-amount">
                                                                ₹{gross?.transaction_total || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="balance-operational-details">
                                                        <div className="table-container my-2">
                                                            <table className="modern-table" id="invoice">
                                                                <thead className="fix-head">
                                                                    <tr>
                                                                        <th>Date</th>
                                                                        <th>From</th>
                                                                        <th>To</th>
                                                                        <th>Credit(INR)</th>
                                                                        <th>Debit(INR)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {gross?.accounts
                                                                        ?.sort(
                                                                            (a, b) =>
                                                                                new Date(b.created_at) - new Date(a.created_at)
                                                                        )
                                                                        ?.map((data, index) => (
                                                                            <tr
                                                                                key={index}
                                                                                style={{
                                                                                    backgroundColor: `${data?.type === "expense" ? "#FFE6A9" : ""
                                                                                        }`,
                                                                                }}
                                                                            >
                                                                                <td>{formatDate(data?.created_at)}</td>
                                                                                <td>{data?.type === "buyer" ? data?.name : "-"}</td>
                                                                                <td>{data?.type === "farmer" ? data?.name : "-"}</td>
                                                                                <td className="text-success fw-bold">
                                                                                    {data?.type === "buyer" ? data?.amount : "-"}
                                                                                </td>
                                                                                <td className="text-danger fw-bold">
                                                                                    {(data?.type === "farmer" || data?.type === "expense")
                                                                                        ? data?.amount
                                                                                        : "-"}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    <div className="balance-summary-totals d-flex flex-wrap justify-content-between mt-3 p-3">
                                                        <div className="summary-item">
                                                            <h6>{translations[app_language]?.totalCredit}</h6>
                                                            <p className="text-success fw-bold">₹{gross?.totalBuyerAmount || 0}</p>
                                                        </div>
                                                        <div className="summary-item">
                                                            <h6>{translations[app_language]?.debitFarmers}</h6>
                                                            <p className="text-danger fw-bold">₹{gross?.totalFarmerAmount || 0}</p>
                                                        </div>
                                                        <div className="summary-item">
                                                            <h6>{translations[app_language]?.grossProfit}</h6>
                                                            <p className={gross?.gross > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>₹{gross?.gross || 0}</p>
                                                        </div>
                                                        <div className="summary-item">
                                                            <h6>{translations[app_language]?.operationalExpenses}</h6>
                                                            <p className="text-danger fw-bold">₹{gross?.totalExpAmount || 0}</p>
                                                        </div>
                                                        <div className="summary-item">
                                                            <h6>{translations[app_language]?.netProfit}</h6>
                                                            <p className={gross?.transaction_total > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>₹{gross?.transaction_total || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>}
                            {mode === "sales" &&
                                <div className="balance-container container mt-4"
                                >
                                    <div className="balance-header row mb-4">
                                        <div className="col-md-5">
                                            <div className="balance-controls d-flex gap-3">
                                                <input
                                                    type="date"
                                                    className="px-2 w-50 balance-select"
                                                    value={selectedDate}
                                                    onChange={handleDateChange}
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                                <button
                                                    className="balance-generate btn"
                                                    onClick={getSalesReport}
                                                    disabled={!selectedDate}
                                                >
                                                    {translations[app_language]?.generate}
                                                </button>
                                            </div>
                                        </div>
                                        {(sales?.length > 0) &&
                                            <div className="col-md-7 d-flex gap-2 justify-content-end align-items-center">
                                                <button
                                                    className="submit-btn py-2 px-2"
                                                    onClick={() => setIsSelectorVisible(!isSelectorVisible)}
                                                >
                                                    {translations[app_language]?.manageColumn}
                                                </button>
                                                <button className="submit-btn py-2 px-2" onClick={() => downloadInvoiceAsPDFSales(visibleColumns, sales)}>
                                                    {translations[app_language]?.exportPDF}
                                                </button>

                                                <button className="submit-btn py-2 px-2" onClick={exportToExcelSales}>{translations[app_language]?.exportExcel}</button>
                                            </div>}
                                    </div>
                                    {sales &&
                                        <>
                                            {isSelectorVisible && (
                                                <div
                                                    className="modal fade show d-block"
                                                    tabIndex="-1"
                                                >
                                                    <div className="modal-dialog">
                                                        <div className="modal-content">
                                                            <div className="modal-header">
                                                                <h5 className="modal-title" id="columnSelectorModalLabel">{translations[app_language]?.selectColumns}</h5>
                                                                {/* <button
                                                                    type="button"
                                                                    className="btn-close"
                                                                    onClick={() => setIsSelectorVisible(false)}
                                                                ></button> */}
                                                            </div>
                                                            <div className="modal-body">
                                                                {allColumns.map((col) => (
                                                                    <div key={col.name} className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            id={`column-${col.columnName}`}
                                                                            checked={visibleColumns.includes(col.columnName)}
                                                                            onChange={() => handleColumnToggle(col.columnName)}
                                                                        />
                                                                        <label className="form-check-label" htmlFor={`column-${col.columnName}`}>
                                                                            {col.name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="modal-footer">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary"
                                                                    onClick={() => setIsSelectorVisible(false)}
                                                                >
                                                                    {translations[app_language]?.cancel}
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="submit-btn py-2 requirement-btn"
                                                                    onClick={changeColumns}
                                                                >
                                                                    {translations[app_language]?.submit}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {sales?.length > 0 ?
                                                <div className="table-container data-table my-5">
                                                    <DataTable id="sales"
                                                        columns={columns}
                                                        data={sales}
                                                        highlightOnHover
                                                        defaultSortFieldId={1}
                                                        fixedHeader
                                                        sortable={false}
                                                        fixedHeaderScrollHeight="500px"
                                                    />
                                                </div> :
                                                <p className='text-danger fw-bold fs-3 text-center mt-5'> {translations[app_language]?.noRecords}</p>
                                            }
                                        </>
                                    }
                                </div>}

                            <div className={successMsg === null ? "alert_net hide_net" : "alert_net show alert_suc_bg"}>
                                <FaCircleCheck className='exclamation-circle' />
                                <span className="msg">{successMsg}</span>
                                <div className="close-btn close_suc">
                                    <IoClose className='close_mark' size={26} />
                                </div>
                            </div>
                            {/* <div className={errMsg === null ? "alert_net hide_net" : "alert_net show alert_war_bg"} >
                                <RxCrossCircled className='exclamation-circle' />
                                <span className="msg">{errMsg}</span>
                                <div className="close-btn close_war">
                                    <IoClose className='close_mark' size={26} />
                                </div>
                            </div> */}
                            <ModalBoxError errMsg={errMsg} onClose={handleCloseError} />

                        </>
                    )}
                </>
            ) : (
                <>
                    {user ? <AccessDenied /> : <Loader />}
                </>
            )}
        </div>
    );
};

export default Accounts;
