import toast from "react-hot-toast"

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: "#10B981",
        color: "#fff",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10B981",
      },
    })
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: "#EF4444",
        color: "#fff",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#EF4444",
      },
    })
  },
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#3B82F6",
        color: "#fff",
      },
    })
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  },
}

