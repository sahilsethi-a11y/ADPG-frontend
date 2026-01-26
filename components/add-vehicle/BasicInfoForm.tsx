"use client";

import { ArrowRightIcon } from "@/components/Icons";
import Select, { type Option } from "@/elements/Select";
import type { FormState } from "@/components/add-vehicle/VehicleForm";
import { getCities, getModals, getVariants, type Model, type Variant, type Brand } from "@/lib/data";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import Input from "@/elements/Input";
import { ZodTreeError } from "@/validation/shared-schema";

type PropsT = {
    brands?: Brand[];
    formState: FormState;
    updateFormField: (name: Partial<keyof FormState>, value: string) => void;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    filterData?: Record<string, unknown>;
    setStep: Dispatch<SetStateAction<number>>;
    errors?: ZodTreeError;
    handleSubmit: (e: FormEvent) => void;
};

export default function BasicInfoForm({ brands, formState, errors, updateFormField, handleInputChange, filterData, handleSubmit }: Readonly<PropsT>) {
    const [modals, setModals] = useState<Model[]>();
    const [variants, setVariants] = useState<Variant[]>();
    const [cities, setCities] = useState<Option[]>();

    useEffect(() => {
        if (!formState.brand) return;

        const fetchModels = async (brand: string) => {
            try {
                const res = await getModals(brand);
                setModals(res.data);
            } catch {
                console.log("error fetching models");
            }
        };
        fetchModels(formState.brand);
    }, [formState.brand]);

    useEffect(() => {
        if (!formState.model) return;
        const fetchVariants = async (model: string) => {
            try {
                const res = await getVariants(model);
                setVariants(res.data);
            } catch {
                console.log("error fetching variants");
            }
        };

        fetchVariants(formState.model);
    }, [formState.model]);

    useEffect(() => {
        if (!formState.country) return;
        const fetchCities = async (countryCode: string) => {
            try {
                const resCities = await getCities(countryCode);
                const options = resCities?.data?.map((city: { id: string; name: string }) => ({
                    label: city.name,
                    value: city.name,
                    extra: city.id,
                }));
                setCities(options);
            } catch (error) {
                console.error("Failed to fetch emirates:", error);
            }
        };
        fetchCities(formState.country);
    }, [formState.country]);

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="border rounded-xl p-4 mb-6 border-stroke-light">
                <h2 className="text-brand-blue mb-4">Vehicle Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Brand"
                        required
                        name="brand"
                        errors={errors?.properties?.brand?.errors}
                        options={brands?.map((brand) => ({
                            value: brand.name,
                            label: brand.name,
                        }))}
                        value={formState.brand}
                        onChange={(value) => {
                            updateFormField("brand", value);
                            updateFormField("model", "");
                            updateFormField("variant", "");
                        }}
                        placeholder="Select Make"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Model"
                        name="model"
                        required={true}
                        errors={errors?.properties?.model?.errors}
                        options={modals?.map((model) => ({
                            value: model.modelName,
                            label: model.modelName,
                        }))}
                        value={formState.model}
                        onChange={(value) => {
                            updateFormField("model", value);
                            updateFormField("variant", "");
                        }}
                        placeholder="Select Model"
                        noDataMessage="Select model found"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Variant"
                        required
                        name="variant"
                        errors={errors?.properties?.variant?.errors}
                        options={variants?.map((variant) => ({
                            value: variant.variantName,
                            label: variant.variantName,
                        }))}
                        value={formState.variant}
                        onChange={(value) => updateFormField("variant", value)}
                        placeholder="Select Variant"
                        noDataMessage="No variant found"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />

                    <Input label="Year" type="number" name="year" errors={errors?.properties?.year?.errors} value={formState.year || ""} onChange={handleInputChange} placeholder="2023" required />
                    <Select
                        label="Regional Specs"
                        required
                        name="regionalSpecs"
                        errors={errors?.properties?.regionalSpecs?.errors}
                        options={(filterData?.regionalSpecsOptions as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        value={formState.regionalSpecs}
                        onChange={(value) => updateFormField("regionalSpecs", value)}
                        placeholder="Select regional specs"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Body Type"
                        required
                        name="bodyType"
                        errors={errors?.properties?.bodyType?.errors}
                        options={(filterData?.bodyType as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        value={formState.bodyType}
                        onChange={(value) => updateFormField("bodyType", value)}
                        placeholder="Select body type"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Condition"
                        required
                        name="condition"
                        errors={errors?.properties?.condition?.errors}
                        options={(filterData?.bodyConditionOptions as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        value={formState.condition}
                        onChange={(value) => updateFormField("condition", value)}
                        placeholder="Select condition"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <fieldset className="md:col-span-2">
                        <legend className="text-sm font-medium mb-2">Color</legend>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                            {(filterData?.colors as { label: string; value: string; hex: string }[])?.map((color) => (
                                <label
                                    key={color.value}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all hover:shadow-sm ${
                                        formState.color === color.value ? "border-brand-blue bg-blue-50" : "border-gray-200 hover:border-gray-300"
                                    }`}>
                                    <div className="w-9 h-9 rounded-full border border-gray-300 shrink-0 " style={{ backgroundColor: color.hex }} aria-hidden="true" />
                                    <input type="radio" name="color" value={color.value} onChange={handleInputChange} hidden />
                                    <span className="text-xs/4.5 flex-1">{color.value}</span>
                                </label>
                            ))}
                        </div>
                        {errors?.properties?.color?.errors?.map((err: string) => (
                            <span key={err} className="text-xs text-destructive mt-1 block">
                                {err}
                            </span>
                        ))}
                    </fieldset>
                    <Select
                        label="Country"
                        required
                        name="country"
                        errors={errors?.properties?.country?.errors}
                        options={(filterData?.country as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        value={formState.country}
                        onChange={(value) => updateFormField("country", value)}
                        placeholder="e.g. UAE"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="City"
                        name="city"
                        required
                        errors={errors?.properties?.city?.errors}
                        options={cities?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        value={formState.city}
                        onChange={(value) => updateFormField("city", value)}
                        placeholder="e.g. Dubai"
                        border="bg-input-background"
                        noDataMessage="Select country first"
                        labelCls="text-sm font-medium"
                    />
                </div>
                <div className="border-t border-stroke-light my-6" />
                <h2 className="text-brand-blue mb-4">Engine & Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Select
                        label="Fuel Type"
                        options={(filterData?.fuelTypeOptions as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        name="fuelType"
                        errors={errors?.properties?.fuelType?.errors}
                        value={formState.fuelType}
                        onChange={(value) => updateFormField("fuelType", value)}
                        placeholder="Select fuel type"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Transmission"
                        options={(filterData?.transmissionOptions as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        name="transmission"
                        errors={errors?.properties?.transmission?.errors}
                        value={formState.transmission}
                        onChange={(value) => updateFormField("transmission", value)}
                        placeholder="Select transmission"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Drivetrain"
                        options={(filterData?.drivetrainOptions as Option[])?.map((item) => ({
                            value: item.value,
                            label: item.label,
                        }))}
                        name="drivetrain"
                        value={formState.drivetrain}
                        errors={errors?.properties?.drivetrain?.errors}
                        onChange={(value) => updateFormField("drivetrain", value)}
                        placeholder="Select Drivetrain"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Input
                        label="Engine Size"
                        type="text"
                        name="engineSize"
                        errors={errors?.properties?.engineSize?.errors}
                        value={formState.engineSize || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., 3.0L, 2.5L"
                    />
                    <Input
                        label="Cylinders"
                        type="number"
                        name="cylinders"
                        errors={errors?.properties?.cylinders?.errors}
                        value={formState.cylinders || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., 4, 6, 8"
                    />
                    <Input
                        label="Horsepower(in HP)"
                        type="number"
                        name="horsepower"
                        errors={errors?.properties?.horsepower?.errors}
                        value={formState.horsepower || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., 1200"
                    />
                    <Input
                        label="Seating Capacity"
                        type="number"
                        name="seatingCapacity"
                        errors={errors?.properties?.seatingCapacity?.errors}
                        value={formState.seatingCapacity || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., 5, 7"
                    />
                    <Input
                        label="Number of Doors"
                        type="number"
                        name="numberOfDoors"
                        errors={errors?.properties?.numberOfDoors?.errors}
                        value={formState.numberOfDoors || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., 2, 4, 5"
                    />
                </div>
                <div className="border-t border-stroke-light my-6" />
                <Input
                    type="textarea"
                    label="Description"
                    name="description"
                    rows={3}
                    errors={errors?.properties?.description?.errors}
                    value={formState.description}
                    onChange={handleInputChange}
                    placeholder="Describe your vehicle's condition, history, and any special features..."
                />
            </div>
            <div className="flex justify-end items-center pt-6 border-t border-stroke-light">
                <div className="flex space-x-3">
                    <button
                        type="submit"
                        className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50  focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-primary-foreground h-9 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 flex items-center text-white disabled:cursor-not-allowed">
                        Next
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </form>
    );
}
