"use client";

import { ChangeEvent, FormEvent, JSX, useEffect, useReducer, useState } from "react";
import { DollerIcon, EyeIcon, FileIcon, SettingIcon, StarIcon, UploadIcon } from "@/components/Icons";
import Stepper from "@/components/add-vehicle/Stepper";
import BasicInfoForm from "@/components/add-vehicle/BasicInfoForm";
import DetailForm from "@/components/add-vehicle/DetailForm";
import FeatureForm from "@/components/add-vehicle/FeatureForm";
import ImageForm from "@/components/add-vehicle/ImageForm";
import PriceForm from "@/components/add-vehicle/PriceForm";
import { useRouter, usePathname } from "next/navigation";

import { type Brand } from "@/lib/data";
import { z } from "zod";
import { scrollToField } from "@/lib/utils";

import {
    baseSchema,
    basicInfoFormSchema,
    detailFormSchema,
    featureFormSchema,
    fullListingSchema,
    imageFormSchema,
    Status,
    VehicleInfoSchema,
    type VehicleFormValues,
} from "@/validation/vehicle-schema";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import Button from "@/elements/Button";
import { clearFieldError, ZodTreeError } from "@/validation/shared-schema";

type PropsT = {
    topSection: JSX.Element;
    brands?: Brand[];
    filterData?: Record<string, unknown>;
    intialData?: FormState;
    step: string;
};

export type Step = {
    label: string;
    icon: JSX.Element;
};

export type FormState = VehicleFormValues;
export type BasicInfoFormValue = z.infer<typeof basicInfoFormSchema>;
export type VehicleInfo = z.infer<typeof VehicleInfoSchema>;
type FormAction = { type: "UPDATE_FIELD"; field: keyof FormState; value: unknown } | { type: "SET_ALL"; fields: FormState } | { type: "RESET" };

const initialFormState: FormState = {
    brand: "",
    model: "",
    variant: "",
    year: 0,
    regionalSpecs: "",
    bodyType: "",
    condition: "",
    color: "",
    city: "",
    country: "",
    fuelType: "",
    transmission: "",
    drivetrain: "",
    engineSize: "",
    cylinders: 0,
    horsepower: 0,
    seatingCapacity: 0,
    numberOfDoors: 0,
    features: [],
    imageUrls: [],
    mainImageUrl: "",
    price: 0,
    allowPriceNegotiations: false,
    negotiationNotes: "",
    description: "",
    status: Status.DRAFT,
    currency: "",
    vehicles: [],
};

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case "UPDATE_FIELD":
            return {
                ...state,
                [action.field]: action.value,
            };
        case "SET_ALL":
            return action.fields;
        case "RESET":
            return initialFormState;
        default:
            return state;
    }
}
const steps: Step[] = [
    { label: "Basic Info", icon: <FileIcon className="h-4.5 w-4.5" /> },
    { label: "Details", icon: <SettingIcon className="h-4.5 w-4.5" /> },
    { label: "Features", icon: <StarIcon className="h-4.5 w-4.5" /> },
    { label: "Images", icon: <UploadIcon className="h-4.5 w-4.5" /> },
    { label: "Pricing & Options", icon: <DollerIcon className="h-4.5 w-4.5" /> },
];

export default function VehicleForm({ topSection, brands, filterData, intialData, step: initialStep }: Readonly<PropsT>) {
    const [step, setStep] = useState(initialStep ? Number(initialStep) : 1);
    const [formState, dispatch] = useReducer(formReducer, intialData ?? initialFormState);
    const [errors, setErrors] = useState<ZodTreeError>();
    const [draftLoading, setDraftLoading] = useState(false);
    const [publishLoading, setpublishLoading] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (intialData) {
            dispatch({ type: "SET_ALL", fields: intialData });
        }
    }, [intialData]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        updateFormField(name as Partial<keyof FormState>, value);
    };

    const updateFormField = (name: Partial<keyof FormState>, value: unknown, errorPath?: (string | number)[]) => {
        clearFieldError(errors, errorPath || [name]);
        dispatch({ type: "UPDATE_FIELD", field: name as keyof FormState, value });
    };

    const validateDraft = () => {
        const result = baseSchema.safeParse({ ...formState, status: Status.DRAFT });

        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);
            setErrors(formattedErrors);
            return false;
        }
        setErrors(undefined);
        return true;
    };

    const validateFull = () => {
        const result = fullListingSchema.safeParse(formState);
        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);
            setErrors(formattedErrors);

            message.error("Please fix the errors before publishing");
            return false;
        }
        setErrors(undefined);
        return true;
    };

    const handleSaveDraft = async () => {
        if (!validateDraft()) return;
        try {
            setDraftLoading(true);
            const payload = {
                ...formState,
                status: Status.DRAFT,
            };
            const res = await api.post<{
                status: string;
                message: string;
                data: {
                    id: string;
                };
            }>("/inventory/api/v1/inventory/create-inventory", { body: payload });
            if (res.status === "OK") {
                message.success("Draft saved successfully");
                router.replace(pathname + "?id=" + res.data.id + "&step=" + step);
                router.refresh();
            }
        } catch {
            message.error("Failed to save draft");
        } finally {
            setDraftLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!validateFull()) return;

        const payload = {
            ...formState,
            status: Status.LIVE,
        };
        try {
            setpublishLoading(true);
            const res = await api.post<{ status: string }>("/inventory/api/v1/inventory/create-inventory", { body: payload });
            if (res.status === "OK") {
                setTimeout(() => {
                    setpublishLoading(false);
                    router.push("/seller/inventory");
                }, 1000);
            }
        } catch {
            message.error("Faild to publish");
            setpublishLoading(false);
        }
    };

    const handleBasicFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        const result = basicInfoFormSchema.safeParse(formState);

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
        setStep((prev) => prev + 1);
    };

    const handleDetailFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        const result = detailFormSchema.safeParse(formState);

        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);
            setErrors(formattedErrors);
            message.error("Please fix the errors before proceeding");
            return;
        }
        setErrors(undefined);
        setStep((prev) => prev + 1);
    };

    const handleFeatureFormSubmit = () => {
        const result = featureFormSchema.safeParse(formState);

        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);
            setErrors(formattedErrors);
            message.error("Please fix the errors before proceeding");

            return;
        }
        setErrors(undefined);
        setStep((prev) => prev + 1);
    };

    const handleImageFormSubmit = () => {
        const result = imageFormSchema.safeParse(formState);

        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);
            setErrors(formattedErrors);
            message.error("Please fix the errors before proceeding");

            return;
        }
        setErrors(undefined);
        setStep((prev) => prev + 1);
    };

    const renderSteps = () => {
        const props = {
            formState,
            updateFormField,
            handleInputChange,
            setStep,
            filterData,
            brands,
            errors,
        };

        switch (step) {
            case 1:
                return <BasicInfoForm {...props} handleSubmit={handleBasicFormSubmit} />;
            case 2:
                return <DetailForm {...props} handleSubmit={handleDetailFormSubmit} />;
            case 3:
                return <FeatureForm {...props} handleSubmit={handleFeatureFormSubmit} />;
            case 4:
                return <ImageForm {...props} handleSubmit={handleImageFormSubmit} />;
            case 5:
                return <PriceForm {...props} handleSubmit={handlePublish} publishLoading={publishLoading} draftLoading={draftLoading} handleSaveDraft={handleSaveDraft} />;
            default:
                return <div>Something went wrong</div>;
        }
    };

    return (
        <div>
            <div className="flex md:items-center md:justify-between mb-6 flex-col md:flex-row gap-10">
                {topSection}

                <div className="flex space-x-3 text-xs">
                    <Button disabled type="button" variant="outline" leftIcon={<EyeIcon className="h-3.5 w-3.5" />}>
                        Preview
                    </Button>

                    <Button loading={draftLoading} variant="ghost" onClick={handleSaveDraft} type="button" leftIcon={<FileIcon className="h-3.5 w-3.5" />} className="border-brand-blue">
                        Save Draft
                    </Button>

                    {/* <button onClick={handlePublish} type="button" className={`${btnBaseClassName} text-white bg-brand-blue hover:bg-brand-blue/90`}>
                        Publish Listing
                    </button> */}
                </div>
            </div>

            <Stepper currentStep={step} steps={steps} setStep={setStep} />

            <div>{renderSteps()}</div>
        </div>
    );
}
