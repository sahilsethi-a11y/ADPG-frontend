"use client";
import { useState, useRef, useEffect, JSX } from "react";
import { ArrowDownIcon, CheckIcon } from "@/components/Icons";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export type Option<T = string> = {
    value: T;
    label: string;
    extra?: unknown;
};

export type CustomSelectProps<T> = {
    options?: Option<T>[];
    value?: T | null;
    onChange: (value: T, extra: unknown) => void;
    label?: string | JSX.Element | boolean;
    placeholder?: string;
    disabled?: boolean;
    border?: string;
    cls?: string;
    labelCls?: string;
    noDataMessage?: string;
    errors?: string[];
    required?: boolean;
    name?: string;
    searchable?: boolean;
};

export default function CustomSelect<T = string>({
    options = [],
    value,
    onChange,
    label,
    placeholder = "Select an option",
    disabled = false,
    border = "border border-transparent",
    cls = "",
    labelCls = "text-sm/4.5 text-black",
    noDataMessage = "No data available",
    errors,
    required = false,
    name,
    searchable = true,
}: Readonly<CustomSelectProps<T>>) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const searchRef = useRef<HTMLInputElement | null>(null);
    const selectRef = useRef<HTMLDivElement | null>(null);
    const [openUpward, setOpenUpward] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    useOutsideClick(selectRef, () => setIsOpen(false));

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable ? options.filter((opt) => opt.label?.toLowerCase()?.includes(search.toLowerCase())) : options;

    useEffect(() => {
        if (isOpen && searchable) {
            setTimeout(() => searchRef.current?.focus(), 0);
        }
    }, [isOpen, searchable]);

    return (
        <div className={`relative ${cls}`} ref={selectRef}>
            {label && (
                <label className={`${labelCls} block mb-2`}>
                    {label} {required && <span className="text-destructive">*</span>}
                </label>
            )}

            <button
                type="button"
                name={name}
                ref={triggerRef}
                className={`w-full flex items-center justify-between rounded-md ${border} ${errors?.length ? "border border-destructive" : ""} px-3 py-2 text-left text-sm ${
                    selectedOption ? "text-gray-900" : "text-muted-foreground"
                }`}
                onClick={() =>
                    setIsOpen((prev) => {
                        const next = !prev;
                        if (next && triggerRef.current) {
                            const rect = triggerRef.current.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const dropdownHeight = 300; // matches max-h-72.5 (~288px)

                            setOpenUpward(spaceBelow < dropdownHeight);
                        }

                        return next;
                    })
                }
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}>
                <span className="block truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ArrowDownIcon className="h-4 w-4 transition-transform" />
            </button>

            {isOpen && (
                <div
                    className={`absolute z-40 w-full rounded-md border border-stroke-light shadow-md bg-white 
            ${openUpward ? "bottom-10 mb-1" : "mt-1"}`}>
                    {searchable && (
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full border-b border-stroke-light px-2 py-1.5 text-sm outline-none"
                        />
                    )}

                    <ul className="max-h-72.5 overflow-y-auto p-1">
                        {filteredOptions.map((option) => (
                            <li
                                key={String(option.label)}
                                className={`relative cursor-pointer rounded-sm py-1.5 pr-8 pl-2 text-sm hover:bg-accent ${value === option.value ? "bg-accent" : ""}`}
                                onClick={() => {
                                    onChange(option.value, option.extra);
                                    setIsOpen(false);
                                    setSearch("");
                                }}
                                role="option"
                                tabIndex={0}>
                                {value === option.value && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <CheckIcon className="h-4 w-4 text-gray-400" />
                                    </span>
                                )}
                                <span className="block truncate">{option.label}</span>
                            </li>
                        ))}

                        {!filteredOptions.length && <li className="p-2 text-sm text-gray-500">{noDataMessage}</li>}
                    </ul>
                </div>
            )}

            {errors?.map((err) => (
                <p key={err} className="text-destructive text-xs mt-1">
                    {err}
                </p>
            ))}
        </div>
    );
}
