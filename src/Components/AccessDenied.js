import Link from 'next/link'
import React from 'react'

const AccessDenied = () => {
    return (
        <div className='access-background'>
            <div className="no-container">
                <div className="content">
                    <h1>403 - Access Denied</h1>
                    <p>Oops! You don&apos;t have permission to view this page.</p>
                    <p>Please contact the administrator for queries.</p>
                    <Link href="/portal/dashboard" className="back-home">Back to Dashboard</Link>
                </div>
            </div>
        </div>
    )
}

export default AccessDenied