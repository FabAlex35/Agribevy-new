import React from 'react';
import { RxCrossCircled } from 'react-icons/rx';
import { IoClose } from 'react-icons/io5';

const ModalBoxError = ({ errMsg, onClose }) => {
    return (
        <>
            {errMsg !== null && (
                <div className="error-modal-backdrop">
                    <div className="error-modal-box">
                        <div className="error-modal-header">
                            <h5>Error</h5>
                            <button className="error-close-btn" onClick={onClose}>
                                <IoClose size={26} />
                            </button>
                        </div>
                        <div className="error-modal-body">
                            <span className="error-msg-modal">{errMsg}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ModalBoxError;
