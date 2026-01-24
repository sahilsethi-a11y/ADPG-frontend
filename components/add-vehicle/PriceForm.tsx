import { ArrowLeftIcon, ChatIcon, FileIcon } from "@/components/Icons";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { FormState } from "@/components/add-vehicle/VehicleForm";
import Select, { type Option } from "@/elements/Select";
import Input from "@/elements/Input";
import Button from "@/elements/Button";
import { ZodTreeError } from "@/validation/shared-schema";

type PropsT = {
    formState: FormState;
    updateFormField: (name: Partial<keyof FormState>, value: string | boolean) => void;
    setStep: Dispatch<SetStateAction<number>>;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    filterData?: Record<string, unknown>;
    handleSubmit: () => void;
    publishLoading: boolean;
    draftLoading: boolean;
    handleSaveDraft: () => void;
    errors?: ZodTreeError;
};

export default function PriceForm({ formState, filterData, updateFormField, setStep, handleInputChange, handleSubmit, handleSaveDraft, draftLoading, publishLoading, errors }: Readonly<PropsT>) {
    return (
        <div>
            <div className="border rounded-xl p-4 mb-6 border-stroke-light">
                <h3 className="text-brand-blue mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        errors={errors?.properties?.price?.errors}
                        label="Price"
                        type="number"
                        name="price"
                        value={formState.price || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., 150000"
                        required
                    />
                    <Select
                        label="Currency"
                        required
                        options={(filterData?.currency as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        name="currency"
                        value={formState.currency || ""}
                        onChange={(value) => updateFormField("currency", value)}
                        placeholder="Select currency"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                        errors={errors?.properties?.currency?.errors}
                    />
                </div>
                <div className="border-t border-stroke-light my-6" />
                <label className="inline-flex cursor-pointer items-center gap-4">
                    <div className="relative">
                        <input
                            type="checkbox"
                            name="allowPriceNegotiations"
                            checked={!!formState.allowPriceNegotiations}
                            onChange={() => updateFormField("allowPriceNegotiations", !formState.allowPriceNegotiations)}
                            className="peer sr-only group"
                        />
                        <div className="h-4.5 w-8 rounded-full bg-gray-300 peer-checked:bg-brand-blue transition-colors duration-300" />
                        <div className="absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all duration-300 peer-checked:translate-x-3.5" />
                    </div>
                    <div className="flex gap-2 text-sm items-center">
                        <ChatIcon className="h-3.5 w-3.5" /> Allow Price Negotiations
                    </div>
                </label>

                {formState.allowPriceNegotiations && (
                    <Input
                        parentClassName="ml-6 block mt-2"
                        label="Negotiation Notes (Optional)"
                        type="textarea"
                        name="negotiationNotes"
                        rows={3}
                        value={formState.negotiationNotes || ""}
                        onChange={handleInputChange}
                        errors={errors?.properties?.negotiationNotes?.errors}
                        placeholder="e.g., Open to reasonable offers, Serious buyers only..."
                    />
                )}
            </div>
            <div className="pt-6 border-t border-stroke-light">
                <div className="flex space-x-3 justify-end">
                    <Button type="button" className="me-auto" variant="ghost" leftIcon={<ArrowLeftIcon className="h-3.5 w-3.5" />} onClick={() => setStep((prev) => prev - 1)}>
                        Previous
                    </Button>
                    <Button loading={draftLoading} variant="ghost" onClick={handleSaveDraft} type="button" leftIcon={<FileIcon className="h-3.5 w-3.5" />} className="border-brand-blue">
                        Save Draft
                    </Button>
                    <Button type="submit" variant="primary" loading={publishLoading} onClick={() => handleSubmit()}>
                        Publish listing
                    </Button>
                </div>
            </div>
        </div>
    );
}
