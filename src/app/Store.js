"use client"
import { configureStore } from "@reduxjs/toolkit";
import Slice from "./features/Slice";
import translationSlice from "./features/translationSlice"
 const store=configureStore({
    reducer:{
        user:Slice,
        language:translationSlice
    }
})

export default store