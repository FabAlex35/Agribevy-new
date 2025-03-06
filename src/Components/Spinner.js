import React from 'react'

const Spinner = () => {
  return (
    <div>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span className="visually-hidden">Loading...</span>
    </div>
  )
}

export default Spinner