"use client";

import { useState } from "react";
import { UserIcon, EmailIcon, CallIcon, LocationIcon, SettingIcon } from "@/components/Icons";
import Button from "@/elements/Button";
import Modal from "@/elements/Modal";
import EditProfileModal from "@/components/buyer/EditProfileModal";

export type User = {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
};

export default function PersonalInfo({ user }: Readonly<{ user: User }>) {
    const [editProfile, setEditProfile] = useState(false);
    return (
        <>
            <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                <h4 className="leading-none text-brand-blue">Personal Information</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-brand-blue" />
                        <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="text-brand-blue">{user.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <EmailIcon className="h-5 w-5 text-brand-blue" />
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-brand-blue">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <CallIcon className="h-5 w-5 text-brand-blue" />
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="text-brand-blue">{user.phoneNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <LocationIcon className="h-5 w-5 text-brand-blue" />
                        <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-brand-blue">{user.address}</p>
                        </div>
                    </div>
                    <Button fullWidth={true} leftIcon={<SettingIcon className="h-4 w-4 text-white mr-2" />} onClick={() => setEditProfile(true)}>
                        Edit Profile
                    </Button>
                </div>
            </div>
            <Modal isOpen={editProfile} onClose={() => setEditProfile(false)} showCloseButton={true}>
                <EditProfileModal user={user} onClose={() => setEditProfile(false)} />
            </Modal>
        </>
    );
}
