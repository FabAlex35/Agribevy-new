import React from 'react'

const DashboardCard = ({ title, value, symbol, change }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <span className="text-xl font-bold">{symbol}</span>
            </div>
            <p className="text-2xl font-bold mb-1">{value}</p>
            {/* {change&&
            <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
            </p>
} */}
        </div>
    )
}

export default DashboardCard