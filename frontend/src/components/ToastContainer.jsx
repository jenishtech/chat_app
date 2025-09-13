import React from 'react';
import { ToastContainer as ReactToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast notification functions
export const showToast = {
  // Success toast
  success: (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options
    });
  },

  // Error toast
  error: (message, options = {}) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options
    });
  },

  // Warning toast
  warning: (message, options = {}) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options
    });
  },

  // Info toast
  info: (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options
    });
  },

  // Mention notification toast
  mention: (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: "🔔",
      ...options
    });
  }
};

// Toast Container Component
const ToastContainer = () => {
  return (
    <ReactToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastStyle={{
        fontSize: '14px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    />
  );
};

export default ToastContainer; 