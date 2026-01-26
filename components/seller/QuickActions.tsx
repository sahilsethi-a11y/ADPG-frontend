"use client";
import Link from "next/link";
import { AddIcon, BankCardIcon, EditIcon, MessageSquareIcon } from "@/components/Icons";
import { JSX, useState } from "react";
import Modal from "@/elements/Modal";
import BankUpdateOtp from "@/components/bank-details/BankUpdateOtp";
import SelectVehicleAdd from "@/components/SelectVehicleAdd";

type Menu = {
    type: string;
    action?: () => void;
    label: string;
    active?: boolean;
    icon: JSX.Element;
    href?: string;
};

export default function QuickActions({ variant = "horizontal" }: Readonly<{ variant?: "horizontal" | "vertical" }>) {
    const [isBankUpdate, setIsBankUpdate] = useState(false);
    const [isAddVehicle, setIsAddVehicle] = useState(false);
    const actionMenu: Menu[] = [
        { type: "button", action: () => setIsAddVehicle(true), label: "Add New Vehicle", active: true, icon: <AddIcon className="w-4 h-4" /> },
        {
            type: "link",
            href: "/seller/inventory",
            label: "My Listings",
            icon: <EditIcon className="w-4 h-4" />,
        },
        { type: "button", action: () => setIsBankUpdate(true), label: "Update Bank Details", icon: <BankCardIcon className="w-4 h-4" /> },
        {
            type: "link",
            href: "/my-negotiations",
            label: "Manage Negotiations",
            icon: <MessageSquareIcon className="w-4 h-4" />,
        },
    ];
    const getClassName = (i: Menu) => {
        const base = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors";
        if (i.active) return base + " bg-brand-blue text-white hover:bg-primary-hover";
        return base + " text-gray-700 hover:bg-gray-50 border border-gray-300";
    };
    return (
        <div>
            <div className={`gap-3 flex flex-wrap ${variant === "vertical" ? "flex-col" : ""}`}>
                {actionMenu.map((i) =>
                    i.type === "button" ? (
                        <button key={i.label} type="button" onClick={i.action} className={getClassName(i)}>
                            {i.icon}
                            {i.label}
                        </button>
                    ) : (
                        <Link key={i.label} href={i.href!} className={getClassName(i)}>
                            {i.icon}
                            {i.label}
                        </Link>
                    )
                )}
            </div>
            <Modal isOpen={isBankUpdate} onClose={() => setIsBankUpdate(false)}>
                <BankUpdateOtp onClose={() => setIsBankUpdate(false)} />
            </Modal>
            <Modal isOpen={isAddVehicle} onClose={() => setIsAddVehicle(false)}>
                <SelectVehicleAdd onClose={() => setIsAddVehicle(false)} />
            </Modal>
        </div>
    );
}
