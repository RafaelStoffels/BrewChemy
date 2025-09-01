// src/Components/LoadingButton.jsx
import { Spinner } from "@/Components/Spinner";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  danger:  "bg-red-600 text-white hover:bg-red-700",
  ghost:   "bg-transparent text-gray-800 hover:bg-gray-100",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-5 text-lg",
};

export function LoadingButton({
  children,
  loading = false,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
  spinnerSize = 16,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && <Spinner size={spinnerSize} light />}
      {children}
    </button>
  );
}
