"use client";

import { Spinner } from "@/components/Icons";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    className?: string;
}

export default function Button({ children, variant = "primary", size = "md", loading = false, fullWidth = false, leftIcon, rightIcon, disabled, className, ...props }: Readonly<ButtonProps>) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all",
                "focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none disabled:cursor-not-allowed disabled:opacity-50",

                // FULL WIDTH
                fullWidth && "w-full",

                // VARIANTS
                variant === "primary" && "bg-brand-blue text-white hover:bg-brand-blue/90",
                variant === "secondary" && "bg-gray-200 text-gray-800 hover:bg-gray-300",
                variant === "outline" && "border border-brand-blue text-gray-800 hover:bg-brand-blue hover:text-white",
                variant === "ghost" && "text-brand-blue border border-stroke-light hover:bg-gray-100",
                variant === "danger" && "bg-destructive text-white hover:bg-destructive/80",

                // SIZES
                size === "sm" && "h-8 px-3 text-xs",
                size === "md" && "h-9 px-4 text-sm",
                size === "lg" && "h-11 px-6 text-base",

                // MERGE CUSTOM CLASSES LAST
                className
            )}
            {...props}>
            {loading && <Spinner className={cn("h-5 w-5", size === "sm" && "h-4 w-4", size === "lg" && "h-6 w-6")} />}

            {!loading && leftIcon && <span className="flex items-center">{leftIcon}</span>}

            {children}

            {!loading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </button>
    );
}
