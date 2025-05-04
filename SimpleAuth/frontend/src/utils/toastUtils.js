import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Standard toast configuration
const toastConfig = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Success notification with check emoji
export const showSuccessToast = (message) => {
  toast.success(`✅ ${message}`, toastConfig);
};

// Error notification with X emoji
export const showErrorToast = (message) => {
  toast.error(`❌ ${message}`, toastConfig);
};

// Info notification with info emoji
export const showInfoToast = (message) => {
  toast.info(`ℹ️ ${message}`, toastConfig);
};

// Warning notification with warning emoji
export const showWarningToast = (message) => {
  toast.warning(`⚠️ ${message}`, toastConfig);
};

// Handle API error responses consistently
export const handleApiError = (error) => {
  const errorMessage = error.response?.data?.message || "İşlem sırasında bir hata oluştu.";
  showErrorToast(errorMessage);
};