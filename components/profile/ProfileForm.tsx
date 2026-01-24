"use client";

import BannerUpload from "@/components/profile/BannerUpload";
import UserForm from "@/components/profile/UserForm";
import { uploadFile } from "@/lib/data";
import { ChangeEvent, useState, KeyboardEvent } from "react";
import { CloseIcon } from "@/components/Icons";
import Button from "@/elements/Button";
import Input from "@/elements/Input";
import message from "@/elements/message";
import { api } from "@/lib/api/client-request";

type PropsT = {
    data: {
        bannerImage: string;
        website: string;
        specialties: string[];
        description: string;
        businessCompanyName: string;
        workingHours: string;
    };
};

export default function ProfileForm({ data }: Readonly<PropsT>) {
    const [formState, setFormState] = useState({
        businessCompanyName: data?.businessCompanyName ?? "",
        description: data?.description ?? "",
        workingHours: data?.workingHours ?? "",
        website: data?.website ?? "",
        bannerImage: data?.bannerImage ?? "",
    });
    const [specialties, setSpecialties] = useState<string[]>(data?.specialties ?? []);
    const [specialty, setSpecialty] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const fileData = await uploadFile<{ data: { fileLocation: string } }>(file);
            setFormState((prev) => ({ ...prev, bannerImage: fileData.data?.fileLocation }));
            message.success("Banner image addedd successfully");
        } catch {
            message.error("Failed to upload cover image");
        } finally {
            setLoading(false);
        }
    };

    const removeBanner = () => {
        setFormState((prev) => ({ ...prev, bannerImage: "" }));
    };

    const handleSubmit = async () => {
        try {
            const payload = { ...formState, specialties };
            const res = await api.put<{ message: string; status: string }>("/users/api/v1/users/profile-settings", { body: payload });
            if (res.status === "OK") {
                message.success(res.message);
            }
        } catch {
            console.error("Failed to update profile");
        }
    };

    const addSpeciality = () => {
        setSpecialties((prev) => [...prev, specialty]);
        setSpecialty("");
    };

    const removeSpecialties = (i: string) => {
        setSpecialties((prev) => prev.filter((f) => f !== i));
    };

    const handleSpecilityChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSpecialty(value);
    };

    const handleKeyboardEvent = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSpeciality();
        }
    };

    return (
        <>
            <div className="grid lg:grid-cols-2 gap-8 mb-6">
                <BannerUpload loading={loading} image={formState.bannerImage} handleFileChange={handleFileChange} removeBanner={removeBanner} />
                <UserForm formState={formState} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
            </div>
            <div className="border rounded-xl p-4 mb-6 border-stroke-light">
                <h3 className="text-brand-blue mb-4">Specialties</h3>
                <p className="text-sm text-gray-600 mb-4">Add specialties to help buyers find you for specific types of vehicles</p>
                {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {specialties.map((i: string) => (
                            <div key={i} className="rounded-md border text-xs font-medium truncate border-transparent bg-accent hover:bg-accent/90 w-fit gap-3 flex items-center justify-between p-2">
                                <span>{i}</span>
                                <button type="button" onClick={() => removeSpecialties(i)} className="cursor-pointer">
                                    <CloseIcon className="h-2.5 w-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex space-x-2 mb-2">
                    <Input
                        label=""
                        type="text"
                        name="feature"
                        value={specialty}
                        onChange={handleSpecilityChange}
                        onKeyDown={handleKeyboardEvent}
                        maxLength={50}
                        parentClassName="w-full"
                        placeholder="Add a feature (e.g., Leather Seats, Navigation)"
                    />
                    <Button type="button" onClick={addSpeciality} variant="outline">
                        Add
                    </Button>
                </div>
            </div>
        </>
    );
}
