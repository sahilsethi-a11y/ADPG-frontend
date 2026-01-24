"use client";
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import Image from "@/elements/Image";
import Select from "@/elements/Select";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { PersonalData } from "@/components/BuyerOnboard";
import Link from "next/link";
import Input from "@/elements/Input";
import { isValidDob, isValidEmail, isValidMobileNo } from "@/lib/validationUtils";
import { api } from "@/lib/api/client-request";
import { fullNameSchema } from "@/validation/user-schema";
import z from "zod";

type PropsT = {
    personalData: PersonalData;
    setStep: Dispatch<SetStateAction<number>>;
    setpersonalData: Dispatch<SetStateAction<PersonalData>>;
};

export default function BuyerForm({ setStep, setpersonalData, personalData }: Readonly<PropsT>) {
    const [error, setError] = useState("");
    const [locationList, setLocationList] = useState<{ label: string; value: string }[]>([]);
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDate = minAgeDate.toISOString().split("T")[0];

    useEffect(() => {
        const fetchEmirates = async () => {
            try {
                const res = await api.get<{ data: { id: string }[] }>("/masters/api/v1/locations/roots/AE");
                const countryId = res.data?.[0]?.id;
                if (!countryId) throw new Error("Country ID not found");

                const resEmirates = await api.get<{ data: { name: string }[] }>(`/masters/api/v1/locations/${countryId}/children`);
                const options = resEmirates.data.map((emirate: { name: string }) => ({
                    label: emirate.name,
                    value: emirate.name,
                }));
                setLocationList(options);
            } catch (error) {
                console.error("Failed to fetch emirates:", error);
            }
        };
        fetchEmirates();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setError("");
        const { name, value } = e.target;
        setpersonalData((prev) => ({ ...prev, [name]: value }));
    };
    const validateForm = () => {
        const result = fullNameSchema.safeParse(personalData.fullName.trim());
        if (!result.success) {
            const error = z.treeifyError(result.error);
            setError(error?.errors?.[0]);
            return false;
        }

        if (personalData.email.trim() === "") {
            setError("Please enter your Email Address.");
            return false;
        }
        if (!isValidEmail(personalData.email.trim())) {
            setError("Please enter a valid Email Address.");
            return false;
        }
        if (personalData.phoneNumber.trim() === "") {
            setError("Please enter your phone number.");
            return false;
        }
        if (!isValidMobileNo(personalData.phoneNumber.trim())) {
            setError("Please enter valid phone number. Allowed formats: +971XXXXXXXXX or 05XXXXXXXX");
            return false;
        }
        if (personalData.dateOfBirth.trim() === "") {
            setError("Please enter your Date of Birth.");
            return false;
        }
        if (!isValidDob(personalData.dateOfBirth.trim())) {
            setError("Age must be between 18 and 100 years");
            return false;
        }
        if (personalData.location.trim() === "") {
            setError("Please Select a Location.");
            return false;
        }
        if (personalData.address.trim() === "") {
            setError("Please enter your Address.");
            return false;
        }
        setError("");
        return true;
    };
    return (
        <>
            <div className="space-y-6">
                <div className="space-y-6">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 rounded-full bg-[#202C4A]">
                                <Image alt="Buyer Account (UAE)" src="/assets/users.svg" height={20} width={20} className="invert" />
                            </div>
                            <div className="ml-4 text-left">
                                <h4 className="font-medium text-[#202C4A] text-lg">Buyer Account (UAE)</h4>
                                <p className="text-gray-600">Browse and purchase vehicles from trusted dealers</p>
                            </div>
                        </div>
                        <h3 className="text-lg mb-2 text-[#202C4A]">Personal Information</h3>
                        <p className="text-gray-600 text-sm">Provide your personal details for account verification</p>
                    </div>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Input
                            label="Full Name"
                            name="fullName"
                            value={personalData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name as per Emirates ID"
                            aria-label="full Name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            name="email"
                            value={personalData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            aria-label="Email"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            label="Phone Number"
                            type="tel"
                            autoComplete="tel"
                            name="phoneNumber"
                            value={personalData.phoneNumber || ""}
                            onChange={handleInputChange}
                            placeholder="784-XXXX-XXX"
                            className="w-full px-3 py-1 h-9 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                            aria-label="Phone Number"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input label="Date of Birth" name="dateOfBirth" type="date" max={maxDate} value={personalData.dateOfBirth} onChange={handleInputChange} aria-label="Date of Birth" required />
                    </div>
                    <div className="space-y-2">
                        <Select
                            options={locationList}
                            value={personalData.location}
                            onChange={(value) => {
                                setpersonalData((prev) => ({ ...prev, location: value }));
                                setError("");
                            }}
                            label={
                                <div className="text-sm font-medium mb-2">
                                    Emirate (Location) <span className="text-destructive">*</span>
                                </div>
                            }
                            placeholder="Select emirate"
                            labelCls="text-base/5.25 text-brand-blue"
                            border="bg-accent/40"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-black">
                            Full Address{" "}
                            <span className="text-destructive" aria-hidden="true">
                                *
                            </span>
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={personalData.address}
                            onChange={handleInputChange}
                            required
                            rows={3}
                            placeholder="Enter your complete address"
                            className="bg-accent/40 text-sm min-h-16 w-full rounded-md px-3 py-2 placeholder:text-muted-foreground resize-none border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px]"
                        />
                    </div>
                </form>
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-destructive text-sm text-center" role="alert">
                            {error}
                        </p>
                    </div>
                )}
            </div>
            <div className="flex justify-between">
                <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 text-brand-blue border border-brand-blue hover:bg-brand-blue hover:text-white px-4 py-2 h-9 rounded-md whitespace-nowrap">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm/4.25 font-medium">Back</span>
                </Link>
                <button
                    type="button"
                    onClick={() => {
                        if (validateForm()) {
                            setStep((prev) => prev + 1);
                        }
                    }}
                    className="inline-flex items-center justify-center gap-1.2 bg-brand-blue h-9 px-4 py-2 rounded-md text-white hover:bg-primary-hover whitespace-nowrap">
                    <span className="text-xs/4.25 font-medium">Continue</span>
                    <ArrowRightIcon className="h-3.5 w-3.5 ml-2 lg:ml-2" />
                </button>
            </div>
        </>
    );
}
