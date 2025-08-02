import { toast } from 'react-toastify';

let activeToasts = new Set();

export const showToast = (message, type = 'error') => {
  if (activeToasts.has(message)) return; 

  const id = toast[type](message, {
    onClose: () => activeToasts.delete(message),
  });

  activeToasts.add(message);
  return id;
};

export const showSuccess = (message) => showToast(message, 'success');
export const showError = (message) => showToast(message, 'error');
export const showInfo = (message) => showToast(message, 'info');
