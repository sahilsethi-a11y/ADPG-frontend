"use client";

import React, { useEffect, startTransition } from "react";
import { createPortal } from "react-dom";
import { CheckCircleIcon, CloseCircleIcon, CloseIcon } from "@/components/Icons";
import { createRoot } from "react-dom/client";

// -------------------------------------------------
//  message API
// -------------------------------------------------
// Usage:
// import message from "./toaster";
// message.success("Saved successfully");
// message.error("Upload failed");
// message.info({ title: "Hello", description: "World" });
// -------------------------------------------------

// ------------------ TYPES ------------------
export type MsgType = "success" | "error" | "info";

export type MsgOptions = {
    title?: string;
    description?: string;
    duration?: number | null; // ms, null = sticky
};

export type MsgPayload = MsgOptions & { type: MsgType };

export type InternalToast = MsgPayload & {
    id: string;
};

// ------------------ SINGLETON STATE ------------------
let listeners: ((toasts: InternalToast[]) => void)[] = [];
let toasts: InternalToast[] = [];

function emit() {
    for (const l of listeners) {
        l([...toasts]);
    }
}

function pushToast(payload: MsgPayload) {
    const id = Math.random().toString(36).slice(2, 9);
    const toast: InternalToast = {
        id,
        ...payload,
        duration: payload.duration ?? 3000,
    };
    toasts = [toast, ...toasts];
    emit();
    return id;
}

function removeToast(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
}

// ------------------ GLOBAL MESSAGE API ------------------
const message = {
    success(msg: string | MsgOptions) {
        if (typeof msg === "string") return pushToast({ type: "success", title: msg });
        return pushToast({ ...msg, type: "success" });
    },
    error(msg: string | MsgOptions) {
        if (typeof msg === "string") return pushToast({ type: "error", title: msg });
        return pushToast({ ...msg, type: "error" });
    },
    info(msg: string | MsgOptions) {
        if (typeof msg === "string") return pushToast({ type: "info", title: msg });
        return pushToast({ ...msg, type: "info" });
    },
};

export default message;

// ------------------ UI ROOT (AUTO‑MOUNTED PORTAL) ------------------
let mounted = false;
function mountPortal() {
    if (mounted) return;
    mounted = true;
    const div = document.createElement("div");
    div.id = "global-toast-root";
    document.body.appendChild(div);
    // React 19: startTransition from 'react'
    startTransition(() => {
        // use createRoot in React 19
        const root = createRoot(div);
        root.render(<ToastRoot />);
    });
}

if (typeof document !== "undefined") {
    // auto mount as soon as file is imported in client side
    setTimeout(() => mountPortal(), 0);
}

// ------------------ TOAST ROOT COMPONENT ------------------
function ToastRoot() {
    const [state, setState] = React.useState<InternalToast[]>(toasts);

    useEffect(() => {
        const listener = (list: InternalToast[]) => setState(list);
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    }, []);

    return createPortal(
        <div aria-live="polite" className="fixed inset-0 pointer-events-none z-70 flex items-end px-4 py-6 sm:items-start sm:justify-end">
            <div className="w-full flex flex-col gap-3 sm:items-end">
                {state.map((t) => (
                    <ToastItem key={t.id} toast={t} />
                ))}
            </div>
        </div>,
        document.body
    );
}

// ------------------ INDIVIDUAL TOAST ------------------
function ToastItem({ toast }: Readonly<{ toast: InternalToast }>) {
    const { id, title, description, type, duration } = toast;

    useEffect(() => {
        if (duration === null) return;
        const timeout = setTimeout(() => removeToast(id), duration);
        return () => clearTimeout(timeout);
    }, [duration, id]);

    const classes = {
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-sky-50 border-sky-200 text-sky-800",
    };

    let icon = <CheckCircleIcon className="w-5 h-5" />;
    if (type === "error") icon = <CloseCircleIcon className="w-5 h-5 text-destructive" />;

    return (
        <div className={`pointer-events-auto transition-all duration-300 ease-out animate-toast-enter max-w-sm w-full rounded-2xl border p-3 shadow-lg ${classes[type]}`}>
            <div className="flex gap-3 items-center">
                <div className="shrink-0 flex items-start">
                    <div className="rounded-md p-1.5 bg-white/60">{icon}</div>
                </div>

                <div className="min-w-0 flex-1">
                    {title && <div className="font-semibold text-sm">{title}</div>}
                    {description && <div className="mt-1 text-xs opacity-90">{description}</div>}
                </div>

                <button aria-label="dismiss" onClick={() => removeToast(id)} className="mt-1 ml-2 rounded p-1 hover:bg-black/5">
                    <CloseIcon className="w-4 h-4 opacity-80" />
                </button>
            </div>
        </div>
    );
}
