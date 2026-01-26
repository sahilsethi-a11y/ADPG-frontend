"use client";

import { useEffect, useState } from "react";
import Select from "@/elements/Select";
import { CheckCircleIcon, CloseIcon, FileIcon, UploadIcon } from "@/components/Icons";
import type { ThankyouData } from "@/components/admin/AddDealerForm";
import message from "@/elements/message";
import { uploadFile } from "@/lib/data";
import Input from "@/elements/Input";
import Button from "@/elements/Button";
import { uaeDealerSchama, UaeDealer } from "@/validation/user-schema";
import z from "zod";
import { clearFieldError, ZodTreeError } from "@/validation/shared-schema";
import { scrollToField } from "@/lib/utils";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";

type DocumentField = "emiratesId" | "companyLicense" | "exportLicense";

const initialFormData: UaeDealer = {
    dealershipName: "",
    representativeName: "",
    email: "",
    dateOfBirth: "",
    mobileNumber: "",
    emirate: "",
    address: "",
    emiratesId: { name: "", uploaded: false, url: "" },
    companyLicense: { name: "", uploaded: false, url: "" },
    exportLicense: { name: "", uploaded: false, url: "" },
};

type Options = {
    label: string;
    value: string;
};

const documents = [
    { label: "Emirates ID", name: "emiratesId", description: "Valid Emirates ID of the representative" },
    { label: "Company License", name: "companyLicense", description: "Official company registration license" },
    { label: "Export License", name: "exportLicense", description: "Valid export license for vehicle trade" },
];

export default function UaeDealerForm({ onClose, successCallback }: Readonly<{ onClose: () => void; successCallback: (data: ThankyouData) => void }>) {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emiratesOptions, setEmiratesOptions] = useState<Options[]>();
    const [errors, setErrors] = useState<ZodTreeError>();

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
                setEmiratesOptions(options);
            } catch (error) {
                console.error("Failed to fetch emirates:", error);
            }
        };
        fetchEmirates();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        clearFieldError(errors, [name]);
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: DocumentField) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const fileData = await uploadFile<{ data: { fileLocation: string } }>(file);
            message.success("Banner image addedd successfully");
            setFormData((prev) => ({
                ...prev,
                [field]: {
                    name: file.name,
                    uploaded: true,
                    url: fileData.data?.fileLocation,
                },
            }));
            clearFieldError(errors, [field, "url"]);
        } catch {
            setFormData((prev) => ({
                ...prev,
                [field]: {
                    name: file.name,
                    uploaded: false,
                    error: "Failed to upload file",
                },
            }));
            message.error("Failed to upload file");
        }
        e.target.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const result = uaeDealerSchama.safeParse(formData);

        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);

            setErrors(formattedErrors);
            // scroll to first field
            const firstField = formattedErrors.properties ? Object.keys(formattedErrors.properties)[0] : null;
            if (firstField) {
                scrollToField(firstField);
            }
            return;
        }
        setErrors(undefined);
        try {
            setLoading(true);
            const payload = {
                name: formData.representativeName,
                emailId: formData.email,
                phoneNumber: formData.mobileNumber,
                roleName: "UAE Dealer",
                roleMetaData: {
                    emiratesIdUrl: formData.emiratesId.url,
                    companyLicenseUrl: formData.companyLicense.url,
                    exportLicenseUrl: formData.exportLicense.url,
                    dob: formData.dateOfBirth,
                    address: formData.address,
                    dealershipName: formData.dealershipName,
                },
                locationAttribute: {
                    countryCode: "AE",
                    country: "United Arab Emirates",
                    emirate: formData.emirate,
                },
            };
            const res = await api.post<{ data: ThankyouData }>("/users/api/v1/users/create", { body: payload });
            successCallback(res.data);
        } catch (error) {
            if ((error as FetchError).isFetchError) {
                setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Faild to create dealer. Please try again later.");
            } else {
                setError("Something went wrong. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (field: DocumentField) => {
        setFormData((prev) => ({
            ...prev,
            [field]: { name: "", uploaded: false },
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <Input
                    type="text"
                    errors={errors?.properties?.dealershipName?.errors}
                    label="Dealership Name"
                    name="dealershipName"
                    value={formData.dealershipName}
                    onChange={handleInputChange}
                    placeholder="Enter dealership name"
                    required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        errors={errors?.properties?.representativeName?.errors}
                        type="text"
                        label=" Representative Name"
                        name="representativeName"
                        value={formData.representativeName}
                        onChange={handleInputChange}
                        placeholder="Enter representative's full name"
                        required
                    />
                    <Input
                        type="email"
                        errors={errors?.properties?.email?.errors}
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        errors={errors?.properties?.dateOfBirth?.errors}
                        max={maxDate}
                        type="date"
                        label="Representative Date of Birth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        type="tel"
                        errors={errors?.properties?.mobileNumber?.errors}
                        label="Representative Mobile Number"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="Enter mobile number (e.g., +971501234567)"
                        required
                    />
                </div>
                <Select
                    options={emiratesOptions}
                    value={formData.emirate}
                    name="emirate"
                    placeholder="Select Emirate"
                    errors={errors?.properties?.emirate?.errors}
                    onChange={(value) => {
                        setFormData((prev) => ({ ...prev, emirate: value }));
                        clearFieldError(errors, ["emirate"]);
                    }}
                    label="Emirate"
                    required
                    border="bg-accent/40"
                    labelCls="text-base/5.25 text-brand-blue"
                />
                <Input
                    label="Dealer Address"
                    errors={errors?.properties?.address?.errors}
                    type="textarea"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter complete dealer address"
                    required
                />
            </div>

            <div className="mt-4 border-t border-stroke-light">
                <h3 className="text-lg font-medium mb-2 mt-2">Required Documents</h3>
                <div className="space-y-4">
                    {documents.map((doc) => (
                        <div key={doc.label}>
                            <div className="border rounded-lg border-stroke-light p-4">
                                <div className="flex gap-4 items-center">
                                    <FileIcon className="h-5 w-5 text-[#202C4A] shrink-0 mt-1" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {doc.label} <span className="text-destructive">*</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{doc.description}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-4">
                                        <label
                                            htmlFor={doc.name}
                                            className={`border border-black rounded-md font-medium text-brand-blue px-3 py-1 text-sm ${
                                                formData[doc.name as DocumentField].uploaded
                                                    ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-brand-blue"
                                                    : "cursor-pointer hover:bg-primary-hover hover:text-white"
                                            }`}>
                                            <span className="flex items-center gap-1">
                                                <UploadIcon className="h-4 w-4" />
                                                {formData[doc.name as DocumentField].uploaded ? "Uploaded" : "Upload"}
                                            </span>
                                            <input
                                                disabled={formData[doc.name as DocumentField].uploaded}
                                                id={doc.name}
                                                name={doc.name}
                                                type="file"
                                                className="sr-only"
                                                onChange={(e) => handleFileChange(e, doc.name as DocumentField)}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                        </label>
                                    </div>
                                </div>
                                {formData[doc.name as DocumentField].uploaded && (
                                    <div className="flex gap-2 items-center mt-2">
                                        <p className="text-sm text-gray-600">{formData[doc.name as DocumentField].name}</p>
                                        <div className="inline-flex items-center gap-1 justify-center rounded-md border px-2 py-0.5 text-xs font-medium text-green-600 border-green-600">
                                            <CheckCircleIcon className="h-3 w-3" />
                                            Uploaded
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(doc.name as DocumentField)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-between p-2 rounded-md">
                                            <CloseIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {errors?.properties?.[doc.name]?.properties?.url?.errors?.map((err: string) => (
                                <span key={err} className="text-xs text-destructive mt-1 block">
                                    {err}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
            <div className="mt-6 flex items-center justify-end gap-3">
                <Button type="reset" variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Dealer"}
                </Button>
            </div>
        </form>
    );
}
