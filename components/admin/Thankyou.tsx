"use client";

import { CheckIcon, CloseIcon, CopyIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";
import { useState } from "react";
import type { ThankyouData } from "@/components/admin/AddDealerForm";

const data = {
    title: "Dealer Created Successfully",
    description: "Review the dealer details and copy the temporary password to share with the new dealer.",
    alert: {
        type: "success",
        message: "Dealer account has been created successfully. Please share the temporary password with the dealer.",
    },
    note: "This is a single-use password. The dealer will be required to reset it on first login.",
};

export default function Thankyou({ user, onClose }: Readonly<{ user: ThankyouData; onClose?: () => void }>) {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordCopied, setPasswordCopied] = useState(false);

    const copyPassword = (password: string) => {
        setPasswordCopied(true);
        navigator.clipboard.writeText(password);
        setTimeout(() => setPasswordCopied(false), 2000);
    };

    return (
        <div>
            <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                <CloseIcon />
            </button>
            <h2 className="text-lg font-medium mb-4">{data.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{data.description}</p>
            <div data-slot="alert" role="alert" className="w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[0_1fr] text-card-foreground border-green-200 bg-green-50 mb-4">
                <div data-slot="alert-description" className="col-start-2 grid justify-items-start gap-1 text-sm  text-green-800">
                    {data.alert.message}
                </div>
            </div>
            <h3 className="text-sm mb-2">Dealer Details:</h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm mb-2">
                <p>
                    <span className="font-medium">Dealership Name: </span>
                    {user.rolemetadata.dealershipName}
                    {}
                </p>
                <p>
                    <span className="font-medium">Representative Name: </span>
                    {user.name}
                </p>
                <p>
                    <span className="font-medium">Email: </span> {user.emailId}
                </p>
                <p>
                    <span className="font-medium">Mobile Number: </span> {user.mobileno}
                </p>
                <p>
                    <span className="font-medium">Dealer Address: </span> {user.rolemetadata.address}
                </p>
                <p>
                    <span className="font-medium">Representative DOB: </span> {user.rolemetadata.dob}
                </p>
                {user.locationAttribute.emirate && (
                    <p>
                        <span className="font-medium">Emirate: </span>
                        {user.locationAttribute.emirate}
                    </p>
                )}
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-800 mb-2">
                    Temporary Password:{" "}
                    <span className="text-red-500" aria-hidden="true">
                        *
                    </span>
                </label>
                <div className="flex gap-2 items-center mb-2">
                    <input
                        id="password"
                        readOnly
                        defaultValue={user.password}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg placeholder-gray-400 text-brand-blue"
                        aria-label="Password"
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer border border-stroke-light rounded-md hover:bg-accent px-4 py-3">
                        {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => copyPassword(user.password)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer border border-stroke-light rounded-md hover:bg-accent px-4 py-3">
                        {passwordCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                </div>
                <p className="text-xs text-gray-600">{data.note}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="mt-4 bg-brand-blue text-white text-sm px-4 py-2 rounded-md">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
