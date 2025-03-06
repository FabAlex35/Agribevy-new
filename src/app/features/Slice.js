"use client"
import { createSlice } from "@reduxjs/toolkit";

const Slice=createSlice({
    name:"myslice",
    initialState:{
        nameChanged:false,
        userDetails:null,
        language:null,
        languageChanged:false,
        app_language:"english",
        applanguageChanged:false,
        subscription: null,
        data: {},
        bill: {}
    },
    reducers:{
        changeName:(state,action)=>{
            state.nameChanged=action.payload
        },
        getUserDetailsSlice:(state,action)=>{
            state.userDetails=action.payload
        },
        getUserLanguageSlice:(state,action)=>{
            state.language=action.payload
        },
        changeLanguage:(state,action)=>{
            state.languageChanged=action.payload
        },
        getAppLanguageSlice:(state,action)=>{
            state.app_language=action.payload
        },
        changeAppLanguage:(state,action)=>{
            state.applanguageChanged=action.payload
        },
        getSubscription:(state,action)=>{
            state.subscription = action.payload
        },
        getSubscriptionData:(state,action)=>{
            state.data = action.payload
        },
        getBillMode:(state,action)=>{
            state.bill = action.payload
        },
    }
})

export const {changeName,getUserDetailsSlice,getUserLanguageSlice,changeLanguage,getAppLanguageSlice,changeAppLanguage,getSubscription,getSubscriptionData,getBillMode}= Slice.actions
export default Slice.reducer