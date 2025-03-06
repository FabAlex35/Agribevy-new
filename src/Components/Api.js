import axios from "axios";
import apiClient from "@/src/app/lib/axiosInstance";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// subscription check 
export const subsCkeck = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/subscriptions`);      
        return res?.data;
    } catch (err) {
        console.log(err);
        
        return err?.response?.data;
    }
}

// subscription update 
export const subsUpdate = async () => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/subscriptions`);      
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const loginUserAPI = async (payload) => {
    try {
        const res = await axios.post(`${baseUrl}/api/auth/login`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const logoutUserAPI = async () => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/auth/logout`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const registerUserAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/user`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addFarmerAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/farmer`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getFarmerAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/farmer`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addBuyerAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/buyer`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getBuyerAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/buyer`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const searchFarmerAPI = async (mobile) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/user/${mobile}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addProductAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/products`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getInventoryAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/inventory`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getUserAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/user`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const editUserAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/user`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const changePasswordAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/changePassword`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addCommodityAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/list`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getCommodityAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/list`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getSellingInfoAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/products/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const editSellingInfoAPI = async (id, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/products/${id}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const dashboardAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/dashboard`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addAssistantsAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/assistants`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getAllAssistantsAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/assistants`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const editAssistantInfoAPI = async (id, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/assistants/${id}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const deleteAssistantAPI = async (id) => {
    try {
        const res = await apiClient.delete(`${baseUrl}/api/assistants/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getMyTransactionsAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/transactions`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addSettingsAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/default_setting`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getMySettingsAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/default_setting`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getFarmerDetailsAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/farmer/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getBuyerDetailsAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/buyer/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const paymentUpdateAPI = async (userType, phone, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/transactions?user=${userType}&phone=${phone}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const addExpensesAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/balanceSheet`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getSheetOptionsAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/balanceSheet`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const updateSettingsAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/default_setting`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getFarmerSalesAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/farmerdetails`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getFarmerSummaryDetailsAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/farmerdetails/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getBuyerPurchasesAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/buyerdetails`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addMarketerAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/marketer`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getMarketerAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/marketer`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getMarketerDetailsAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/marketer/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getBalanceSheetDetailsAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/balanceSheet/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getFarmerWithoutInvoiceAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/generateInvoice`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getSpecificFarmerWithoutInvoiceAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/generateInvoice/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const generateInvoiceDetails = async(payload) =>{
    try {
        const res = await apiClient.get(`${baseUrl}/api/transactions/details`, {
            params: {
                data: payload
              }
        });
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

// marketer may change farmer product details =============

export const updateTransactionByMarketer = async (data) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/transactions/details`, data);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const generateInvoiceAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/invoice`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const getAllInvoicesAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/invoice`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getSingleInvoiceAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/invoice/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getAllExpensesAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/records`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const updateExpensesAPI = async (id, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/balanceSheet/${id}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getSingleExpenseAPI = async (id, end) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/records/${id}/${end}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const getFarmerDetailsFilterAPI = async (id, start, end) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/farmer/${id}/${start}/${end}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const getBuyerDetailsFilterAPI = async (id, start, end) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/buyer/${id}/${start}/${end}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getAllFarmerInvoiceAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/farmer/invoice`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getSingleFarmerInvoiceAPI = async (id) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/farmer/invoice/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getImageAPI = async (image) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/images/${image}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const updateBuyerAPI = async (mobile, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/buyer/${mobile}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const deleteBuyerAPI = async (mobile) => {
    try {
        const res = await apiClient.delete(`${baseUrl}/api/buyer/${mobile}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const updateFarmerAPI = async (mobile, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/farmer/${mobile}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const deleteFarmerAPI = async (mobile) => {
    try {
        const res = await apiClient.delete(`${baseUrl}/api/farmer/${mobile}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const updateProductAPI = async (id, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/list/${id}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const deleteProductAPI = async (id) => {
    try {
        const res = await apiClient.delete(`${baseUrl}/api/list/${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const updateInvoiceAPI = async (id, payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/invoice/${id}`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const updateSingleTransactionAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/transactions/single`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const updateMultipleTransactionAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/transactions/multiple`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getAllVegetablesAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/admin/vegetables`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const getSalesReportAPI = async (payload) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/salesreport?date=${payload}`,);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const updateSalesColumnAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/default_setting/salesreport`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getSalesColumnAPI = async (payload) => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/default_setting/salesreport`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addSackAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/sack`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const getSackAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/sack`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const editSackAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/sack`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const deleteSackAPI = async (id) => {
    try {
        const res = await apiClient.delete(`${baseUrl}/api/sack?sack_id=${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const addWageAPI = async (payload) => {
    try {
        const res = await apiClient.post(`${baseUrl}/api/wage`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const getWageAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/wage`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const editWageAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/wage`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const deleteWageAPI = async (id) => {
    try {
        const res = await apiClient.delete(`${baseUrl}/api/wage?wage_id=${id}`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}


export const editProductInventoryAPI = async (payload) => {
    try {
        const res = await apiClient.put(`${baseUrl}/api/products`, payload);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

export const getAllBuyerTransactionsAPI = async () => {
    try {
        const res = await apiClient.get(`${baseUrl}/api/buyertransactions`);
        return res?.data;
    } catch (err) {
        return err?.response?.data;
    }
}

