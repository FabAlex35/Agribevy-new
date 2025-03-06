import React from 'react'

const TabButton = ({ active, onClick, children }) => {
    return (
        <button
            className={`px-4 py-2 font-medium mt-2 mt-md-0 ${active
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'} rounded-lg mr-2`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export default TabButton