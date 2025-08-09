
import { toast as sonnerToast } from "sonner";
import { useState, useEffect } from "react";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
}

// Define our toast interface
export interface Toast extends ToastProps {
  id: string;
}

// Create a proper toast implementation that uses Sonner
export const toast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
  action,
}: ToastProps) => {
  // Handle different variants properly
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      duration,
      action,
    });
  } else if (variant === "success") {
    return sonnerToast.success(title, {
      description,
      duration,
      action,
    });
  } else if (variant === "warning") {
    return sonnerToast.warning(title, {
      description,
      duration,
      action,
    });
  } else if (variant === "info") {
    return sonnerToast.info(title, {
      description,
      duration,
      action,
    });
  } else {
    return sonnerToast(title, {
      description,
      duration,
      action,
    });
  }
};

export const useToast = () => {
  // Since we're using sonner under the hood and it manages its own toast state,
  // we'll provide an empty array for compatibility
  return {
    toast,
    toasts: [] as Toast[],
  };
};
