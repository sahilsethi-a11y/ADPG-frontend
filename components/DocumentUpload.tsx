import { useState } from "react";
import { UploadIcon, CloseIcon, FileIcon, CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { uploadFile } from "@/lib/data";
import message from "@/elements/message";
import { clearFieldError, ZodTreeError } from "@/validation/shared-schema";
import z, { ZodType } from "zod";
import Input from "@/elements/Input";

export type FileInfo = {
    name: string;
    uploaded: boolean;
    url: string;
};

type PropsT = {
    data: {
        title: string;
        description: string;
        fileName: string;
        input: {
            label: string;
            name: string;
            placeholder: string;
        };
    }[];
    files: Record<string, FileInfo | string>;
    setFiles: React.Dispatch<React.SetStateAction<Record<string, FileInfo | string>>>;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    schema: ZodType;
};

export default function DocumentUpload({ data, files, setFiles, setStep, schema }: Readonly<PropsT>) {
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<ZodTreeError>();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");
        const { name } = e.target;
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        try {
            const fileData = await uploadFile<{ data: { fileLocation: string } }>(selectedFile);
            setFiles((prev) => ({
                ...prev,
                [name]: {
                    name: selectedFile?.name || "",
                    uploaded: true,
                    url: fileData.data?.fileLocation || "",
                },
            }));
            clearFieldError(errors, [name, "url"]);
        } catch {
            message.error("Fail to upload document");
        } finally {
            e.target.value = "";
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        clearFieldError(errors, [name]);
        setFiles((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleClearFile = (key: string) => {
        setFiles((prev) => ({
            ...prev,
            [key]: { name: "", uploaded: false, url: "" },
        }));
    };

    const validateForm = (): boolean => {
        const result = schema.safeParse(files);

        if (!result.success) {
            const error = z.treeifyError(result.error);
            setErrors(error);
            return false;
        }
        setError("");
        return true;
    };
    return (
        <>
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h3 className="text-lg mb-2 text-brand-blue">Document Upload & Verification</h3>
                    <p className="text-gray-600 text-sm">Upload the required documents for UAE Pass KYC verification</p>
                </div>
                <div className="space-y-6">
                    {data.map((i) => (
                        <div key={i.title} className="border border-black/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-medium text-brand-blue">
                                        {i.title}
                                        <span className="text-red-500">*</span>
                                    </h4>
                                    <p className="text-sm text-gray-600">{i.description}</p>
                                </div>
                                {(files[i.fileName] as FileInfo)?.uploaded && (
                                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 text-green-600 border-green-600">
                                        <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                                        Uploaded
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <button className="relative bg-white h-8 rounded-md gap-1.5 px-3 text-black border border-black/10 hover:bg-gray-100 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0">
                                            <UploadIcon className="h-4 w-4 mr-2" />
                                            {(files[i.fileName] as FileInfo)?.uploaded ? "Replace File" : "Upload File"}

                                            <input
                                                type="file"
                                                name={i.fileName}
                                                id={i.fileName}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileChange(e)}
                                                accept="image/*,.pdf"
                                            />
                                        </button>
                                        {(files[i.fileName] as FileInfo)?.uploaded && (
                                            <button onClick={() => handleClearFile(i.fileName)} className="hover:bg-accent h-8 px-3 rounded-md">
                                                <CloseIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {errors?.properties?.[i.fileName]?.properties?.url?.errors?.map((err) => (
                                        <p key={err} className="text-destructive text-sm" role="alert">
                                            {err}
                                        </p>
                                    ))}
                                    {(files[i.fileName] as FileInfo)?.uploaded && (
                                        <div className="text-sm text-gray-600 flex items-center">
                                            <FileIcon className="h-4 w-4 mr-2" />
                                            {(files[i.fileName] as FileInfo)?.name}
                                        </div>
                                    )}
                                </div>
                                <Input
                                    label={i.input.label}
                                    name={i.input.name}
                                    value={(files[i.input.name] as string) || ""}
                                    onChange={(e) => {
                                        handleTextChange(e);
                                    }}
                                    placeholder={i.input.placeholder}
                                    required
                                    errors={errors?.properties?.[i.input.name]?.errors}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-destructive text-sm text-center" role="alert">
                            {error}
                        </p>
                    </div>
                )}
            </div>
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="inline-flex items-center justify-center gap-2 text-brand-blue border border-brand-blue hover:bg-brand-blue hover:text-white px-4 py-2 h-9 rounded-md whitespace-nowrap">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm/4.25 font-medium">Previous</span>
                </button>
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
