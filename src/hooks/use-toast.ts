
import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
}

export const toast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
  action,
}: ToastProps) => {
  // Convert variant to sonner style
  const type = 
    variant === "destructive" ? "error" :
    variant === "success" ? "success" : 
    variant === "warning" ? "warning" :
    variant === "info" ? "info" : "default";

  return sonnerToast[type](title, {
    description,
    duration,
    action,
  });
};

export const useToast = () => {
  return {
    toast,
  };
};
