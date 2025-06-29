import { useCallback, useState } from "react";

interface AlertState {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  details?: any;
  autoDismiss?: number;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const mapErrorMessage = useCallback((error: string) => {
    switch (error) {
      case "Unauthorized":
        return "Invalid credentials. Please try again.";
      case "Not Found":
        return "No account found with this email. Please register.";
      case "Validation Error":
        return "Please check your input and try again.";
      case "Rate Limit Exceeded":
        return "Too many attempts. Please try again later.";
      case "Forbidden":
        return "You do not have permission to perform this action.";
      case "Database Error":
        return "A server error occurred. Please try again later.";
      case "Internal Server Error":
        return "An unexpected error occurred. Please try again.";
      default:
        return error || "An unexpected error occurred. Please try again.";
    }
  }, []);

  const setSuccess = useCallback(
    (message: string, options?: { details?: any; autoDismiss?: number }) => {
      setAlert({
        variant: "success",
        title: "Success",
        message,
        details: options?.details,
        autoDismiss: options?.autoDismiss,
      });
    },
    []
  );

  const setError = useCallback(
    (
      message: string,
      options?: {
        details?: any;
        autoDismiss?: number;
        isBackendError?: boolean;
      }
    ) => {
      setAlert({
        variant: "error",
        title: "Error",
        message: options?.isBackendError ? mapErrorMessage(message) : message,
        details: options?.details,
        autoDismiss: options?.autoDismiss,
      });
    },
    [mapErrorMessage]
  );

  const setWarning = useCallback(
    (message: string, options?: { details?: any; autoDismiss?: number }) => {
      setAlert({
        variant: "warning",
        title: "Warning",
        message,
        details: options?.details,
        autoDismiss: options?.autoDismiss,
      });
    },
    []
  );

  const setInfo = useCallback(
    (message: string, options?: { details?: any; autoDismiss?: number }) => {
      setAlert({
        variant: "info",
        title: "Info",
        message,
        details: options?.details,
        autoDismiss: options?.autoDismiss,
      });
    },
    []
  );

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return {
    alert,
    setSuccess,
    setError,
    setWarning,
    setInfo,
    clearAlert,
  };
};
