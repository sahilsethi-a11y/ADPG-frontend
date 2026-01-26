"use client";

import { ArrowDownIcon } from "@/components/Icons";

type PropsT = {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    isLast: boolean;
};

export default function InnerAccordion({
    question,
    answer,
    isOpen,
    onClick,
    isLast,
}: Readonly<PropsT>) {
    return (
        <div className="px-6">
            <div className={`border-gray-200 ${isLast ? "" : "border-b"}`}>
                <button
                    onClick={onClick}
                    className="w-full py-2 hover:underline flex items-center justify-between text-left group"
                >
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-brand-blue transition-colors">
                        {question}
                    </h3>
                    <ArrowDownIcon
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                >
                    <div className="overflow-hidden">
                        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
                            {answer}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
