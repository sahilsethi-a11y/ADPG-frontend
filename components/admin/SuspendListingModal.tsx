"use client";

import { ChangeEvent, useState } from "react";
import Button from "@/elements/Button";
import { api } from "@/lib/api/client-request";
import { BanIcon, CautionIcon, CloseIcon, UploadIcon } from "@/components/Icons";
import message from "@/elements/message";
import { uploadFile } from "@/lib/data";
import type { Content } from "./ListingModerationTab";
import Input from "@/elements/Input";

const MAX_DOC_LIMIT = 3;

const data = {
    title: "Suspend Listing",
    description: "Please provide a detailed reason for suspending this listing. This message will be sent to the seller/dealer via email.",
    confirmText: "Suspend Listing",
    cancelText: "Cancel",
};

type PropsT = {
    handleClose: (isRefresh?: boolean) => void;
    isOpen: boolean;
    item?: Content;
};

type FileInfo = {
    name: string;
    url: string;
};

export default function SuspendListing({ handleClose, item }: Readonly<PropsT>) {
    const [reason, setReason] = useState("");
    const [supportingDocuments, setSupportingDocuments] = useState<FileInfo[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSuspand = async () => {
        try {
            setLoading(true);
            const payLoad = {
                vehicleId: item?.id,
                suspensionReason: reason,
                supportingDocuments: supportingDocuments.map((doc) => doc.url),
            };
            const res = await api.post<{ status: string }>("/inventory/api/v1/inventory/suspend-vehicle", {
                body: payLoad,
            });
            if (res.status === "OK") {
                setTimeout(() => {
                    handleClose(true);
                    setLoading(false);
                    message.success("Listing suspend successfully");
                }, 500);
            } else throw new Error("Something went wrong");
        } catch {
            message.error("Failed to suspended vehicle");
        }
    };
    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const prevDocsSize = supportingDocuments.length;
        if (files.length + prevDocsSize > MAX_DOC_LIMIT) {
            message.error(`Maximum ${MAX_DOC_LIMIT} documents allowed`);
            return;
        }

        try {
            const filesArray = [];
            for (const file of files) {
                const res = uploadFile<{
                    data: { fileLocation: string; fileName: string };
                }>(file);
                filesArray.push(res);
            }
            const newFilesArray = await Promise.all(filesArray);

            setSupportingDocuments((prev) => {
                const newImages = [
                    ...prev,
                    ...newFilesArray.map((file) => ({
                        name: file.data.fileName,
                        url: file.data.fileLocation,
                    })),
                ];
                return newImages;
            });
        } catch {
            console.error("Failed to upload file");
        }
    };

    return (
        <div className="w-md">
            <h2 className="text-lg leading-none font-semibold text-brand-blue">{data.title}</h2>
            <p className="text-muted-foreground text-sm">{data.description}</p>

            <div className="max-h-[70vh] overflow-y-auto pe-0.5">
                <div className="bg-gray-50 border-gray-200 rounded-lg p-4 mt-4">
                    <h2 className="text-brand-blue mb-2">Listing Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Vehicle:</span>
                            <span className="ml-2">
                                {item?.inventory?.year} {item?.inventory?.brand} {item?.inventory?.model}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Price:</span>
                            <span className="ml-2">
                                {item?.inventory?.currency} {item?.inventory?.price}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Seller:</span>
                            <span className="ml-2">
                                {item?.user?.name} ({item?.user?.roleType})
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Location:</span>
                            <span className="ml-2">{[item?.inventory?.city, item?.inventory?.country].filter(Boolean).join(" , ")}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <h2 className="text-brand-blue mb-2">Reason for Suspension</h2>
                    <Input
                        type="textarea"
                        value={reason}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                        rows={3}
                        placeholder="Please provide a detailed reason for suspending this listing. This message will be sent to the seller/dealer via email."
                    />
                    <p className="text-xs text-gray-500 mt-1">{reason.length}/1000 characters</p>
                </div>

                <div className="mt-4">
                    <label data-slot="label" className="flex items-center gap-2 text-sm leading-none font-medium text-brand-blue">
                        Supporting Documents (Optional)
                    </label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors border-gray-300 hover:border-brand-blue relative">
                        <input type="file" name="supportingDocuments" multiple onChange={(e) => handleFileInput(e)} accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <UploadIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Drop files here or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">Images and PDF files only, max 10MB each, up to 3 files</p>
                    </div>

                    {supportingDocuments.length > 0 && (
                        <div className="mt-4">
                            <h2 className="text-brand-blue mb-2">Supporting Documents</h2>
                            {supportingDocuments.map((doc) => (
                                <div key={doc.name} className="bg-gray-50 border-gray-200 rounded-lg px-2 py-1 mt-2">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="ml-2">{doc.name}</span>

                                        <Button
                                            onClick={() => {
                                                setSupportingDocuments((prev) => prev.filter((item) => item.url !== doc.url));
                                            }}
                                            leftIcon={<CloseIcon className="text-red-600" />}
                                            className="bg-transparent hover:bg-transparent"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="my-4 relative w-full rounded-lg border px-4 py-3 text-sm text-red-800 border-red-200 bg-red-50 flex gap-2 items-start">
                    <div className="basis-6">
                        <CautionIcon className="w-4 h-4 text-red-600" />
                    </div>

                    <div className="col-start-2 grid justify-items-start gap-1 text-sm [&amp;_p]:leading-relaxed text-red-800">
                        <strong>Important:</strong> Suspending this listing will immediately remove it from public view. The seller/dealer will receive an email notification with your message and any
                        attached documents. They can respond to the email to address the issue and request revocation.
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => handleClose()}>
                        {data.cancelText}
                    </Button>
                    <Button
                        loading={loading}
                        variant="danger"
                        onClick={() => {
                            handleSuspand();
                            handleClose();
                        }}
                        disabled={!reason.trim()}>
                        <BanIcon className="w-4 h-4 " />
                        {data.confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
