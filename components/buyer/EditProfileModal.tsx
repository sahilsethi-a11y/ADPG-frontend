"use client";

import Input from "@/elements/Input";
import { CallIcon, EmailIcon, LocationIcon, UserIcon } from "../Icons";
import Button from "@/elements/Button";
import { useState } from "react";
import message from "@/elements/message";
import type { User } from "@/components/buyer/PersonalInfo";
import { ZodTreeError } from "@/validation/shared-schema";
import { buyerProfileSchema } from "@/validation/user-schema";
import z from "zod";
import { api } from "@/lib/api/client-request";
import { useRouter } from "next/navigation";

export default function EditProfileModal({ user, onClose }: Readonly<{ user: User; onClose: () => void }>) {
    const router = useRouter();

    const [formState, setFormState] = useState(user);
    const [errors, setErrors] = useState<ZodTreeError>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const result = buyerProfileSchema.safeParse(formState);
        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);
            setErrors(formattedErrors);
            message.error("Please fix the errors before submit");
            return false;
        }
        setErrors(undefined);
        return true;
    };

    const onSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const payload = {
                name: formState.name,
                phoneNumber: formState.phoneNumber,
                address: formState.address,
            };
            const resp = await api.put<{ status: string }>("/users/api/v1/users/edit-user", { body: payload });
            if (resp.status === "OK") {
                message.success("Profile updated successfully");
                onClose();
                router.refresh();
            }
        } catch {
            message.error("Something went wrong");
        }
    };

    return (
        <div className="md:w-md">
            <div className="grid gap-4">
                <div>
                    <h2 className="text-lg leading-none font-semibold text-brand-blue mb-2">Edit Profile</h2>
                    <p className="text-muted-foreground text-sm">Update your personal information</p>
                </div>
                <form action={onSubmit} className="space-y-5 py-4">
                    <Input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        label={
                            <span className="flex items-center gap-2 text-brand-blue">
                                <EmailIcon className="h-4 w-4" /> Email
                            </span>
                        }
                        placeholder="Enter your email"
                        readOnly
                        errors={errors?.properties?.email?.errors}
                    />
                    <Input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        label={
                            <span className="flex items-center gap-2 text-brand-blue">
                                <UserIcon className="h-4 w-4" /> Full Name
                            </span>
                        }
                        placeholder="Enter your full name"
                        errors={errors?.properties?.name?.errors}
                    />
                    <Input
                        type="tel"
                        name="phoneNumber"
                        value={formState.phoneNumber}
                        onChange={handleInputChange}
                        label={
                            <span className="flex items-center gap-2 text-brand-blue">
                                <CallIcon className="h-4 w-4" /> Phone
                            </span>
                        }
                        placeholder="Enter your phone number"
                        errors={errors?.properties?.phoneNumber?.errors}
                    />
                    <Input
                        type="textarea"
                        rows={3}
                        name="address"
                        value={formState.address}
                        onChange={handleInputChange}
                        label={
                            <span className="flex items-center gap-2 text-brand-blue">
                                <LocationIcon className="h-4 w-4" /> Address
                            </span>
                        }
                        placeholder="Enter your address"
                        errors={errors?.properties?.address?.errors}
                    />
                    <div className="flex gap-3">
                        <Button type="reset" onClick={onClose} variant="ghost" fullWidth={true} size="sm">
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth={true} size="sm" loading={false}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
