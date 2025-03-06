import React, { useEffect, useState, useRef } from 'react';
import { FaCircleMinus } from 'react-icons/fa6';
import { IoMdAddCircle } from 'react-icons/io';
import { addProductAPI } from './Api';
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'
import Spinner from './Spinner';
const AddInventoryTable = ({ searchProduct, searchFarmer, viewInventory, language, sacks, appLanguage,translations }) => {
    const [rows, setRows] = useState([{ sack_price: sacks[0]?.sack_price, unit: "kg", veg_id: null, mobile: null, image: null }]);
    const [errors, setErrors] = useState([]);
    const [mapProduct, setMapProduct] = useState([]);
    const [mapFarmer, setMapFarmer] = useState([]);
    const [showSearchProduct, setShowSearchProduct] = useState(false);
    const [showSearchFarmer, setShowSearchFarmer] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [activeFarmerRow, setActiveFarmerRow] = useState(null);
    const [activeItemIndex, setActiveItemIndex] = useState(-1);
    const [activeFarmerItemIndex, setActiveFarmerItemIndex] = useState(-1);
    const listContainerRef = useRef(null);
    const listItemRefs = useRef([]);
    const farmerItemRefs = useRef([]);
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const [spin, setSpin] = useState(false)



    const handleAddRow = () => {
        setRows([...rows, { sack_price: sacks[0].sack_price, unit: "kg", veg_id: null, mobile: null, image: null }]);
        setErrors([...errors, {}]);
    };

    const filterProduct = (index, value) => {
        const updatedRows = [...rows];
        updatedRows[index].name = value;
        setRows(updatedRows);


        // Check if the input matches any shortcut_key in searchProduct
        const shortcutMatch = searchProduct.find((product) =>
            product?.shortcut_key === value
        );

        if (shortcutMatch) {
            // Automatically select the product using the shortcut key
            productListClicked(index, { veg_name: shortcutMatch.veg_name, veg_id: shortcutMatch.veg_id, tamil_name: shortcutMatch?.tamil_name });
            return; // Exit early to prevent further filtering
        }

        if (value) {
            const filteredProducts = searchProduct.filter((product) =>
                product.veg_name.toLowerCase().includes(value.toLowerCase())
            );
            setMapProduct(filteredProducts);
        } else {
            setMapProduct(searchProduct);
        }

        setShowSearchProduct(true);
        setActiveRow(index); // Show search results for the active row
        setActiveItemIndex(-1); // Reset the highlighted item when starting a new search
    };

    const filterFarmer = (index, value) => {
        const updatedRows = [...rows];
        updatedRows[index].farmer = value;
        setRows(updatedRows);

        if (value) {
            const filteredFarmers = searchFarmer.filter((farmer) =>
                farmer.farmer_name.toLowerCase().includes(value.toLowerCase())
            );
            setMapFarmer(filteredFarmers);
        } else {
            setMapFarmer(searchFarmer);
        }

        setShowSearchFarmer(true);
        setActiveFarmerRow(index);
        setActiveFarmerItemIndex(-1);
    };

    const showAllProducts = (index) => {
        setActiveRow(index); // Set the active row
        setMapProduct(searchProduct); // Show all products initially
        setShowSearchProduct(true); // Display the dropdown
    };

    // Show all farmers
    const showAllFarmers = (index) => {
        setActiveFarmerRow(index);
        setMapFarmer(searchFarmer);
        setShowSearchFarmer(true);
    };


    const productListClicked = (index, product) => {
        const updatedRows = [...rows];
        if (language === "tamil") {
            updatedRows[index].name = product.tamil_name;
        }
        else {
            updatedRows[index].name = product.veg_name;
        }
        updatedRows[index].veg_id = product.veg_id;
        setRows(updatedRows);

        const updatedErrors = [...errors];
        if (updatedErrors[index]) {
            updatedErrors[index].name = null;
        }
        setErrors(updatedErrors);

        setShowSearchProduct(false);
        setActiveRow(null); // Close the product search
    };

    const farmerListClicked = (index, farmer) => {
        const updatedRows = [...rows];
        updatedRows[index].farmer = farmer.farmer_name;
        updatedRows[index].mobile = farmer.farmer_mobile;
        setRows(updatedRows);

        const updatedErrors = [...errors];
        if (updatedErrors[index]) {
            updatedErrors[index].farmer = null;
        }
        setErrors(updatedErrors);

        setShowSearchFarmer(false);
        setActiveFarmerRow(null);
    };

    const handleKeyDownS = (e, index) => {
        if (e.key === "ArrowDown") {
            if (activeItemIndex < mapProduct.length - 1) {
                setActiveItemIndex(activeItemIndex + 1);
                scrollToActiveItem(listItemRefs, activeItemIndex + 1);
            }
        } else if (e.key === "ArrowUp") {
            if (activeItemIndex > 0) {
                setActiveItemIndex(activeItemIndex - 1);
                scrollToActiveItem(listItemRefs, activeItemIndex - 1);
            }
        } else if (e.key === "Enter" && activeItemIndex >= 0) {
            productListClicked(index, mapProduct[activeItemIndex]);
        }
    };

    const handleFarmerKeyDown = (e, index) => {
        if (e.key === "ArrowDown") {
            if (activeFarmerItemIndex < mapFarmer.length - 1) {
                setActiveFarmerItemIndex(activeFarmerItemIndex + 1);
                scrollToActiveItem(farmerItemRefs, activeFarmerItemIndex + 1);
            }
        } else if (e.key === "ArrowUp") {
            if (activeFarmerItemIndex > 0) {
                setActiveFarmerItemIndex(activeFarmerItemIndex - 1);
                scrollToActiveItem(farmerItemRefs, activeFarmerItemIndex - 1);
            }
        } else if (e.key === "Enter" && activeFarmerItemIndex >= 0) {
            farmerListClicked(index, mapFarmer[activeFarmerItemIndex]);
        }
    };

    const scrollToActiveItem = (refs, index) => {
        if (refs.current[index]) {
            refs.current[index].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    };


    const handleRowChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);

        const updatedErrors = [...errors];
        if (updatedErrors[index]) {
            updatedErrors[index][field] = null;
        }
        setErrors(updatedErrors);
    };

    const handleImageChange = (index, file) => {
        const updatedRows = [...rows];
        updatedRows[index].image = file;  // Store the uploaded image file
        setRows(updatedRows);
    };

    const validateRows = () => {
        const newErrors = rows.map((row) => {
            const rowErrors = {};
            if (!row.name) rowErrors.name = "Product is required.";
            if (!row.veg_id) rowErrors.veg_id = "Please select a valid product from the list.";
            if (!row.farmer) rowErrors.farmer = "Farmer is required.";
            if (!row.mobile) rowErrors.mobile = "Please select a valid farmer from the list.";
            if (!row.sack_price && row.sack_price !== 0) rowErrors.sack_price = "Sack is required.";
            if (!row.quantity) rowErrors.quantity = "Weight is required.";
            if (!row.unit || (row.unit !== "kg" && row.unit !== "total")) {
                rowErrors.unit = "Price type is required.";
            }
            if (!row.price) rowErrors.price = "Proposed price is required.";
            return rowErrors;
        });
        setErrors(newErrors);
        return newErrors.every((err) => Object.keys(err).length === 0);
    };

    // const handleSubmit = () => {
    //     if (!validateRows()) {
    //         return;
    //     }
    //     // const processedRows = rows.map((row) => ({
    //     //     name: row.name || "",
    //     //     veg_id: row.veg_id || null,
    //     //     farmer: row.farmer || "",
    //     //     mobile: row.mobile || null,
    //     //     quantity: row.quantity || 0,
    //     //     unit: row.unit || "",
    //     //     price: row.price || 0,
    //     //     farmer_wage: row.farmer_wage || 0,
    //     //     farmer_rent: row.farmer_rent || 0,
    //     //     sack_count:row.sack_count ||0,
    //     //     sack_price:row.sack_price ||0
    //     // }));

    //     const processedRows = rows.flatMap((row) => {
    //         const quantities = row.quantity ? row.quantity.split('+').map((q) => q.trim()) : [0];


    //         return quantities.map((quantity) => ({
    //             name: row.name || "",
    //             veg_id: row.veg_id || null,
    //             farmer: row.farmer || "",
    //             mobile: row.mobile || null,
    //             quantity: parseFloat(quantity) || 0,
    //             unit: row.unit || "",
    //             price: row.price || 0,
    //             farmer_wage: row.farmer_wage || 0,
    //             farmer_rent: row.farmer_rent || 0,
    //             sack_count: row.sack_count || 0,
    //             sack_price: row.sack_price || 0
    //         }));
    //     });

    //     console.log("Submitted Data:", processedRows);
    // };




    const handleRemoveRow = (index) => {
        if (rows.length > 1) {  // Avoid removing the last row

            const updatedRows = [...rows];
            updatedRows.splice(index, 1);  // Remove the row at the given index
            setRows(updatedRows);

            // Optionally, reset errors related to this row
            const updatedErrors = [...errors];
            updatedErrors.splice(index, 1);  // Remove error for this row
            setErrors(updatedErrors);
        }
    };

    // const handleSubmit = async () => {
    //     if (!validateRows()) {
    //         return;
    //     }
    //     const formData = new FormData();
    //     rows.forEach((row, index) => {
    //         formData.append(`products[${index}][name]`, row.name || "");
    //         formData.append(`products[${index}][veg_id]`, row.veg_id || null);
    //         formData.append(`products[${index}][farmer]`, row.farmer || "");
    //         formData.append(`products[${index}][mobile]`, row.mobile || null);
    //         formData.append(`products[${index}][quantity]`, row.quantity || 0);
    //         formData.append(`products[${index}][unit]`, row.unit || "");
    //         formData.append(`products[${index}][price]`, row.price || 0);
    //         formData.append(`products[${index}][farmer_wage]`, row.farmer_wage || 0);
    //         formData.append(`products[${index}][farmer_rent]`, row.farmer_rent || 0);
    //         formData.append(`products[${index}][sack_count]`, row.sack_count || 0);
    //         if (row.image) {
    //             const imageName = `image_${Date.now()}_${index}.jpg`;
    //             formData.append(`products[${index}][file]`, row.image, imageName);
    //         }
    //     });
    //     setSpin(true)
    //     const response = await addProductAPI(formData)
    //     if (response?.status === 200) {
    //         setSuccessMsg(response?.message)
    //         setSpin(false)
    //         setTimeout(() => {
    //             setSuccessMsg(null)
    //             viewInventory()
    //         }, 2000)
    //     }
    //     else {
    //         setErrMsg(response?.message)
    //         setSpin(false)
    //         setTimeout(() => {
    //             setErrMsg(null)
    //         }, 2000)
    //     }
    // };

    const handleSubmit = async () => {
        if (!validateRows()) {
            return;
        }
        const formData = new FormData();

        // Process rows and handle quantity splitting
        const processedRows = rows.flatMap((row) => {

            const quantities = row.quantity ? row.quantity?.split('+').map((q) => q.trim()) : [0];

            // Create a new object for each quantity
            return quantities.map((quantity, index) => {
                let rent = 0
                if (index === 0) {
                    rent = row.farmer_rent
                }
                return (
                    {
                        name: row.name || "",
                        veg_id: row.veg_id || null,
                        farmer: row.farmer || "",
                        mobile: row.mobile || null,
                        quantity: parseFloat(quantity) || 0,
                        unit: row.unit || "",
                        price: row.price || 0,
                        farmer_wage: row.farmer_wage || 0,
                        farmer_rent: rent,
                        sack_count: row.sack_count || 0,
                        sack_price: row.sack_price || 0,
                        image: row.image || null
                    }
                )
            });
        });


        // Append processed rows to formData
        processedRows.forEach((row, index) => {
            formData.append(`products[${index}][name]`, row.name);
            formData.append(`products[${index}][veg_id]`, row.veg_id);
            formData.append(`products[${index}][farmer]`, row.farmer);
            formData.append(`products[${index}][mobile]`, row.mobile);
            formData.append(`products[${index}][quantity]`, row.quantity);
            formData.append(`products[${index}][unit]`, row.unit);
            formData.append(`products[${index}][price]`, row.price);
            formData.append(`products[${index}][farmer_wage]`, row.farmer_wage);
            formData.append(`products[${index}][farmer_rent]`, row.farmer_rent);
            formData.append(`products[${index}][sack_count]`, row.sack_count);
            formData.append(`products[${index}][sack_price]`, row.sack_price);

            if (row.image) {
                const imageName = `image_${Date.now()}_${index}.jpg`;
                formData.append(`products[${index}][file]`, row.image, imageName);
            }
        });
        setSpin(true);
        const response = await addProductAPI(formData);
        if (response?.status === 200) {
            setSuccessMsg(response?.message);
            setSpin(false);
            setTimeout(() => {
                setSuccessMsg(null);
                viewInventory();
            }, 2000);
        } else {
            setErrMsg(response?.message);
            setSpin(false);
            setTimeout(() => {
                setErrMsg(null);
            }, 2000);
        }
    };


    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            handleAddRow();
        }
    };
    const handleKeyPress = (e) => {
        if (e.ctrlKey && e.key === 'r') {  // Check for Ctrl + R
            e.preventDefault();  // Prevent default browser reload action
            if (rows.length > 1) {  // Avoid removing the last row
                handleRemoveRow(rows.length - 1);  // Remove the last row
            }
        }
    };

    const handleBlur = (e, index) => {
        // Check if the focus is leaving the current dropdown
        setTimeout(() => {
            if (activeRow === index && !e.currentTarget?.contains(document.activeElement)) {
                setShowSearchProduct(false);
            }
        }, 100); // Timeout ensures `onClick` events are processed first
    };

    const handleFarmerBlur = (e, index) => {
        // Check if the focus is leaving the current dropdown
        setTimeout(() => {
            if (activeFarmerRow === index && !e.currentTarget?.contains(document.activeElement)) {
                setShowSearchFarmer(false);
            }
        }, 100); // Timeout ensures `onClick` events are processed first
    };

    useEffect(() => {

        // Add event listener on mount
        window.addEventListener('keydown', handleKeyPress);

        // Clean up the event listener on unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [rows]);


    return (
        <div onKeyDown={handleKeyDown} tabIndex={0} className='mt-4'>
            <table className="inventory_table_container">
                <thead className="inventory_table_header">
                    <tr>
                        <th colSpan={6} className='text-center'>{translations[appLanguage]?.inventoryEntry}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <tr className="inventory_table_added_gap">
                                    <td colSpan={6}></td>
                                </tr>
                            )}
                            <tr className="inventory_table_row">
                                <td>
                                    <div className="form-group" onBlur={(e) => handleBlur(e, index)} onFocus={() => setActiveRow(index)}>
                                        <input
                                            type="text"
                                            placeholder={translations[appLanguage]?.vegetable + "*"}
                                            className="form-control input-search"
                                            value={row.name || ""}
                                            onChange={(e) => filterProduct(index, e.target.value)}
                                            onFocus={() => {
                                                setActiveRow(index);
                                                showAllProducts(index);
                                            }}
                                            onKeyDown={(e) => handleKeyDownS(e, index)} // Handle key press
                                            autoComplete="off"
                                        />
                                        {errors[index]?.name && <span className="error">{errors[index].name}</span>}
                                        {activeRow === index && showSearchProduct && (
                                            <div className="search-result-in" onMouseDown={(e) => e.preventDefault()}>
                                                {mapProduct.length > 0 ? (
                                                    <ul className="p-2">
                                                        {mapProduct.map((product, i) => (
                                                            <li
                                                                className={`search-list ${i === activeItemIndex ? "highlighted" : ""}`}
                                                                key={i}
                                                                ref={(el) => (listItemRefs.current[i] = el)}
                                                                onClick={() => productListClicked(index, product)}
                                                                onMouseEnter={() => setActiveItemIndex(i)} // Highlight on hover
                                                            >
                                                                {language === "tamil" ? product?.tamil_name : product.veg_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="pt-2 text-center">No results found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="form-group" onBlur={(e) => handleFarmerBlur(e, index)}
                                        onFocus={() => setActiveFarmerRow(index)}>
                                        <input
                                            type="text"
                                            className="form-control input-search"
                                            placeholder={translations[appLanguage]?.farmer + "*"}

                                            value={row.farmer || ""}
                                            onChange={(e) => filterFarmer(index, e.target.value)}
                                            onFocus={() => {
                                                setActiveFarmerRow(index);
                                                showAllFarmers(index);
                                            }}
                                            onKeyDown={(e) => handleFarmerKeyDown(e, index)}
                                            autoComplete="off"
                                        />
                                        {errors[index]?.farmer && <span className="error">{errors[index].farmer}</span>}
                                        {activeFarmerRow === index && showSearchFarmer && (
                                            <div className="search-result-in" onMouseDown={(e) => e.preventDefault()}>
                                                {mapFarmer.length > 0 ? (
                                                    <ul className="p-2">
                                                        {mapFarmer.map((farmer, i) => (
                                                            <li
                                                                className={`search-list ${i === activeFarmerItemIndex ? "highlighted" : ""}`}
                                                                key={i}
                                                                ref={(el) => (farmerItemRefs.current[i] = el)}
                                                                onClick={() => farmerListClicked(index, farmer)}
                                                            >
                                                                {farmer.farmer_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="pt-2 text-center">No results found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="form-group">
                                    <select
                                        className="form-control"
                                        value={row.sack_price || ""}
                                        onChange={(e) => handleRowChange(index, 'sack_price', e.target.value)}
                                    >
                                        {sacks.map((sack, i) => (
                                            <option key={i} value={sack.sack_price}>
                                                {sack.sack_type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors[index]?.sack_price && <span className="error">{errors[index].sack_price}</span>}
                                </td>

                                <td className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={translations[appLanguage]?.weight + "*"}
                                        onWheel={(e) => e.target.blur()}
                                        value={row.quantity || ""}
                                        onChange={(e) => {
                                            let value = e.target.value.trim();

                                            
                                            if (value === "") {
                                                handleRowChange(index, "quantity", "");
                                                handleRowChange(index, "sack_count", 0);
                                                return;
                                            }

                                
                                            if (/^\d+(\.\d{0,2})?(\+\d+(\.\d{0,2})?)*\+?$/.test(value)) {
                                                handleRowChange(index, "quantity", value);
                                                
                                            
                                                const sackCount = value ? value.split("+").filter(Boolean).length : 1;
                                                handleRowChange(index, "sack_count", sackCount);
                                            }
                                        }}
                                    />
                                    {errors[index]?.quantity && <span className="error">{errors[index].quantity}</span>}
                                </td>

                                <td className="form-group">
                                    <input
                                        type="number"
                                        onWheel={(e) => e.target.blur()}
                                        min="0"
                                        placeholder={translations[appLanguage]?.proposedPrice + "*"}


                                        className="form-control"
                                        value={row.price || ""}
                                        onChange={(e) => {
                                            const value = Math.max(0, parseFloat(e.target.value, 10) || 0);
                                            handleRowChange(index, 'price', value)
                                        }}

                                    />
                                    {errors[index]?.price && <span className="error">{errors[index].price}</span>}
                                </td>

                                <td className="form-group">
                                    <select
                                        className="form-control"
                                        value={row.unit || "kg"}
                                        onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                                    >
                                        <option value="kg">Per Kg</option>
                                        <option value="total">Total</option>
                                    </select>
                                    {errors[index]?.unit && <span className="error">{errors[index].unit}</span>}
                                </td>
                            </tr>
                            <tr className="inventory_table_subrow">
                                <td colSpan={6}>
                                    <div className="inventory_table_supplemental_inputs form-group">
                                        <input
                                            type="number"
                                            min="0"
                                            onWheel={(e) => e.target.blur()}
                                            className="form-control inventory_table_supplemental"
                                            value={row.sack_count || ""}
                                            onChange={(e) => {
                                                const value = Math.max(0, parseFloat(e.target.value, 10) || 0);
                                                handleRowChange(index, 'sack_count', value)
                                            }}
                                            placeholder={translations[appLanguage]?.sack}


                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            onWheel={(e) => e.target.blur()}
                                            className="form-control inventory_table_supplemental"
                                            value={row.farmer_rent || ""}
                                            onChange={(e) => {
                                                const value = Math.max(0, parseFloat(e.target.value, 10) || 0);
                                                handleRowChange(index, 'farmer_rent', value)
                                            }
                                            }

                                            placeholder={translations[appLanguage]?.rent}


                                        />
                                        <div className="inventory_table_file_input">
                                            <input
                                                type="file"
                                                accept="image/*" className='form-control'
                                                onChange={(e) => handleImageChange(index, e.target.files[0])}  // Handle image selection
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            <div className="inventory_table_actions">
                {rows?.length > 1 &&
                    <button className="inventory_table_add_button me-2" onClick={handleRemoveRow}>
                        <FaCircleMinus />
                    </button>}
                <button className="inventory_table_add_button" onClick={handleAddRow}>
                    <IoMdAddCircle />
                </button>
            </div>

            <div className='d-flex justify-content-center'>
                <button className='submit-btn py-2' onClick={handleSubmit}>
                    {spin ? <Spinner /> : translations[appLanguage]?.submit}
                </button>
            </div>

            <div className={successMsg === null ? "alert_net hide_net" : "alert_net show alert_suc_bg"}>
                <FaCircleCheck className='exclamation-circle' />
                <span className="msg">{successMsg}</span>
                <div className="close-btn close_suc">
                    <IoClose className='close_mark' size={26} />
                </div>
            </div>

            <div className={errMsg === null ? "alert_net hide_net" : "alert_net show alert_war_bg"} >
                <RxCrossCircled className='exclamation-circle' />
                <span className="msg">{errMsg}</span>
                <div className="close-btn close_war">
                    <IoClose className='close_mark' size={26} />
                </div>
            </div>
        </div>
    );
};

export default AddInventoryTable;
