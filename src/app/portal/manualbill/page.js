"use client"
import React, { useRef, useState } from 'react'
import { PlusCircle, Trash2, Store } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ManualBill = () => {

    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [items, setItems] = useState([{ itemName: '', quantity: '', price: '', amount: '' }]);
    const [discount, setDiscount] = useState('');
    const invoiceRef = useRef(null);
    const calculateAmount = (quantity, price) => {
        return quantity && price ? (parseFloat(quantity) * parseFloat(price)).toFixed(2) : '';
    };

    const downloadInvoiceAsPDF = async () => {
        const element = invoiceRef.current;
        // Hide "Add Item" button
        const addItemButton = document.querySelector('.add-item-button');
        addItemButton.classList.add('hidden-during-pdf');
        const addItem = document.querySelector('.add-item');
        addItem.classList.remove('justify-content-between');
        addItem.classList.add('justify-content-end');

        const deleteIconColumns = document.querySelectorAll('.manual_bill td:nth-child(5), .manual_bill th:nth-child(5)');
        deleteIconColumns.forEach(col => col.style.display = 'none');

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 10;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save("invoice.pdf");
        
        deleteIconColumns.forEach(col => col.style.display = '');
        // Show "Add Item" button again
        addItemButton.classList.remove('hidden-during-pdf');
        addItem.classList.add('justify-content-between');
        addItem.classList.remove('justify-content-end');
    };


    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'price') {
            const quantity = field === 'quantity' ? value : items[index].quantity;
            const price = field === 'price' ? value : items[index].price;
            newItems[index].amount = calculateAmount(quantity, price);
        }

        setItems(newItems);
    };

    const addNewRow = () => {
        setItems([...items, { itemName: '', quantity: '', price: '', amount: '' }]);
    };

    const removeRow = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const calculateTotal = () => {
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const discountAmount = discount ? (subtotal * parseFloat(discount) / 100) : 0;
        return (subtotal - discountAmount).toFixed(2);
    };

    return (
        <div className='app-container'>
            <div className='head pt-2 text-center '>
                <h2 className='primary-color '>Manual Bill</h2>
            </div>
            <div className="text-center mt-4 d-flex justify-content-end">
                <button onClick={downloadInvoiceAsPDF} className="submit-btn p-2">
                    Download as PDF
                </button>
            </div>
            <div className="container">
                <div className="card mx-auto my-4" style={{ maxWidth: '800px' }}>
                    <div className="card-body" ref={invoiceRef} id="invoice">
                        <div className="text-center mb-4">
                            <Store className="mb-2" size={40} />
                            <h1 className="fs-3 fw-bold">VV Vegetables</h1>
                            <p className="text-muted mb-1">Pavoorchatram</p>
                            <p className="text-muted">Phone:3131313131</p>
                        </div>

                        <div className="mb-4">
                            <div className="d-flex justify-content-end">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="form-control"
                                    style={{ width: 'auto' }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive mb-4">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Item Name</th>
                                        <th className="text-end">Quantity</th>
                                        <th className="text-end">Price</th>
                                        <th className="text-end">Amount</th>
                                        {items.length > 1 &&
                                            <th style={{ width: '50px' }}></th>
                                        }
                                    </tr>
                                </thead>
                                <tbody className='manual_bill'>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.itemName}
                                                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                    className="form-control"
                                                    placeholder="Item name"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="form-control text-end"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    className="form-control text-end"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td className="text-end align-middle">
                                                {item.amount || '0.00'}
                                            </td>
                                            {items.length > 1 &&
                                                <td>
                                                    <button
                                                        onClick={() => removeRow(index)}
                                                        className="btn btn-link text-danger p-0"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            }
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center add-item">
                            <button
                                onClick={addNewRow}
                                className="btn btn-link text-primary p-0 d-flex align-items-center gap-2 add-item-button"
                            >
                                <PlusCircle size={18} />
                                Add Item
                            </button>

                            <div className="right-align">
                                <div>
                                    <label className="form-label text-muted small">Discount (%)</label>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="form-control text-end"
                                        style={{ width: '100px' }}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="form-label text-muted small">Total Amount</label>
                                    <div className="fs-4 fw-bold">₹ {calculateTotal()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManualBill