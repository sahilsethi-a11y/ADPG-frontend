"use client";
import { useEffect } from "react";

export const useOutsideClick = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!ref.current) return;
            e.stopPropagation();
            if (!ref.current.contains(e.target as Node)) handler();
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [ref, handler]);
}
