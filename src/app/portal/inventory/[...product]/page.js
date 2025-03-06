"use client"
import { editProductInventoryAPI, editSellingInfoAPI, getBuyerAPI, getImageAPI, getSellingInfoAPI } from '@/src/Components/Api';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { FaRupeeSign } from "react-icons/fa";
import { FaCircleCheck } from 'react-icons/fa6'
import { RxCrossCircled } from "react-icons/rx";
import { IoClose } from 'react-icons/io5'
import Loader from '@/src/Components/Loader';
import Spinner from '@/src/Components/Spinner';
import { useSelector } from 'react-redux';
import AccessDenied from '@/src/Components/AccessDenied';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const Product = ({ params }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const router = useRouter()
    const app_language = useSelector((state) => state?.user?.app_language)
    const translations = useSelector((state) => state?.language?.translations)
    const sub_status = useSelector((state) => state?.user?.subscription)
    const { basePath } = useRouter();
    const user = useSelector((state) => state?.user?.userDetails)
    const [noBuyer, setNoBuyer] = useState(false)
    const [priceType, setPriceType] = useState(null)
    const [priceTypeCheck, setPriceTypeCheck] = useState(null)
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const { register: register2, handleSubmit: handleSubmit2, reset: reset2, formState: { errors: errors2 } } = useForm()
    const [sellData, setSellData] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [errMsg, setErrMsg] = useState(null)
    const id = params.product[1]
    const [inventoryData, setInventoryData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchBuyer, setSearchBuyer] = useState(null)
    const [mapBuyer, setMapBuyer] = useState(null)
    const [buyername, setBuyerName] = useState(null)
    const [showSearchBuyer, setShowSearchBuyer] = useState(false)
    const [buyerid, setBuyerId] = useState(null)
    const [spinAdd, setSpinAdd] = useState(false)
    const [price, setPrice] = useState(null)
    const [max, setMax] = useState(null)
    const [showWageInput, setShowWageInput] = useState(false);
    const [showRentInput, setShowRentInput] = useState(false);
    const [showWageInputMulti, setShowWageInputMulti] = useState(false);
    const [showRentInputMulti, setShowRentInputMulti] = useState(false);
    const [paid, setPaid] = useState(false)
    const [multiSell, setMultiSell] = useState(false)
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalMultiWeight, setTotalMultiWeight] = useState(0);
    const [maxMultiWeight, setMaxMultiWeight] = useState(0);
    const [multiPriceType, setMultiPriceType] = useState("kg");
    const [multiPrice, setMultiPrice] = useState('');
    const [multiPaid, setMultiPaid] = useState(false);
    const [isOffCanvasOpenMulti, setIsOffCanvasOpenMulti] = useState(false)
    const [commission, setCommission] = useState(null)
    const getBuyerList = async () => {
        const response = await getBuyerAPI()

        if (response?.status === 200) {
            setSearchBuyer(response.data);
            if (!response?.data?.length) {
                setNoBuyer(true)
            }
            else {
                setNoBuyer(false)
            }
        }
        else {
            setErrMsg(response.message)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    const filterBuyer = (e) => {
        setShowSearchBuyer(true)
        setBuyerName(e.target.value)
        const filteredSearch = searchBuyer?.filter((v, i) => {
            return v?.buyer_name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                v?.buyer_address.toLowerCase().includes(e.target.value.toLowerCase())
        })
        setMapBuyer(filteredSearch)
    }
    const showAll = () => {
        setShowSearchBuyer(true)
        setMapBuyer(searchBuyer)
    }
    const buyerListClicked = (buyer) => {
        const value = `${buyer?.buyer_name} - ${buyer?.buyer_address}`
        setBuyerName(value)
        reset({ buyer_name: value })
        reset2({ buyer_name: value })
        // else if (mode === "address") {
        //     setBuyerName(buyer?.buyer_address)
        //     reset({ buyer_name: buyer?.buyer_address })
        // }

        setShowSearchBuyer(false)
        setBuyerId(buyer?.buyer_mobile)

    }

    const getSellingList = async () => {
        setLoading(true)
        const response = await getSellingInfoAPI(id)
        if (response?.status === 200) {
            if (response?.data?.length) {
                setInventoryData(response?.data);
                setLoading(false)
                setCommission(response?.data[0]?.commission)
            }
            else {
                router.push("/portal/inventory")
            }

        }
        else {
            setErrMsg(response?.message)
            setLoading(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    useEffect(() => {
        getSellingList()
        getBuyerList()
    }, [])

    const handleSell = (obj) => {
        setSellData(obj)
        setPrice(obj?.proposed_price)
        reset(obj)
        setIsOffCanvasOpen(true)
        setPriceType(obj?.unit)
        setPriceTypeCheck(obj?.unit)
        setMax(obj?.quantity_available);
    }

    const onEditInventory = async (data) => {
        if (!showWageInput) {
            data.wage = 0;
        }
        if (!showRentInput) {
            data.rent = 0;
        }

        setSpinAdd(true)
        // delete data?.farmer_name
        // delete data?.veg_name
        const payload = { ...data, mobile: buyerid, unit: priceTypeCheck, status: paid }
        const response = await editSellingInfoAPI(sellData?.product_id, payload)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                setIsOffCanvasOpen(false)
                setBuyerName("")
                setPaid(false)
                getSellingList()
                setShowRentInput(false)
                setShowWageInput(false)
                reset()
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    }

    const closeFun = () => {
        setIsOffCanvasOpen(false)
        setBuyerName("")
        setPaid(false)
        setShowSearchBuyer(false)
        setShowRentInput(false)
        setShowWageInput(false)
    }

    const changePrice = (e) => {
        const Type = e.target.value;

        if (Type === "kg") {
            setPriceTypeCheck("kg")

            if (priceType === "kg") {
                setPrice(sellData?.proposed_price);
                reset({ ...sellData, amount: sellData?.proposed_price });
            } else if (priceType === "total") {
                setPrice((sellData?.proposed_price) / sellData?.quantity_available);
                reset({ ...sellData, amount: (sellData?.proposed_price) / sellData?.quantity_available });
            }
        }

        if (Type === "total") {
            setPriceTypeCheck("total")

            if (priceType === "kg") {
                setPrice(sellData?.proposed_price * sellData?.quantity_available);
                reset({ ...sellData, amount: sellData?.proposed_price * sellData?.quantity_available });
            } else if (priceType === "total") {
                setPrice(sellData?.proposed_price);
                reset({ ...sellData, amount: sellData?.proposed_price });
            }
        }


    };

    const selectMultiple = () => {
        setMultiSell(true)
    }

    const handleSelectItem = (item) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter((i) => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };


    const changeMultiPrice = (e) => {
        const Type = e.target.value;
        setMultiPriceType(Type);
    };

    function preparePayload(input, products) {
        const { buyer_name, sold, unit, amount, paid, commission, wageCheck, rentCheck, wage, rent, mobile, status } = input;

        let remainingSold = parseFloat(sold);
        let totalSold = parseFloat(sold)
        const totalQuantity = products.reduce((sum, product) => sum + product.quantity_available, 0);

        if (remainingSold > totalQuantity) {
            throw new Error("Sold quantity exceeds available quantity.");
        }

        const payload = [];
        products.forEach((product, index) => {
            if (remainingSold <= 0) return; // Stop if sold is fully distributed.
            let totalWage = 0
            let totalRent = 0
            if (index === 0) {
                totalWage = wage
                totalRent = rent
            }
            const currentSold = Math.min(product.quantity_available, remainingSold);
            const productAmount =
                unit === "kg"
                    ? currentSold * parseFloat(amount) // Calculate based on per kg
                    : (currentSold / totalSold) * parseFloat(amount); // Recalculate for total

            payload.push({
                buyer_name,
                sold: currentSold.toString(),
                unit,
                amount: productAmount.toFixed(2), // Keep amount as a string with two decimals
                paid,
                commission,
                wageCheck,
                rentCheck,
                wage: totalWage,
                rent: totalRent,
                mobile,
                status,
                product_id: product.product_id
            });

            remainingSold -= currentSold; // Reduce the remaining sold value
        });

        return payload;
    }

    const handleMultiSell = async (data) => {
        setSpinAdd(true)
        if (!showWageInputMulti) {
            data.wage = 0;
        }
        if (!showRentInputMulti) {
            data.rent = 0;
        }
        const payload = { ...data, mobile: buyerid, unit: multiPriceType, status: multiPaid }

        const final = preparePayload(payload, selectedItems)
console.log(final);

        const response = await editProductInventoryAPI(final)
        if (response?.status === 200) {
            setSuccessMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setSuccessMsg(null)
                getSellingList()
                setBuyerName('')
                setBuyerId(null)
                setIsOffCanvasOpenMulti(false);
                setSelectedItems([]);
                setMultiSell(false)
                setTotalMultiWeight(0);
                setMaxMultiWeight(0)
                setMultiPrice('');
                setMultiPaid(false)
                setShowRentInputMulti(false)
                setShowWageInputMulti(false)
                setMultiPriceType("kg")
                reset2();
            }, 2000)
        }
        else {
            setErrMsg(response?.message)
            setSpinAdd(false)
            setTimeout(() => {
                setErrMsg(null)
            }, 2000)
        }
    };


    const handleCancelMultiSell = () => {
        setSelectedItems([]);
        setTotalMultiWeight(0);
        setMaxMultiWeight(0)
        setMultiPrice('');
        setMultiPaid(false);
        setMultiSell(false);
        setBuyerName('')
        setBuyerId(null)
        closeMultiSellOffCanvas()
        setShowRentInputMulti(false)
        setShowWageInputMulti(false)
        setMultiPriceType("kg")
        reset2()

    };

    const openMultiSellOffCanvas = () => {
        setIsOffCanvasOpenMulti(true);

        let totalCalculatedWeight = 0
        selectedItems.forEach((item) => {
            totalCalculatedWeight += item.quantity_available;
        });

        setTotalMultiWeight(totalCalculatedWeight);
        setMaxMultiWeight(totalCalculatedWeight)
    };


    const closeMultiSellOffCanvas = () => {
        setIsOffCanvasOpenMulti(false);
        // Reset form on close
        setSelectedItems([]);
        setBuyerName('')
        setBuyerId(null)
        setTotalMultiWeight(0);
        setMaxMultiWeight(0)
        setMultiPrice('');
        setMultiPaid(false)
        setShowRentInputMulti(false)
        setShowWageInputMulti(false)
        setMultiPriceType("kg")
        reset2();

    };
    return (
        <>
            <div className='app-container'>
                {user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.accounts || user?.access?.sales)) ?
                    <>
                        {loading ? <Loader /> :
                            <>
                                <div className='head pt-2 d-flex align-items-center justify-content-between'>
                                    <button className='submit-btn py-2 requirement-btn px-2' onClick={() => router.push("/portal/inventory")}>{translations[app_language]?.back}</button>
                                    <h2 className='primary-color text-center flex-grow-1 m-0'>
                                        {decodeURIComponent(params.product[0])}
                                    </h2>
                                </div>

                                {(user?.user_role === "marketer" || (user?.user_role === "assistant" && (user?.access?.sales || user?.access?.accounts))) && (noBuyer) ?
                                    <>
                                        <h4 className='mt-5 text-center text-danger'>No Buyer found.Please <Link href="/portal/buyers" className='text-success text-decoration-underline'>ADD BUYER</Link> to sell inventory</h4>
                                    </>
                                    :
                                    <>
                                        {!multiSell &&
                                            <div className='d-flex justify-content-end mt-4'>
                                               {sub_status ?  <button className='submit-btn py-2 px-2 ms-2' onClick={selectMultiple}>{translations[app_language]?.multiSell}</button>
                                               : ""}
                                            </div>
                                            }
                                        {multiSell && (
                                            <div className="d-flex justify-content-end mt-4">
                                                <button className="submit-btn py-2 px-2 ms-2" onClick={openMultiSellOffCanvas} disabled={selectedItems?.length < 2}>{translations[app_language]?.sellSelected}</button>
                                                <button className="submit-btn py-2 px-2 ms-2" onClick={handleCancelMultiSell}>{translations[app_language]?.cancel}</button>
                                            </div>
                                        )}


                                        {inventoryData?.length > 0 ? (
                                            <div className="row">
                                                {inventoryData?.map((v, i) => {
                                                    const path = v.image.split('\\');
                                                    const ImageURL = `http://localhost:3000/api/images/${path[path.length - 1]}`;

                                                    return (
                                                        <div key={i} className="col-dash">
                                                            <div className="produce-card">
                                                                <div className="image-container">
                                                                    <img src={ImageURL} alt="vegetable image" className="produce-image" />
                                                                </div>
                                                                <div className="card-content">
                                                                    <div className="farmer-info">
                                                                        <span className="farmer-label">{translations[app_language]?.farmer}</span>
                                                                        <h2 className="farmer-name">{v?.farmer_name}</h2>
                                                                    </div>
                                                                    <div className="produce-details">
                                                                        <div className="quantity">
                                                                            <span className="detail-label">{translations[app_language]?.weight}</span>
                                                                            <span className="detail-value">{v.quantity_available} kg</span>
                                                                        </div>
                                                                        <div className="price">
                                                                            <span className="detail-label">{translations[app_language]?.price}</span>
                                                                            <span className="detail-value">{v.proposed_price}{v?.unit === "kg" ? "/kg" : ""}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Show Select/Deselect or Sell Now based on multi-sell mode */}
                                                                    {multiSell ? (
                                                                        <button
                                                                            className={`action-button ${selectedItems.includes(v) ? 'deselect-button' : 'select-button'}`}
                                                                            onClick={() => handleSelectItem(v)}
                                                                            disabled={!sub_status}
                                                                        >
                                                                            {selectedItems.includes(v) ? translations[app_language]?.deselect : translations[app_language]?.select}
                                                                        </button>
                                                                    ) : (
                                                                        <button className="action-button" 
                                                                        disabled={!sub_status}
                                                                        onClick={() => handleSell(v)}>{translations[app_language]?.sellProduct}</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <>
                                                <div className='text-center fs-2 fw-bold text-danger mt-5'>{translations[app_language]?.noRecords}</div>
                                                <div className='text-center'>
                                                    <button onClick={() => router.push("/portal/inventory")} className='submit-btn py-2 mt-4'>Add Inventory</button>
                                                </div>
                                            </>
                                        )}


                                    </>}
                                <div className={`offcanvas offcanvas-end ${isOffCanvasOpen ? "show" : ""}`} tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
                                    <div className="offcanvas-header">
                                        <h5 id="offcanvasRightLabel">{translations[app_language]?.sellProduct}</h5>
                                        <button type="button" className="btn-close text-reset" onClick={closeFun}></button>
                                    </div>
                                    <div className="offcanvas-body">
                                        <div className="row canva">
                                            <div className="col-12 card-section">
                                                <div className="login-sign-form-section">
                                                    <form className="login-sign-form " onSubmit={handleSubmit(onEditInventory)}>
                                                        {/* <div className="form-group"> */}
                                                        {/* <div className="label-time">
                                                                            <label>Product<sup className="super">*</sup></label>
                                                                        </div> */}
                                                        <input type="hidden" name="veg_name" className="form-control"
                                                            {...register("veg_name",)}
                                                            value={sellData?.veg_name}
                                                            disabled
                                                        />
                                                        {/* <p className="err-dev">{errors?.veg_name?.message}</p> */}
                                                        {/* </div> */}

                                                        {/* <div className="form-group"> */}
                                                        {/* <div className="label-time">
                                                                                <label>
                                                                                    Farmer<sup className="super">*</sup>
                                                                                </label>
                                                                            </div> */}
                                                        <input
                                                            type="hidden"

                                                            name="farmer_name"
                                                            className="form-control"
                                                            {...register("farmer_name", {
                                                            })}
                                                            value={sellData?.farmer_name}
                                                            disabled
                                                        />
                                                        {/* <p className="err-dev">{errors?.farmer_name?.message}</p>
                                                                    </div> */}


                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.weight}({translations[app_language]?.kg})<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                name="sold"
                                                                className="form-control"
                                                                {...register("sold", {
                                                                    required: "Please enter the Weight",
                                                                    validate: (value) => {
                                                                        if (value === "") {
                                                                            return "Please enter the Weight"; // Ensure required message is consistent
                                                                        }
                                                                        const numericValue = parseFloat(value);
                                                                        if (isNaN(numericValue)) {
                                                                            return "Please enter a valid number";
                                                                        }
                                                                        if (numericValue > max) {
                                                                            return `Quantity cannot exceed ${max} kg`;
                                                                        }
                                                                        return true;
                                                                    },
                                                                    onChange: (e) => {
                                                                        const value = e.target.value;
                                                                        setSellData((prevData) => ({
                                                                            ...prevData,
                                                                            quantity_available: value,
                                                                        }));
                                                                    },
                                                                })}
                                                                value={sellData?.quantity_available}
                                                            />
                                                            <p className="err-dev">{errors?.sold?.message}</p>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.buyer}<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                name="buyer_name"
                                                                className="form-control input-search"
                                                                {...register("buyer_name", {
                                                                    required: "Please enter the Buyer name",
                                                                })}
                                                                onChange={filterBuyer}
                                                                onFocus={showAll}
                                                                value={buyername}
                                                                autoComplete="off"
                                                            />
                                                            <p className="err-dev">{errors?.buyer_name?.message}</p>
                                                            {showSearchBuyer &&
                                                                <div className='search-result'>
                                                                    {mapBuyer?.length > 0 ?
                                                                        <ul className='p-2'>
                                                                            {mapBuyer?.map((v, i) => {
                                                                                return (
                                                                                    <>
                                                                                        <li key={i} className='search-list' onClick={() => buyerListClicked(v)}>{v?.buyer_name} - {v?.buyer_address}</li>
                                                                                        {/* <li className='search-list' onClick={() => buyerListClicked(v, "address")}>{v?.buyer_address}</li> */}
                                                                                    </>
                                                                                )
                                                                            })}
                                                                        </ul> :
                                                                        <div className='pt-2 text-center'>No results found</div>}

                                                                </div>}
                                                        </div>

                                                        <div className="form-group">
                                                            <label className='mb-2 primary-color'>{translations[app_language]?.priceType}</label>
                                                            <div>
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name="unit"
                                                                        value="kg"
                                                                        {...register("unit")}
                                                                        onChange={changePrice}
                                                                        checked={priceTypeCheck === "kg"}
                                                                    />
                                                                    &nbsp; {translations[app_language]?.perKg}
                                                                </label>
                                                                <label style={{ marginLeft: "15px" }}>
                                                                    <input
                                                                        type="radio"
                                                                        name="unit"
                                                                        {...register("unit")}
                                                                        value="total"
                                                                        onChange={changePrice}
                                                                        checked={priceTypeCheck === "total"}
                                                                    />
                                                                    &nbsp; {translations[app_language]?.total}
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.sellingPrice}(INR)<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                name="amount"
                                                                className="form-control"
                                                                {...register("amount", {
                                                                    required: "Please enter the Selling price",
                                                                    onChange: (e) => setPrice(e.target.value),
                                                                    onBlur: () => setPrice(parseFloat(price).toFixed(2)), // Format to 2 decimal places on blur
                                                                })}
                                                                value={price}
                                                            />
                                                            <p className="err-dev">{errors?.amount?.message}</p>
                                                        </div>

                                                        <div className="form-group">
                                                            <label htmlFor='paid'>
                                                                <input
                                                                    type="checkbox"
                                                                    name="paid"
                                                                    id='paid'
                                                                    value={paid}
                                                                    checked={paid}
                                                                    {...register("paid")}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setPaid(true)
                                                                        }
                                                                        else {
                                                                            setPaid(false)
                                                                        }
                                                                    }}

                                                                />
                                                                &nbsp; {translations[app_language]?.paid}
                                                            </label>

                                                        </div>

                                                        <div className="form-group">
                                                            <div className="label-time">
                                                                <label>
                                                                    {translations[app_language]?.commission}(%)<sup className="super">*</sup>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                onWheel={(e) => e.target.blur()}
                                                                name="commission"
                                                                className="form-control"
                                                                {...register("commission", {
                                                                    required: "Please enter the commission rate (%)",

                                                                    pattern: {
                                                                        value: /^\d*\.?\d*$/, // Allows decimals, but optional
                                                                        message: 'Commission rate must be a valid number',
                                                                    },
                                                                    min: {
                                                                        value: 0,
                                                                        message: 'Commission rate must be at least 0',
                                                                    },
                                                                    max: {
                                                                        value: 100,
                                                                        message: 'Commission rate must not exceed 100',
                                                                    },
                                                                })}

                                                            />
                                                            <p className="err-dev">{errors?.commission?.message}</p>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    name="wageCheck"
                                                                    {...register("wageCheck")}
                                                                    onChange={() => setShowWageInput(!showWageInput)}
                                                                />
                                                                &nbsp;  {translations[app_language]?.wage}
                                                            </label>
                                                            {showWageInput && (
                                                                <input
                                                                    type="number"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    name="wage"
                                                                    placeholder={translations[app_language]?.wage}
                                                                    className="form-control mt-2"
                                                                    {...register("wage", {
                                                                        required: showWageInput ? "Please enter the wage amount" : false,
                                                                        pattern: {
                                                                            value: /^\d*\.?\d*$/,
                                                                            message: "Wage must be a valid number",
                                                                        },
                                                                    })}

                                                                />
                                                            )}
                                                            <p className="err-dev">{errors?.wage?.message}</p>
                                                        </div>

                                                        {/* Rent Checkbox */}
                                                        <div className="form-group">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    name="rentCheck"
                                                                    {...register("rentCheck")}
                                                                    onChange={() => setShowRentInput(!showRentInput)}
                                                                />
                                                                &nbsp; {translations[app_language]?.rent}
                                                            </label>
                                                            {showRentInput && (
                                                                <input
                                                                    type="number"
                                                                    onWheel={(e) => e.target.blur()}
                                                                    name="rent"
                                                                    className="form-control mt-2"
                                                                    {...register("rent", {
                                                                        required: showRentInput ? "Please enter the rent amount" : false,
                                                                        pattern: {
                                                                            value: /^\d*\.?\d*$/,
                                                                            message: "Rent must be a valid number",
                                                                        },
                                                                    })}
                                                                    placeholder={translations[app_language]?.rent}
                                                                />
                                                            )}
                                                            <p className="err-dev">{errors?.rent?.message}</p>
                                                        </div>



                                                        <div className="d-flex justify-content-center mt-4">
                                                            <button
                                                                type="submit"
                                                                className="start_btn px-2"
                                                            > {spinAdd ? <Spinner /> : translations[app_language]?.sellProduct}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </>}

                        <div className={`offcanvas offcanvas-end ${isOffCanvasOpenMulti ? "show" : ""}`} id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
                            <div className="offcanvas-header">
                                <h5 id="offcanvasRightLabel">{translations[app_language]?.multiSell}</h5>
                                <button type="button" className="btn-close text-reset" onClick={closeMultiSellOffCanvas}></button>
                            </div>

                            <div className="offcanvas-body">
                                <form onSubmit={handleSubmit2(handleMultiSell)}>

                                    <div className='form-group'>
                                        <div className='label-time'>
                                            <label>{translations[app_language]?.totalWeight} <sup className="super">*</sup></label>
                                        </div>
                                        <input
                                            className='form-control'
                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            {...register2('sold', { required: "Please enter the weight" })}
                                            value={totalMultiWeight}
                                            onChange={(e) => {
                                                const newWeight = parseFloat(e.target.value);
                                                if (newWeight > maxMultiWeight) {
                                                    setTotalMultiWeight(maxMultiWeight);
                                                }
                                                else {
                                                    setTotalMultiWeight(newWeight);
                                                }
                                            }}
                                        />
                                        <p className="err-dev">{errors2?.sold?.message}</p>
                                    </div>

                                    {/* Buyer Name */}
                                    <div className='form-group'>
                                        <div className='label-time'>
                                            <label>{translations[app_language]?.buyer}<sup className="super">*</sup></label>
                                        </div>
                                        <input
                                            className='form-control input-search'
                                            type="text"
                                            onChange={filterBuyer}
                                            onFocus={showAll}
                                            autoComplete='off'
                                            value={buyername}
                                            {...register2('buyer_name', { required: "Please choose buyer" })}
                                        />
                                        <p className="err-dev">{errors2?.buyer_name?.message}</p>
                                        {showSearchBuyer &&
                                            <div className='search-result'>
                                                {mapBuyer?.length > 0 ?
                                                    <ul className='p-2'>
                                                        {mapBuyer?.map((v, i) => {
                                                            return (
                                                                <>
                                                                    <li key={i} className='search-list' onClick={() => buyerListClicked(v)}>{v?.buyer_name} - {v?.buyer_address}</li>
                                                                    {/* <li className='search-list' onClick={() => buyerListClicked(v, "address")}>{v?.buyer_address}</li> */}
                                                                </>
                                                            )
                                                        })}
                                                    </ul> :
                                                    <div className='pt-2 text-center'>No results found</div>}

                                            </div>}
                                    </div>


                                    <div className="form-group">
                                        <label className='mb-2 primary-color'>{translations[app_language]?.priceType} <sup className="super">*</sup></label>
                                        <div>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="unit"
                                                    value="kg"
                                                    {...register2("unit")}
                                                    onChange={changeMultiPrice}
                                                    checked={multiPriceType === "kg"}
                                                />
                                                &nbsp; {translations[app_language]?.perKg}
                                            </label>
                                            <label style={{ marginLeft: "15px" }}>
                                                <input
                                                    type="radio"
                                                    name="unit"
                                                    value="total"
                                                    onChange={changeMultiPrice}
                                                    checked={multiPriceType === "total"}
                                                />
                                                &nbsp; {translations[app_language]?.total}
                                            </label>
                                        </div>
                                    </div>

                                    <div className='form-group'>
                                        <div className='label-time'>
                                            <label>{translations[app_language]?.sellingPrice} <sup className="super">*</sup></label>
                                        </div>
                                        <input
                                            className='form-control'
                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            {...register2('amount', { required: "Please enter the selling price" })}
                                            value={multiPrice}
                                            onChange={(e) => setMultiPrice(parseFloat(e.target.value))}
                                        />
                                        <p className="err-dev">{errors2?.amount?.message}</p>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor='paidMulti'>
                                            <input
                                                type="checkbox"
                                                name="paidMulti"
                                                id='paidMulti'
                                                value={multiPaid}
                                                checked={multiPaid}
                                                {...register2("paid")}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setMultiPaid(true)
                                                    }
                                                    else {
                                                        setMultiPaid(false)
                                                    }
                                                }}

                                            />
                                            &nbsp; {translations[app_language]?.paid}
                                        </label>

                                    </div>

                                    <div className="form-group">
                                        <div className="label-time">
                                            <label>
                                                {translations[app_language]?.commission} (%)<sup className="super">*</sup>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            name="commission"
                                            className="form-control"
                                            {...register2("commission", {
                                                required: "Please enter the commission rate (%)",

                                                pattern: {
                                                    value: /^\d*\.?\d*$/, // Allows decimals, but optional
                                                    message: 'Commission rate must be a valid number',
                                                },
                                                min: {
                                                    value: 0,
                                                    message: 'Commission rate must be at least 0',
                                                },
                                                max: {
                                                    value: 100,
                                                    message: 'Commission rate must not exceed 100',
                                                },
                                                onChange: (e) => setCommission(e.target.value)
                                            })}
                                            value={commission}
                                        />
                                        <p className="err-dev">{errors2?.commission?.message}</p>

                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="wageCheck"
                                                {...register2("wageCheck")}
                                                checked={showWageInputMulti}
                                                onChange={(e) => setShowWageInputMulti(e.target.checked)}
                                            />
                                            &nbsp; {translations[app_language]?.wage}
                                        </label>
                                        {showWageInputMulti && (
                                            <input
                                                type="number"
                                                onWheel={(e) => e.target.blur()}
                                                name="wage"
                                                placeholder="Enter wage amount"
                                                className="form-control mt-2"
                                                {...register2("wage", {
                                                    required: showWageInputMulti ? "Please enter the wage amount" : false,
                                                    pattern: {
                                                        value: /^\d*\.?\d*$/,
                                                        message: "Wage must be a valid number",
                                                    },
                                                })}
                                            />

                                        )}
                                        <p className="err-dev">{errors2?.wage?.message}</p>
                                    </div>

                                    {/* Rent Checkbox */}
                                    <div className="form-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="rentCheck"
                                                {...register2("rentCheck")}
                                                checked={showRentInputMulti}
                                                onChange={(e) => setShowRentInputMulti(e.target.checked)}
                                            />
                                            &nbsp; {translations[app_language]?.rent}
                                        </label>
                                        {showRentInputMulti && (
                                            <input
                                                type="number"
                                                onWheel={(e) => e.target.blur()}
                                                name="rent"
                                                className="form-control mt-2"
                                                {...register2("rent", {
                                                    required: showRentInputMulti ? "Please enter the rent amount" : false,
                                                    pattern: {
                                                        value: /^\d*\.?\d*$/,
                                                        message: "Rent must be a valid number",
                                                    },
                                                })}
                                                placeholder="Enter rent amount"
                                            />
                                        )}
                                        <p className="err-dev">{errors2?.rent?.message}</p>
                                    </div>
                                    <div className="d-flex justify-content-center mt-4">
                                        <button type="submit" className="submit-btn py-2">{spinAdd ? <Spinner /> : translations[app_language]?.sellProduct}</button>
                                    </div>
                                </form>
                            </div>
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
                    </>
                    :
                    <>
                        {user ?
                            <AccessDenied /> : <Loader />}
                    </>
                }
            </div>

        </>
    )
}

export default Product