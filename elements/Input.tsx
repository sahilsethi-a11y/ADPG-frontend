"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface BaseProps {
    label?: string | ReactNode;
    errors?: string[];
    className?: string;
    parentClassName?: string;
    required?: boolean;
}

interface InputFieldProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
    type?: Exclude<InputHTMLAttributes<HTMLInputElement>["type"], "textarea">;
}

interface TextAreaFieldProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
    type: "textarea";
}

type InputProps = InputFieldProps | TextAreaFieldProps;

export default function Input(props: Readonly<InputProps>) {
    const { type, label, required, errors, className, parentClassName = "", ...rest } = props;

    const isTextarea = type === "textarea";

    return (
        <label className={`block ${parentClassName}`}>
            {label && (
                <span className="mb-2 block text-sm font-medium">
                    {label} {required && <span className="text-destructive">*</span>}
                </span>
            )}

            {isTextarea ? (
                <textarea
                    className={cn(
                        `w-full px-3 py-2 rounded-md outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-2 bg-input-background placeholder:text--muted-foreground border border-transparent text-sm text-gray-900`,
                        errors?.length && "border-destructive",
                        className
                    )}
                    {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            ) : (
                <input
                    className={cn(
                        `w-full px-3 py-2 rounded-md outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-2 bg-input-background placeholder:text--muted-foreground border border-transparent text-sm text-gray-900`,
                        errors?.length && "border-destructive",
                        className
                    )}
                    type={type}
                    {...(rest as InputHTMLAttributes<HTMLInputElement>)}
                />
            )}

            {errors?.map((err: string) => (
                <span key={err} className="text-xs text-destructive mt-1 block">
                    {err}
                </span>
            ))}
        </label>
    );
}
