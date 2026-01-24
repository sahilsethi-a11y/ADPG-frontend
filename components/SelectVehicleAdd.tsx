"use client";

import { CheckCircleIcon, CloseIcon, DownloadIcon, FileIcon } from "@/components/Icons";
import { downloadFile } from "@/lib/utils";
import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/elements/Button";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import { FetchError } from "@/lib/api/shared";

type PropsT = {
    onClose: () => void;
};

const data = {
    title: "Choose Vehicle Upload Method",
    subtitle: "Select how you'd like to add your vehicles to the marketplace",
    types: [
        {
            title: "Form-Based Entry",
            description: "Add vehicles one at a time using our guided form with step-by-step validation",
            benefits: ["Easy to use interface", "Real-time validation", "Image upload support", "Multiple vehicle instances"],
            note: "Best for: Single or few vehicles",
            type: "form-based",
        },
        {
            title: "CSV/Excel Upload",
            description: "Upload multiple vehicles at once using our template spreadsheet",
            benefits: ["Bulk upload support", "Fast data entry", "Error validation report", "Template provided"],
            sampleUrl: "https://preprodblobadp.blob.core.windows.net/preprodblobadp-bucket/User-Documents%2F592fd126-60ed-47ac-8741-c2e885096ffc_Basic%20Details%20Uploader%20format.xlsx",
            note: "Best for: Multiple vehicles (10+)",
            type: "excel-based",
        },
    ],
    note: "Regardless of the method you choose, all vehicle listings must include a mandatory inspection report (PDF) before they can be published.",
};

export default function SelectVehicleAdd({ onClose }: Readonly<PropsT>) {
    const [selectedType, setSelectedType] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleTypeSelection = () => {
        if (selectedType === "form-based") {
            router.push("/add-vehicle");
        } else if (selectedType === "excel-based") {
            inputRef.current?.click();
        }
    };

    const uploadVehicle = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const formData = new FormData();
            formData.set("file", file);
            const res = await api.post<{ message: string }>("/inventory/api/v1/inventory/upload-vehicle", { body: formData });
            message.success(res?.message);
            setTimeout(() => {
                router.push("/seller/inventory");
                setLoading(false);
                onClose();
            }, 1000);
        } catch (err) {
            message.error((err as FetchError<{ message: string }>).response?.data?.message || "something went wrong");
            setLoading(false);
            onClose();
        }
    };

    return (
        <div>
            <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                <CloseIcon />
            </button>
            <div className="flex flex-col gap-2 text-center sm:text-left mb-4">
                <h2 className="text-lg leading-none font-semibold flex items-center text-brand-blue">{data.title}</h2>
                <p className="text-muted-foreground text-sm">{data.subtitle}</p>
            </div>
            <div className="overflow-auto max-h-[calc(100vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.types.map((t) => (
                        <div
                            key={t.title}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setSelectedType(t.type)}
                            onClick={() => setSelectedType(t.type)}
                            className={`relative p-6 border rounded-lg transition-all hover:shadow-lg cursor-pointer text-left border-gray-200 hover:border-brand-blue ${
                                t.type === selectedType ? "bg-blue-50" : ""
                            }`}>
                            {t.type === selectedType && (
                                <div className="absolute top-4 right-4">
                                    <CheckCircleIcon className="h-5 w-5 text-brand-blue" />
                                </div>
                            )}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="p-4 rounded-full bg-gray-100">
                                    <FileIcon className="text-brand-blue" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-brand-blue mb-2">{t.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{t.description}</p>
                                    <div className="space-y-2 text-xs text-gray-500">
                                        {t.benefits.map((b) => (
                                            <div key={b} className="flex items-center justify-center space-x-2">
                                                <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                                                <span>{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {t.sampleUrl && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => downloadFile(t.sampleUrl)}
                                        className="flex hover:bg-brand-blue hover:text-white transition-colors gap-4 text-brand-blue text-xs items-center border border-brand-blue rounded-md px-2 py-1">
                                        <DownloadIcon className="h-3 w-3" />
                                        Download Template
                                    </button>
                                </div>
                            )}
                            <input ref={inputRef} disabled={loading} name="stocks" type="file" onChange={uploadVehicle} className="sr-only" accept=".xls,.xlsx" />
                            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                                <span className="text-xs text-gray-500 font-medium">{t.note}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-stroke-light">
                    <Button type="reset" onClick={onClose} variant="ghost">
                        Cancel
                    </Button>
                    <Button loading={loading} type="submit" onClick={handleTypeSelection} disabled={!selectedType} variant="primary">
                        Continue
                    </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold text-brand-blue">Note: </span>
                        {data.note}
                    </p>
                </div>
            </div>
        </div>
    );
}
