"use client";
import { useCallback, useEffect, useState } from "react";
import { AlertCircleIcon, BuildingIcon, CheckCircleIcon, EyeIcon, EyeOffIcon, SaveIcon } from "@/components/Icons";
import Select from "@/elements/Select";
import type { Option } from "@/elements/Select";
import { api } from "@/lib/api/client-request";

const data = {
    bankName: [
        { label: "First Abu Dhabi Bank", value: "First Abu Dhabi Bank" },
        { label: "Abu Dhabi Commercial Bank", value: "Abu Dhabi Commercial Bank" },
        { label: "Emirates NBD", value: "Emirates NBD" },
        { label: "Dubai Islamic Bank", value: "Dubai Islamic Bank" },
        { label: "Abu Dhabi Islamic Bank", value: "Abu Dhabi Islamic Bank" },
        { label: "Mashreq Bank", value: "Mashreq Bank" },
        { label: "RAKbank (National Bank of Ras Al-Khaimah)", value: "RAKbank" },
        { label: "Bank of Sharjah", value: "Bank of Sharjah" },
        { label: "Commercial Bank International", value: "Commercial Bank International" },
        { label: "Al Hilal Bank", value: "Al Hilal Bank" },
    ],

    state: {
        united_arab_emirates: [
            { label: "Abu Dhabi", value: "abu_dhabi" },
            { label: "Dubai", value: "dubai" },
            { label: "Sharjah", value: "sharjah" },
            { label: "Ajman", value: "ajman" },
            { label: "Ras Al Khaimah", value: "ras_al_khaimah" },
        ],
        united_states: [
            { label: "Alabama", value: "alabama" },
            { label: "Alaska", value: "alaska" },
            { label: "Arizona", value: "arizona" },
            { label: "Arkansas", value: "arkansas" },
            { label: "California", value: "california" },
        ],
        united_kingdom: [
            { label: "England", value: "england" },
            { label: "Scotland", value: "scotland" },
            { label: "Wales", value: "wales" },
            { label: "Northern Ireland", value: "northern_ireland" },
        ],
    },
};

type BankDetails = {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    accountType: string;
    currency: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    state: string;
};
const initialBankDetails: BankDetails = {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    accountType: "",
    currency: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    state: "",
};

const intialErrors: Partial<BankDetails> = {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    accountType: "",
    currency: "",
    address: "",
    city: "",
};

type ApiResponseType = {
    userId: string;
    bankInformation: {
        accountNumber: string;
        accountHolderName: string;
        bankName: string;
        accountType: string;
        currency: string;
    };
    bankAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
};

export default function BankDetailsForm() {
    const [bankDetails, setbankDetails] = useState(initialBankDetails);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(intialErrors);
    const [successMsg, setSuccessMsg] = useState("");
    const [faildMsg, setFaildMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [filterData, setFilterData] = useState<Record<string, unknown> | null>();

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await api.get<{ data: ApiResponseType }>(`/users/api/v1/users/bank-details`);
                const data = res.data;
                if (data) {
                    setbankDetails({
                        accountHolderName: data.bankInformation.accountHolderName,
                        bankName: data.bankInformation.bankName,
                        accountNumber: data.bankInformation.accountNumber,
                        accountType: data.bankInformation.accountType,
                        currency: data.bankInformation.currency,
                        address: data.bankAddress.street,
                        city: data.bankAddress.city,
                        country: data.bankAddress.country,
                        postalCode: data.bankAddress.postalCode,
                        state: data.bankAddress.state,
                    });
                }
            } catch (err) {
                console.log(err, "error");
            }
        };

        Promise.all([getData(), getFiterOptions()]);
    }, []);

    const getFiterOptions = useCallback(async (countryCode?: string) => {
        try {
            const res = await api.get<{ data: Record<string, unknown> | null }>("/masters/api/filters/map", { params: { countryCode } });
            setFilterData(res.data);
        } catch (error) {
            console.log("API ERROR :", error);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setError((prev) => ({ ...prev, [name]: "" }));
        setbankDetails((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        let isValid = true;
        if (bankDetails.accountHolderName.trim().length < 2) {
            setError((prev) => ({ ...prev, accountHolderName: "Account holder name must be at least 2 characters" }));
            isValid = false;
        }
        if (bankDetails.bankName.trim() === "") {
            setError((prev) => ({ ...prev, bankName: "This field is required" }));
            isValid = false;
        }
        if (bankDetails.accountNumber.trim().length < 10) {
            setError((prev) => ({ ...prev, accountNumber: "Account number must be 10-20 digits" }));
            isValid = false;
        }
        if (bankDetails.accountType.trim() === "") {
            setError((prev) => ({ ...prev, accountType: "This field is required" }));
            isValid = false;
        }
        if (bankDetails.currency.trim() === "") {
            setError((prev) => ({ ...prev, currency: "This field is required" }));
            isValid = false;
        }
        if (bankDetails.address.trim() === "") {
            setError((prev) => ({ ...prev, address: "Street address is required" }));
            isValid = false;
        }
        if (bankDetails.city.trim() === "") {
            setError((prev) => ({ ...prev, city: "City is required" }));
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isFormValid = validateForm();
        if (!isFormValid) return;
        try {
            setSubmitting(true);
            const formData = {
                bankInformation: {
                    accountNumber: bankDetails.accountNumber || "",
                    accountHolderName: bankDetails.accountHolderName || "",
                    bankName: bankDetails.bankName || "",
                    accountType: bankDetails.accountType || "",
                    currency: bankDetails.currency || "",
                },
                bankAddress: {
                    street: bankDetails.address || "",
                    city: bankDetails.city || "",
                    state: bankDetails.state || "",
                    country: bankDetails.country || "",
                    postalCode: bankDetails.postalCode || "",
                },
            };
            await api.post("/users/api/v1/users/bank-details", { body: formData });
            setSuccessMsg("Bank details saved successfully!");
        } catch (error) {
            setFaildMsg("Something went wrong!");
            console.log(error);
        } finally {
            setSubmitting(false);
            setTimeout(() => {
                setSuccessMsg("");
                setFaildMsg("");
            }, 3000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light">
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6">
                        <h4 className="leading-none text-brand-blue flex items-center">
                            <BuildingIcon className="h-5 w-5 mr-2" />
                            Bank Information
                        </h4>
                    </div>
                    <div className="px-6 last:pb-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="accountHolderName" className="block text-sm font-medium text-black">
                                Account Holder Name{" "}
                                <span className="text-black" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <input
                                id="accountHolderName"
                                name="accountHolderName"
                                value={bankDetails.accountHolderName}
                                onChange={(e) => {
                                    handleInputChange(e);
                                }}
                                placeholder="Enter full name as on bank account"
                                className="w-full px-3 py-1 h-9 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                                required
                            />
                            {error.accountHolderName && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    {error.accountHolderName}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Select
                                options={data.bankName}
                                value={bankDetails.bankName}
                                onChange={(value) => {
                                    setbankDetails((prev) => ({ ...prev, bankName: value }));
                                    setError((prev) => ({ ...prev, bankName: "" }));
                                }}
                                label={
                                    <div className="text-sm font-medium mb-2">
                                        Bank Name {""}
                                        <span className="text-black">*</span>
                                    </div>
                                }
                                placeholder="Select your bank"
                                labelCls="text-base/5.25 text-brand-blue"
                                border="bg-accent/40"
                            />
                            {error.bankName && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    {error.bankName}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="accountNumber" className="flex items-center gap-2 text-sm leading-none font-medium">
                                Account Number {""}
                                <span className="text-black" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="accountNumber"
                                    name="accountNumber"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                    }}
                                    placeholder="Enter account number"
                                    className="w-full px-3 py-1 h-9 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                                </button>
                            </div>
                            {error.accountNumber && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    {error.accountNumber}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Select
                                options={filterData?.accountType as Option[]}
                                value={bankDetails.accountType}
                                onChange={(value) => {
                                    setbankDetails((prev) => ({ ...prev, accountType: value }));
                                    setError((prev) => ({ ...prev, accountType: "" }));
                                }}
                                label={
                                    <div className="text-sm font-medium mb-2">
                                        Account Type {""}
                                        <span className="text-black">*</span>
                                    </div>
                                }
                                placeholder="Select type"
                                labelCls="text-base/5.25 text-brand-blue"
                                border="bg-accent/40"
                            />
                            {error.accountType && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    {error.accountType}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Select
                                options={filterData?.accountCurrency as Option[]}
                                value={bankDetails.currency}
                                onChange={(value) => {
                                    setbankDetails((prev) => ({ ...prev, currency: value }));
                                    setError((prev) => ({ ...prev, currency: "" }));
                                }}
                                label={
                                    <div className="text-sm font-medium mb-2">
                                        Account Currency {""}
                                        <span className="text-black">*</span>
                                    </div>
                                }
                                placeholder="Select type"
                                labelCls="text-base/5.25 text-brand-blue"
                                border="bg-accent/40"
                            />
                            {error.currency && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    {error.currency}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light">
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6">
                        <h4 className="leading-none text-brand-blue">Bank Information</h4>
                    </div>
                    <div className="px-6 last:pb-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="address" className="block text-sm font-medium text-black">
                                Street Address{" "}
                                <span className="text-black" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={bankDetails.address}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setError((prev) => ({ ...prev, address: "" }));
                                }}
                                required
                                rows={3}
                                placeholder="Enter bank street address"
                                className="bg-accent/40 text-sm min-h-16 w-full rounded-md px-3 py-2 placeholder:text-muted-foreground resize-none border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px]"
                            />
                            {error.address && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    {error.address}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Select
                                    options={(filterData?.country as Option[])?.map((c) => ({ label: c.label, value: c.value }))}
                                    value={bankDetails.country}
                                    onChange={(value) => {
                                        setbankDetails((prev) => ({ ...prev, country: value }));
                                        setError((prev) => ({ ...prev, country: "" }));
                                    }}
                                    label={<div className="text-sm font-medium mb-2">Country</div>}
                                    placeholder="Select country"
                                    labelCls="text-base/5.25 text-brand-blue"
                                    border="bg-accent/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <Select
                                    options={data.state.united_arab_emirates}
                                    value={bankDetails.state}
                                    onChange={(value) => {
                                        setbankDetails((prev) => ({ ...prev, state: value }));
                                        setError((prev) => ({ ...prev, state: "" }));
                                    }}
                                    label={<div className="text-sm font-medium mb-2">State/Emirate</div>}
                                    placeholder="Select emirate"
                                    labelCls="text-base/5.25 text-brand-blue"
                                    border="bg-accent/40"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="postalCode" className="block text-sm font-medium text-black">
                                    Postal Code
                                </label>
                                <input
                                    id="postalCode"
                                    name="postalCode"
                                    value={bankDetails.postalCode}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                    }}
                                    placeholder="Postal Code"
                                    className="w-full px-3 py-1 h-9 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-medium text-black">
                                    City{" "}
                                    <span className="text-black" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    value={bankDetails.city}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                    }}
                                    placeholder="City"
                                    className="w-full px-3 py-1 h-9 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                                    required
                                />
                                {error.city && (
                                    <p className="text-red-500 text-sm flex items-center">
                                        <AlertCircleIcon className="h-3 w-3 mr-1" />
                                        {error.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light">
                    <div className="last:pb-6 p-6">
                        <div className="space-y-4">
                            {successMsg && (
                                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    <span className="text-sm">{successMsg}</span>
                                </div>
                            )}
                            {faildMsg && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <p className="text-destructive text-sm text-center" role="alert">
                                        {faildMsg}
                                    </p>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all bg-brand-blue h-9 px-4 py-2 w-full text-white hover:bg-primary-hover disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
                                <SaveIcon className="h-4 w-4 mr-2" />
                                <span className="text-xs/4.25 font-medium">{submitting ? "Saving..." : "Save Bank Details"}</span>
                            </button>
                            <p className="text-xs text-gray-500 text-center">By saving these details, you confirm that the information provided is accurate and belongs to you.</p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
