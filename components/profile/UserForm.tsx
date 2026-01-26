"use client";
import Input from "@/elements/Input";
import { ChangeEvent } from "react";
import Button from "@/elements/Button";
import { SaveIcon } from "@/components/Icons";

export default function UserForm({
    formState,
    handleInputChange,
    handleSubmit,
}: Readonly<{ formState: Record<string, string>; handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; handleSubmit: () => void }>) {
    return (
        <div className="border border-stroke-light p-6 space-y-6 rounded-xl">
            <h4 data-slot="card-title" className="leading-none text-brand-blue flex items-center gap-2">
                Profile Information
            </h4>
            <div className="space-y-4">
                <Input label="Business/Company Name" type="text" value={formState.businessCompanyName} onChange={handleInputChange} name="businessCompanyName" placeholder="Enter Company Name" />
                <label className="block">
                    <span className="mb-2 block text-sm font-medium">Description</span>
                    <textarea
                        name="description"
                        rows={3}
                        value={formState.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1 outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-input-background rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                        placeholder="Description"
                    />
                </label>
                <Input label="Working Hours" type="text" value={formState.workingHours} onChange={handleInputChange} name="workingHours" placeholder="Enter Working Hours" />
                <Input label="Website (Optional)" type="text" value={formState.website} onChange={handleInputChange} name="website" placeholder="Enter website" />
                <Button type="submit" onClick={handleSubmit} variant="primary" fullWidth leftIcon={<SaveIcon className="h-3.5 w-3.5" />}>
                    Save Profile Settings
                </Button>
            </div>
        </div>
    );
}
