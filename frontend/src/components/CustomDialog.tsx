import React, { useEffect, useRef } from "react";

type ActionButton = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

type CustomDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: ActionButton[];
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

const buttonVariantClasses: Record<string, string> = {
  primary: "bg-gray-400 text-gray-800 hover:bg-gray-500",
  secondary: "bg-gray-400 text-gray-800 hover:bg-gray-500",
  danger: "bg-gray-400 text-gray-800 hover:bg-gray-500",
};

const CustomDialog: React.FC<CustomDialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions = [],
  size = "md",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Focus trap for accessibility
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`bg-gray-300 w-full ${sizeClasses[size]} p-4 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 font-sans relative m-4 rounded-sm`}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-800 hover:bg-gray-400 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-lg font-bold text-gray-800 mb-3">{title}</h2>
        )}

        {/* Content */}
        <div className="mb-4 text-gray-800 text-sm">{children}</div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex justify-end gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-3 py-1 text-sm font-medium border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 ${buttonVariantClasses[action.variant || "secondary"]
                  } ${action.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDialog;