import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import { generateInvoiceAPI, updateTransactionByMarketer } from './Api';
import { FaCircleCheck } from 'react-icons/fa6';
import { RxCrossCircled } from 'react-icons/rx';
import { IoClose } from 'react-icons/io5';

function Billmodify({ data, appLanguage, translations, hideTransactionId, setShowAlert, getFarmerDetails, mobile, setBillData, billMode }) {
    const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm();
    const [successMsg, setSuccessMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState(null)

    // Populate form with data
    useEffect(() => {
        if (data && Array.isArray(data)) {
            data.forEach((item, index) => {
                setValue(`quantity[${index}]`, item.quantity);
                setValue(`price[${index}]`, item.price);
                setValue(`farmer_rent[${index}]`, item.farmer_rent);
                setValue(`farmer_wage[${index}]`, item.farmer_wage);
                setValue(`sack_price[${index}]`, item.sack_price);
                setValue(`transaction_id[${index}]`, item.transaction_id);
                setValue(`magamai_src[${index}]`, item.magamai_src);
                setValue(`magamai_type[${index}]`, item.magamai_type);
                setValue(`commission[${index}]`, item.commission);
                setValue(`magamai[${index}]`, item.magamai);
            });
        }
    }, [data, setValue]);

    // Transform data before sending
    function transformData(fData) {
        const { quantity, price, farmer_rent, farmer_wage, sack_price, transaction_id, magamai_src, magamai_type, commission, magamai } = fData;

        return quantity.map((qty, index) => ({
            quantity: qty,
            sack_price: sack_price[index],
            price: price[index],
            farmer_rent: farmer_rent[index],
            farmer_wage: farmer_wage[index],
            transaction_id: transaction_id[index],
            magamai_src: magamai_src[index],
            magamai_type: magamai_type[index],
            magamai: magamai[index],
            commission: commission[index]
        }));
    }

    // Handle form submission
    const onSubmit = async (formData) => {
        setLoading(true);
        setErrMsg(null);

        const datas = transformData(formData);
        const isShow = billMode?.type == "farmer" ? 1 : billMode?.show
        const invoiceData = { id: formData.transaction_id, mobile, show: isShow };

        try {
            const invoiceRes = await generateInvoiceAPI(invoiceData);
            const response = await updateTransactionByMarketer(datas);
            if (response?.status === 200) {
                setSuccessMsg(response?.message);
                setTimeout(async () => {
                    setSuccessMsg(null);
                    setShowAlert(false);
                    setBillData([])
                    await getFarmerDetails();
                    reset();
                }, 2000);
            } else {
                setErrMsg('Something went wrong. Please try again.');
            }
        } catch (error) {
            setErrMsg('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div tabIndex={0} className='mt-4 bill_change_modal'>
            <table className="inventory_table_container">
                <thead className="inventory_table_header">
                    <tr>
                        <th colSpan={6} className='text-center m-auto'>Bill</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='modal_farmer_details'>
                        <td>
                            <div className="bill_modal_head">
                                <span> {translations[appLanguage]?.farmer} : {data[0]?.farmer_name} </span>
                            </div>
                        </td>
                        <td></td>
                    </tr>

                    {data?.map((row, index) => (
                        <React.Fragment key={index}>
                            <tr className="inventory_table_added_gap">
                                <td colSpan={6}></td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="bill_modal_head1">
                                        <span> {translations[appLanguage]?.vegetable} : {row.veg_name} </span>
                                    </div>
                                </td>
                            </tr>

                            <tr className="inventory_table_row">
                                <td>
                                    <div className="form-group">
                                        <label className='bill_modal_label'>Quantity</label>
                                        <Controller
                                            name={`quantity[${index}]`}
                                            control={control}
                                            defaultValue={row.quantity}
                                            rules={{
                                                required: 'Quantity is required',
                                                pattern: {
                                                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                                    message: 'Enter a valid number'
                                                }
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    className="form-control input-search"
                                                    autoComplete="off"
                                                />
                                            )}
                                        />
                                        {errors?.quantity?.[index] && <span className="error_sub">{errors?.quantity?.[index]?.message}</span>}
                                    </div>
                                </td>

                                <td>
                                    <div className="form-group">
                                        <label className='bill_modal_label'>Price per Kg</label>
                                        <Controller
                                            name={`price[${index}]`}
                                            control={control}
                                            defaultValue={row.price}
                                            rules={{
                                                required: 'Price is required',
                                                pattern: {
                                                    value: /^[0-9]+(\.[0-9]{1,2})?$/, // Allow only numbers with up to two decimals
                                                    message: 'Enter a valid number'
                                                }
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    className="form-control input-search"
                                                    autoComplete="off"
                                                />
                                            )}
                                        />
                                        {errors?.price?.[index] && <span className="error_sub">{errors?.price?.[index]?.message}</span>}
                                    </div>
                                </td>

                                <td>
                                    <div className="form-group">
                                        <label className='bill_modal_label'>Rent</label>
                                        <Controller
                                            name={`farmer_rent[${index}]`}
                                            control={control}
                                            defaultValue={row.farmer_rent}
                                            rules={{
                                                required: 'Rent is required',
                                                pattern: {
                                                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                                    message: 'Enter a valid number'
                                                }
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    className="form-control input-search"
                                                    autoComplete="off"
                                                />
                                            )}
                                        />
                                        {errors?.farmer_rent?.[index] && <span className="error_sub">{errors?.farmer_rent?.[index]?.message}</span>}
                                    </div>
                                </td>

                                <td>
                                    <div className="form-group">
                                        <label className='bill_modal_label'>Wage</label>
                                        <Controller
                                            name={`farmer_wage[${index}]`}
                                            control={control}
                                            defaultValue={row.farmer_wage}
                                            rules={{
                                                required: 'Wage is required',
                                                pattern: {
                                                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                                    message: 'Enter a valid number'
                                                }
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    className="form-control input-search"
                                                    autoComplete="off"
                                                />
                                            )}
                                        />
                                        {errors?.farmer_wage?.[index] && <span className="error_sub">{errors?.farmer_wage?.[index]?.message}</span>}
                                    </div>
                                </td>

                                <td>
                                    <div className="form-group">
                                        <label className='bill_modal_label'>Sack Price</label>
                                        <Controller
                                            name={`sack_price[${index}]`}
                                            control={control}
                                            defaultValue={row.sack_price}
                                            rules={{
                                                required: 'Sack price is required',
                                                pattern: {
                                                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                                    message: 'Enter a valid number'
                                                }
                                            }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    className="form-control input-search"
                                                    autoComplete="off"
                                                />
                                            )}
                                        />
                                        {errors?.sack_price?.[index] && <span className="error_sub">{errors?.sack_price?.[index]?.message}</span>}
                                    </div>
                                </td>
                            </tr>

                            <tr className="inventory_table_row">
                                <td>
                                    <div className="form-group">
                                        <div>
                                            <span>Total Amount : </span>
                                            <span>{row.amount}</span>
                                        </div>
                                        <div>
                                            <span>Amount : </span>
                                            <span>{row.farmer_amount}</span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className="form-group">
                                        {!hideTransactionId && <>
                                            <label className='bill_modal_label'>Id</label>
                                            <Controller
                                                name={`transaction_id[${index}]`}
                                                control={control}
                                                defaultValue={row.transaction_id}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        className="form-control input-search"
                                                        autoComplete="off"
                                                    />
                                                )}
                                            />
                                        </>}
                                    </div>
                                </td>
                                <td>
                                    <div className="form-group">
                                        {!hideTransactionId && <>
                                            <label className='bill_modal_label'>Id</label>
                                            <Controller
                                                name={`magamai_src[${index}]`}
                                                control={control}
                                                defaultValue={row.magamai_src}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        className="form-control input-search"
                                                        autoComplete="off"
                                                    />
                                                )}
                                            />
                                        </>}
                                    </div>
                                </td>
                                <td>
                                    <div className="form-group">
                                        {!hideTransactionId && <>
                                            <label className='bill_modal_label'>Id</label>
                                            <Controller
                                                name={`magamai_type[${index}]`}
                                                control={control}
                                                defaultValue={row.magamai_type}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        className="form-control input-search"
                                                        autoComplete="off"
                                                    />
                                                )}
                                            />
                                        </>}
                                    </div>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <div className='d-flex justify-content-center'>
                <button
                    className='submit-btn py-2'
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {translations[appLanguage]?.submit}
                </button>
            </div>
            <div>
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
        </div>
    );
}

export default Billmodify;
