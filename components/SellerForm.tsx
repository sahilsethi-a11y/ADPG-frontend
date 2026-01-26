"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import Image from "@/elements/Image";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { PersonalData } from "@/components/SellerOnboard";
import Select from "@/elements/Select";
import Link from "next/link";
import Input from "@/elements/Input";
import { isValidDob, isValidEmail, isValidMobileNo } from "@/lib/validationUtils";
import { api } from "@/lib/api/client-request";
import { companyNameSchema, representativeNameSchema } from "@/validation/user-schema";
import z from "zod";

type PropsT = {
    personalData: PersonalData;
    setpersonalData: Dispatch<SetStateAction<PersonalData>>;
    setStep: Dispatch<SetStateAction<number>>;
};
type OptionType = {
    label: string;
    value: string;
};

export default function SellerForm({ setStep, setpersonalData, personalData }: Readonly<PropsT>) {
    const [error, setError] = useState("");
    const [cityList, setCityList] = useState<OptionType[]>([]);
    const [districtList, setDistrictList] = useState<OptionType[]>([]);
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDate = minAgeDate.toISOString().split("T")[0];

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await api.get<{ data: { id: string }[] }>("/masters/api/v1/locations/roots/CN");
                const countryId = res.data?.[0]?.id;
                if (!countryId) throw new Error("Country ID not found");

                const resCities = await api.get<{ data: { id: string; name: string }[] }>(`/masters/api/v1/locations/${countryId}/children`);
                const options = resCities.data.map((city: { id: string; name: string }) => ({
                    label: city.name,
                    value: city.name,
                    extra: city.id,
                }));
                setCityList(options);
            } catch (error) {
                console.error("Failed to fetch emirates:", error);
            }
        };
        fetchCities();
    }, []);

    const getDistricts = async (id: string) => {
        try {
            const res = await api.get<{ data: { id: string; name: string }[] }>(`/masters/api/v1/locations/${id}/children`);
            const options = res.data.map((district: { id: string; name: string }) => ({
                label: district.name,
                value: district.name,
            }));
            setDistrictList(options);
        } catch (err) {
            console.log(err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setError("");
        setpersonalData((prev) => ({ ...prev, [name]: value }));
    };
    const validateForm = () => {
        const companyName = companyNameSchema.safeParse(personalData.companyName.trim());
        if (!companyName.success) {
            const error = z.treeifyError(companyName.error);
            setError(error?.errors?.[0]);
            return false;
        }

        const representativeName = representativeNameSchema.safeParse(personalData.fullName.trim());
        if (!representativeName.success) {
            const error = z.treeifyError(representativeName.error);
            setError(error?.errors?.[0]);
            return false;
        }

        if (personalData.fullName.trim() === "") {
            setError("Please enter a representative name.");
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
        if (personalData.mobile.trim() === "") {
            setError("Please enter your Mobile Number.");
            return false;
        }
        if (!isValidMobileNo(personalData.mobile.trim())) {
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
        if (personalData.city.trim() === "") {
            setError("Please enter your City.");
            return false;
        }
        if (personalData.district.trim() === "") {
            setError("Please enter your District.");
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
                                <Image alt="Buyer Account (UAE)" src="/assets/briefcase.svg" height={20} width={20} className="invert" />
                            </div>
                            <div className="ml-4 text-left">
                                <h4 className="font-medium text-[#202C4A] text-lg">Seller Account (China)</h4>
                                <p className="text-gray-600">Sell and export vehicles to UAE buyers</p>
                            </div>
                        </div>
                        <h3 className="text-lg mb-2 text-[#202C4A]">Personal Information</h3>
                        <p className="text-gray-600 text-sm">Provide your personal details for account verification</p>
                    </div>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Company Name" name="companyName" value={personalData.companyName} onChange={handleInputChange} required placeholder="Enter your company name" />
                    <Input
                        label="Representative Name"
                        required
                        name="fullName"
                        placeholder="Enter your full name as per official documents"
                        value={personalData.fullName}
                        onChange={handleInputChange}
                        aria-label="Date of Birth"
                    />
                    <Input label="Email Address" name="email" type="email" required value={personalData.email} onChange={handleInputChange} placeholder="your.email@example.com" />
                    <Input label="Mobile Number" name="mobile" value={personalData.mobile} required onChange={handleInputChange} placeholder="+971XXXXXXXXX or 05XXXXXXXX" />
                    <Input label="Date of Birth" name="dateOfBirth" max={maxDate} type="date" required value={personalData.dateOfBirth} onChange={handleInputChange} />
                    <Select
                        options={cityList}
                        value={personalData.city}
                        name="city"
                        onChange={(value, extra) => {
                            setpersonalData((prev) => ({ ...prev, city: value }));
                            setError("");
                            getDistricts(extra as string);
                        }}
                        label="City"
                        placeholder="Select city"
                        border="bg-accent/40"
                        required
                    />
                    <Select
                        options={districtList}
                        value={personalData.district}
                        onChange={(value) => {
                            setpersonalData((prev) => ({ ...prev, district: value }));
                            setError("");
                        }}
                        name="district"
                        label="District"
                        placeholder="Select district"
                        border="bg-accent/40"
                        required
                    />
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
