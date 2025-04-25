// @ts-nocheck
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-gray-300",
        success:
          "bg-green-50 text-green-700 border-green-200 [&>svg]:text-green-600",
        error: "bg-red-50 text-red-700 border-red-200 [&>svg]:text-red-600",
        warning:
          "bg-yellow-50 text-yellow-700 border-yellow-200 [&>svg]:text-yellow-600",
        info: "bg-blue-50 text-blue-700 border-blue-200 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  autoDismiss?: number; // Time in milliseconds to auto-dismiss
  onDismiss?: () => void; // Callback when dismissed
  details?: any; // Backend error details (string or object)
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      autoDismiss,
      onDismiss,
      details,
      children,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (autoDismiss) {
        const timer = setTimeout(() => {
          onDismiss?.();
        }, autoDismiss);
        return () => clearTimeout(timer);
      }
    }, [autoDismiss, onDismiss]);

    const Icon = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
      default: null,
    }[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        aria-live="polite"
        {...props}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <div>
          {children}
          {details && (
            <AlertDescription className="mt-2">
              {typeof details === "string" ? (
                <p>{details}</p>
              ) : typeof details === "object" ? (
                <ul className="list-disc pl-5">
                  {Object.entries(details).map(([key, value]) => (
                    <li key={key}>{`${key}: ${value}`}</li>
                  ))}
                </ul>
              ) : null}
            </AlertDescription>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
