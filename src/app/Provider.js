"use client"
import { Provider } from "react-redux";
import store from "./Store";
import React from 'react'

export const Providers = ({children}) => {
  return (
    <Provider store={store}>
        {children}
    </Provider>
    
  )
}
