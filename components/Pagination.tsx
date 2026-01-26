"use client";

import React, { useMemo, useState, useId } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";

type Props = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    pageSizeOptions?: number[];
    onPageSizeChange?: (size: number) => void;
    showQuickJump?: boolean;
    siblingCount?: number; // how many pages to show on each side of current
    className?: string;
    // Optional summary data — when present, the pagination will render the
    // PagingSummary component to the left of the controls.
    totalItems?: number;
    currentCount?: number;
};

const range = (start: number, end: number) => {
    const res = [];
    for (let i = start; i <= end; i++) res.push(i);
    return res;
};

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    pageSizeOptions,
    onPageSizeChange,
    showQuickJump = false,
    siblingCount = 1,
    className = "",
    totalItems,
    currentCount,
}: Readonly<Props>) {
    const [jumpValue, setJumpValue] = useState<string>("");
    const reactId = useId();
    const selectId = `pagination-page-size-${reactId}`;

    const pagination = useMemo(() => {
        const total = Math.max(1, Math.floor(totalPages));
        const current = Math.min(Math.max(1, Math.floor(currentPage)), total);

        const totalPageNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses

        if (total <= totalPageNumbers) {
            return range(1, total);
        }

        const leftSiblingIndex = Math.max(current - siblingCount, 1);
        const rightSiblingIndex = Math.min(current + siblingCount, total);

        const showLeftEllipsis = leftSiblingIndex > 2;
        const showRightEllipsis = rightSiblingIndex < total - 1;

        const pages: (number | string)[] = [];
        pages.push(1);

        if (showLeftEllipsis) pages.push("LEFT_ELLIPSIS");

        const start = showLeftEllipsis ? leftSiblingIndex : 2;
        const end = showRightEllipsis ? rightSiblingIndex : total - 1;

        for (let i = start; i <= end; i++) pages.push(i);

        if (showRightEllipsis) pages.push("RIGHT_ELLIPSIS");

        pages.push(total);
        return pages;
    }, [currentPage, totalPages, siblingCount]);

    const goto = (p: number) => {
        const page = Math.min(Math.max(1, Math.floor(p)), Math.max(1, Math.floor(totalPages)));
        if (page !== currentPage) onPageChange(page);
    };

    const onPrev = () => goto(currentPage - 1);
    const onNext = () => goto(currentPage + 1);

    const handleJump = () => {
        const n = Number(jumpValue);
        if (!Number.isFinite(n)) return;
        goto(n);
        setJumpValue("");
    };

    // If there is effectively only one page and no summary data provided,
    // don't render the pagination controls. If summary data is present we
    // still render so callers can show "Showing X-Y of Z items" even when
    // there's a single page.
    if (totalPages <= 1 && totalItems === undefined) return null;

    return (
        <div className={`flex items-center gap-3 text-sm flex-wrap ${className}`}>
            {totalItems !== undefined && (
                <div className="mr-auto">
                    <PagingSummary currentPage={currentPage} pageSize={pageSize ?? 0} totalItems={totalItems} currentCount={currentCount} />
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    aria-label="Previous page"
                    onClick={onPrev}
                    disabled={currentPage <= 1}
                    className={`px-2 h-8 inline-flex items-center justify-center rounded border ${
                        currentPage <= 1 ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed" : "text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}>
                    <ArrowLeftIcon className="h-4 w-4" />
                </button>

                <nav aria-label="Pagination" className="flex items-center gap-1">
                    {pagination.map((p) =>
                        typeof p === "number" ? (
                            <button
                                key={`p-${p}`}
                                onClick={() => goto(p)}
                                aria-current={p === currentPage ? "page" : undefined}
                                className={`min-w-9 h-8 px-2 rounded flex items-center justify-center ${
                                    p === currentPage ? "bg-brand-blue text-white" : "text-gray-700 hover:bg-gray-100 border border-transparent"
                                }`}>
                                {p}
                            </button>
                        ) : (
                            <span key={`sep-${p}`} className="px-2 text-gray-400">
                                …
                            </span>
                        )
                    )}
                </nav>

                <button
                    aria-label="Next page"
                    onClick={onNext}
                    disabled={currentPage >= totalPages}
                    className={`px-2 h-8 inline-flex items-center justify-center rounded border ${
                        currentPage >= totalPages ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed" : "text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}>
                    <ArrowRightIcon className="h-4 w-4" />
                </button>
            </div>

            {pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange && (
                <div className="flex items-center gap-2 ml-2">
                    <label htmlFor={selectId} className="text-xs text-gray-600">
                        Per page
                    </label>
                    <select id={selectId} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="h-8 px-2 rounded border border-gray-200 bg-white text-sm">
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {showQuickJump && (
                <div className="flex items-center gap-2 ml-2">
                    <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={jumpValue}
                        onChange={(e) => setJumpValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleJump();
                        }}
                        placeholder="Page"
                        className="w-20 h-8 px-2 rounded border border-gray-200 text-sm"
                    />
                    <button onClick={handleJump} className="h-8 px-3 rounded border border-gray-200 bg-white text-sm hover:bg-gray-100">
                        Go
                    </button>
                </div>
            )}
        </div>
    );
}

export function PagingSummary({
    currentPage,
    pageSize,
    totalItems,
    currentCount,
}: Readonly<{
    currentPage: number;
    pageSize: number;
    totalItems: number;
    currentCount?: number;
}>) {
    const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    let end: number;
    if (totalItems === 0) {
        end = 0;
    } else if (typeof currentCount === "number") {
        end = Math.min(totalItems, start + currentCount - 1);
    } else {
        end = Math.min(totalItems, currentPage * pageSize);
    }

    return (
        <div className="text-sm text-muted-foreground">
            {totalItems === 0 ? (
                <>Showing 0 of 0 items</>
            ) : (
                <>
                    Showing {start}-{end} of {totalItems} items
                </>
            )}
        </div>
    );
}
