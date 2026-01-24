import { AddIcon, ArrowLeftIcon, ArrowRightIcon, CloseIcon, DownloadIcon, EyeIcon, FileIcon, Shield, Spinner, UploadIcon } from "@/components/Icons";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from "react";
import type { FormState, VehicleInfo } from "@/components/add-vehicle/VehicleForm";
import Input from "@/elements/Input";
import { uploadFile } from "@/lib/data";
import Button from "@/elements/Button";
import { downloadFile } from "@/lib/utils";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import { FetchError } from "@/lib/api/shared";
import { ZodTreeError } from "@/validation/shared-schema";

type PropsT = {
    formState: FormState;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateFormField: (name: Partial<keyof FormState>, value: VehicleInfo[], errorPath?: (string | number)[]) => void;
    setStep: Dispatch<SetStateAction<number>>;
    handleSubmit: (e: FormEvent) => void;
    errors?: ZodTreeError;
};

const isEmptyObject = (obj: VehicleInfo) => Object.values(obj).every((v) => v == null || v === "" || v === 0);

const SAMPLE_REPORT = "https://preprodblobadp.blob.core.windows.net/preprodblobadp-bucket/User-Documents%2Fc104e407-44ee-4fb4-918c-825f49fa277e_Stock%20Details%20Uploader.xlsx";

export default function DetailForm({ formState, errors, updateFormField, setStep, handleSubmit }: Readonly<PropsT>) {
    const vehicles =
        formState.vehicles?.length > 0
            ? formState.vehicles
            : [
                  {
                      mileage: 0,
                      vin: "",
                      registrationNumber: "",
                      numberOfOwners: 0,
                      warrantyRemaining: "",
                      inspectionReportUrl: "",
                  },
              ];

    const [loading, setLoading] = useState(false);

    const appendVehicle = () => {
        const newVehicle = {
            mileage: 0,
            vin: "",
            registrationNumber: "",
            numberOfOwners: 0,
            warrantyRemaining: "",
            inspectionReportUrl: "",
        };
        const newVehicles = [...vehicles, newVehicle];
        updateFormField("vehicles", newVehicles);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, id: number) => {
        const { name, value } = e.target;

        const updatedVehicles = [...vehicles];
        const updateVehicle = { ...updatedVehicles[id] };

        if (name === "mileage" || name === "numberOfOwners") {
            updateVehicle[name] = Number(value);
        } else {
            updateVehicle[name as keyof Omit<VehicleInfo, "mileage" | "numberOfOwners">] = value;
        }

        updatedVehicles[id] = updateVehicle;
        updateFormField("vehicles", updatedVehicles, ["vehicles", id, name]);
    };

    const removeFile = (index: number) => {
        const newVehicles = [...vehicles];
        newVehicles[index] = {
            ...newVehicles[index],
            inspectionReportUrl: "",
        };
        updateFormField("vehicles", newVehicles, ["vehicles", index, "inspectionReportUrl"]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const fileData = await uploadFile<{
                data: { fileLocation: string };
            }>(file);

            const newVehicles = [...vehicles];
            newVehicles[id] = {
                ...newVehicles[id],
                inspectionReportUrl: fileData.data?.fileLocation,
            };

            updateFormField("vehicles", newVehicles, ["vehicles", id, "inspectionReportUrl"]);
            message.success("File uploaded successfully");
        } catch {
            message.error("File upload failed. Please try again.");
        }
    };

    const uploadStocks = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const formData = new FormData();
            formData.set("file", file);
            const res = await api.post<{
                data: { records: VehicleInfo[] };
                message: string;
            }>("/inventory/api/v1/inventory/uploadInventries", {
                body: formData,
            });

            const newVehicles = [...vehicles.filter((i) => !isEmptyObject(i)), ...res.data.records];
            updateFormField("vehicles", newVehicles);
            message.success(res?.message);
        } catch (err) {
            message.error((err as FetchError<{ message: string }>).response?.data?.message || "something went wrong");
        } finally {
            setLoading(false);
            // Reset the input so selecting the same file works again
            e.target.value = "";
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4 flex items-center gap-4 justify-end">
                <div className="me-auto">
                    <h3 className="text-brand-blue">Vehicle Specifications</h3>
                    <p className="text-sm text-muted-foreground">Add multiple vehicles of the same model</p>
                </div>
                <Button type="button" variant="ghost" onClick={() => downloadFile(SAMPLE_REPORT)} leftIcon={<DownloadIcon className="h-3 w-3" />}>
                    Download Template
                </Button>
                <label
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none border border-brand-blue text-gray-800 h-9 px-4 text-sm ${
                        loading ? "opacity-50" : "hover:bg-brand-blue hover:text-white"
                    }`}>
                    {loading ? <Spinner className="h-4 w-4" /> : <UploadIcon className="h-4 w-4" />}
                    Upload stock
                    <input disabled={loading} name="stocks" type="file" onChange={uploadStocks} className="sr-only" accept=".xls,.xlsx" />
                </label>
                <Button type="button" leftIcon={<AddIcon className="h-3.5 w-3.5" />} onClick={appendVehicle} variant="primary">
                    Add Additional Stock
                </Button>
            </div>
            {vehicles.map((item, index) => (
                <div key={item.id || index} className="border rounded-xl p-4 mb-6 border-stroke-light">
                    <div className="flex items-center justify-between">
                        <h3 className="text-brand-blue mb-4">Vehicle #{index + 1}</h3>
                        {index > 0 && (
                            <div className="mb-4 text-right">
                                <Button
                                    onClick={() => {
                                        const newVehicles = vehicles.filter((_, i) => i !== index);
                                        updateFormField("vehicles", newVehicles, ["vehicles", index]);
                                    }}
                                    variant="danger"
                                    type="button"
                                    className="bg-transparent hover:bg-destructive/10 text-destructive"
                                    leftIcon={<CloseIcon />}>
                                    Remove Vehicle
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="mileage"
                            type="number"
                            name="mileage"
                            errors={errors?.properties?.vehicles?.items?.[index]?.properties?.mileage?.errors}
                            value={item.mileage || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="20"
                            required
                        />
                        <Input
                            label="VIN"
                            type="text"
                            name="vin"
                            errors={errors?.properties?.vehicles?.items?.[index]?.properties?.vin?.errors}
                            value={item.vin || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="17-character VIN"
                            required
                        />
                        <Input
                            label="Registration Number"
                            type="text"
                            name="registrationNumber"
                            errors={errors?.properties?.vehicles?.items?.[index]?.properties?.registrationNumber?.errors}
                            value={item.registrationNumber || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="License plate number"
                        />
                        <Input
                            required
                            label="Number of Owners"
                            type="number"
                            name="numberOfOwners"
                            errors={errors?.properties?.vehicles?.items?.[index]?.properties?.numberOfOwners?.errors}
                            value={item.numberOfOwners || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="eg. 2"
                        />
                        <Input
                            label="Warranty Remaining"
                            type="text"
                            name="warrantyRemaining"
                            errors={errors?.properties?.vehicles?.items?.[index]?.properties?.warrantyRemaining?.errors}
                            value={item.warrantyRemaining || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="e.g., 2 years, Expired"
                        />
                    </div>
                    <div className="border-t border-stroke-light my-6" />
                    <div>
                        <div className="flex gap-2 text-sm items-center">
                            <Shield className="w-3.5 h-3.5" />
                            Inspection Report *
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Upload a comprehensive vehicle inspection report (PDF only, max 10MB)</p>
                    </div>
                    {item.inspectionReportUrl ? (
                        <div className="border border-gray-300 rounded-lg p-4 bg-green-50 mt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded">
                                        <FileIcon className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-brand-blue">{item.inspectionReportUrl.split("/").at(-1)}</p>
                                        <p className="text-xs text-muted-foreground">Inspection report uploaded successfully</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={() => downloadFile(item.inspectionReportUrl)}
                                        leftIcon={<EyeIcon className="h-4 w-4" />}
                                        variant="secondary"
                                        className="px-2 bg-transparent font-normal py-1.5"
                                        type="button">
                                        View
                                    </Button>
                                    <Button
                                        onClick={() => removeFile(index)}
                                        variant="danger"
                                        type="button"
                                        className="bg-transparent hover:bg-destructive/10 text-destructive"
                                        leftIcon={<CloseIcon />}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <label className="text-center block p-6 border-2 mt-4 border-dashed border-muted rounded-lg hover:bg-blue-50 hover:border-black">
                            <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">Click to upload inspection report</p>
                            <p className="text-xs text-muted-foreground">PDF format only (max 10MB)</p>
                            <input name="inspectionReportUrl" type="file" onChange={(e) => handleFileUpload(e, index)} className="sr-only" accept=".pdf" />
                        </label>
                    )}

                    {errors?.properties?.vehicles?.items?.[index]?.properties?.inspectionReportUrl?.errors?.map((err: string) => (
                        <span key={err} className="text-xs text-destructive mt-1 block">
                            {err}
                        </span>
                    ))}
                </div>
            ))}
            <div className="pt-6 border-t border-stroke-light">
                <div className="flex space-x-3 justify-between">
                    <button
                        onClick={() => setStep((prev) => prev - 1)}
                        type="button"
                        className="justify-center gap-2 whitespace-nowrap text-brand-blue border-stroke-light rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 flex items-center">
                        <ArrowLeftIcon className="h-3.5 w-3.5" />
                        Previous
                    </button>
                    <button
                        type="submit"
                        className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-primary-foreground h-9 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 flex items-center text-white disabled:cursor-not-allowed">
                        Next
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </form>
    );
}
