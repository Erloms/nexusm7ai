
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

export interface Toast extends ToastProps {
  id: string;
}

export const toast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
  action,
}: ToastProps) => {
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
  return {
    toast,
    toasts: [] as Toast[],
  };
};
