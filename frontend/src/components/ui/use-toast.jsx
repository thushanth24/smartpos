import React, { createContext, useContext, useReducer } from 'react';

const ToastContext = createContext();

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.toast, id: Math.random().toString(36).substr(2, 9) }],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
    default:
      return state;
  }
};

export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const addToast = (toast) => {
    dispatch({ type: 'ADD_TOAST', toast });
    
    if (toast.duration) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id: toast.id });
      }, toast.duration);
    }
    
    return toast.id;
  };

  const removeToast = (id) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  };

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function toast(toast) {
  const { addToast } = useContext(ToastContext);
  return addToast(toast);
}
