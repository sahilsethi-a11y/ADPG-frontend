"use client";

import { useState } from "react";
import UaeDealerForm from "@/components/admin/UaeDealerForm";
import ChinaDealerForm from "@/components/admin/ChinaDealerForm";
import Thankyou from "@/components/admin/Thankyou";

export type ThankyouData = {
    active: boolean;
    emailId: string;
    locationAttribute: {
        countryCode: string;
        country: string;
        emirate?: string;
        city?: string;
        district?: string;
    };
    rolemetadata: {
        address: string;
        companyLicenseUrl: string;
        dealershipName: string;
        dob: string;
        emiratesIdUrl: string;
        exportLicenseUrl: string;
    };
    mobileno: string;
    name: string;
    roleId: string;
    userId: string;
    password: string;
};

export default function AddDealerForm({ onClose }: Readonly<{ onClose: () => void }>) {
    const [dealerType, setDealerType] = useState<"UAE" | "China">("UAE");
    const [thankyouData, setThankyouData] = useState<ThankyouData | null>();

    return (
        <div className="space-y-6 md:p-4">
            <div className="bg-white rounded-lg">
                <div className="max-h-[80vh] overflow-auto p-2">
                    {thankyouData ? (
                        <Thankyou
                            onClose={() => {
                                onClose();
                                setThankyouData(null);
                            }}
                            user={thankyouData}
                        />
                    ) : (
                        <div>
                            <h2 className="text-lg font-medium mb-4">Add New Dealer</h2>
                            <p className="text-sm text-gray-500 mb-6">Fill in the dealer&apos;s information below. A temporary password will be generated for their first login.</p>
                            <div className="mb-3">
                                <div className="block text-sm font-medium text-gray-700 mb-2">
                                    Dealer Type <span className="text-red-500">*</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setDealerType("UAE")}
                                        className={`p-4 text-left border-2 rounded-lg ${dealerType === "UAE" ? "border-brand-blue bg-indigo-50" : "border-gray-200"}`}>
                                        <div className="font-medium">UAE Dealer</div>
                                        <div className="text-sm text-gray-500">United Arab Emirates dealers</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDealerType("China")}
                                        className={`p-4 text-left border-2 rounded-lg ${dealerType === "China" ? "border-brand-blue bg-indigo-50" : "border-gray-200"}`}>
                                        <div className="font-medium">Chinese Dealer</div>
                                        <div className="text-sm text-gray-500">China-based dealers</div>
                                    </button>
                                </div>
                            </div>
                            {dealerType === "UAE" && <UaeDealerForm onClose={onClose} successCallback={(d) => setThankyouData(d)} />}
                            {dealerType === "China" && <ChinaDealerForm onClose={onClose} successCallback={(d) => setThankyouData(d)} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
