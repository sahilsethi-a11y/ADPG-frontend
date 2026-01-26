"use client";

import { CallIcon, CloseIcon, DownloadIcon, EmailIcon, FileIcon, LocationIcon, UserIcon } from "@/components/Icons";
import { type User } from "@/components/admin/UsersTable";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";
import { downloadFile } from "@/lib/utils";
import { useState } from "react";

export default function EditUser({ onClose, user }: Readonly<{ onClose: (isRefresh?: boolean) => void; user: User | null }>) {
    const [activeTab, setActiveTab] = useState<"userInfo" | "document">("userInfo");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: user?.emailId || "",
        phone: user?.phoneNumber || "",
        address: user?.roleMetaData?.address || "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsButtonDisabled(false);
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const updateUser = async () => {
        const payload = {
            id: user?.id,
            roleId: user?.roleId,
            emailId: formData.email,
            phoneNumber: formData.phone,
            roleMetaData: {
                address: formData.address,
            },
        };
        try {
            await api.put("/users/api/v1/users/edit", { body: payload });
            onClose(true);
        } catch (error) {
            if ((error as FetchError).isFetchError) {
                setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Faild to update user. Please try again later.");
            } else {
                setError("Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <div className="relative text-brand-blue">
            <button onClick={() => onClose()} className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                <CloseIcon />
            </button>
            <h2 className="text-lg font-medium ">Edit User Details</h2>
            <p className="mb-4 text-xs text-gray-500">View and edit user information, documents, and account settings</p>
            <nav className="bg-muted text-foreground w-fit items-center justify-center rounded-full flex p-1">
                <button onClick={() => setActiveTab("userInfo")} className={`px-2 py-1 text-xs font-semibold rounded-full ${activeTab === "userInfo" ? "bg-background" : "bg-transparent"}`}>
                    User Details
                </button>
                <button onClick={() => setActiveTab("document")} className={`px-2 py-1 text-xs font-semibold rounded-full ${activeTab === "document" ? "bg-background" : "bg-transparent"}`}>
                    Documents
                </button>
            </nav>
            {user && (
                <div>
                    {activeTab === "userInfo" && (
                        <div className="space-y-4 mt-4 max-h-[60vh] overflow-auto">
                            <div className="border rounded-xl border-stroke-light p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <UserIcon className="w-5 h-5" />
                                    <span>Basic Information</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="userId" className="block text-sm font-medium text-gray-800 mb-2">
                                            User ID
                                        </label>
                                        <input
                                            id="userId"
                                            defaultValue={user.id}
                                            placeholder="Enter your User ID"
                                            className="w-full px-4 py-1 bg-gray-100/50 rounded-lg placeholder-gray-400 text-brand-blue"
                                            aria-label="User ID"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="userRole" className="block text-sm font-medium text-gray-800 mb-2">
                                            User Type
                                        </label>
                                        <input
                                            id="userRole"
                                            defaultValue={user.roleType}
                                            placeholder="Enter your userRole"
                                            className="w-full px-4 py-1 bg-gray-100/50 rounded-lg placeholder-gray-400 text-brand-blue"
                                            aria-label="User Role"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-2">
                                            Name
                                        </label>
                                        <input
                                            id="username"
                                            defaultValue={user.name}
                                            placeholder="Enter your username"
                                            className="w-full px-4 py-1 bg-gray-100/50 rounded-lg placeholder-gray-400 text-brand-blue"
                                            aria-label="User Role"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border rounded-xl border-stroke-light p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <CallIcon className="w-5 h-5" />
                                    <span>Contact Information</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                                            <EmailIcon className="h-4 w-4" /> Email Address
                                        </label>
                                        <input
                                            id="userId"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your Email Address"
                                            className="w-full px-4 py-1 bg-gray-100 rounded-lg placeholder-gray-400 text-brand-blue"
                                            aria-label="Email Address"
                                            autoCapitalize="email"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                            <CallIcon className="h-4 w-4" /> Representative Mobile
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            onChange={handleInputChange}
                                            placeholder="Enter your phone number"
                                            value={formData.phone}
                                            type="tel"
                                            className="w-full px-4 py-1 bg-gray-100 rounded-lg placeholder-gray-400 text-brand-blue"
                                            aria-label="Phome"
                                            autoComplete="tel"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border rounded-xl border-stroke-light p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <LocationIcon className="w-5 h-5" />
                                    <span>Address Information</span>
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        onChange={handleInputChange}
                                        value={formData.address}
                                        rows={3}
                                        className="w-full px-3 py-1 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                                        placeholder="Enter complete dealer address"
                                    />
                                </div>
                            </div>
                            {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
                            <div className="flex gap-4 justify-end">
                                <button
                                    title="Cancel"
                                    type="reset"
                                    onClick={() => onClose()}
                                    className="border border-stroke-light rounded-lg hover:bg-accent flex items-center justify-center gap-2 text-sm text-black py-1.5 px-4">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={updateUser}
                                    disabled={isButtonDisabled}
                                    className="bg-brand-blue text-white py-1 px-3 rounded-lg shadow-sm hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === "document" && (
                        <div className="space-y-4 mt-4 max-h-[60vh] overflow-auto">
                            <div className="border rounded-xl border-stroke-light p-6">
                                <div className="flex items-center space-x-4 mb-5">
                                    <FileIcon className="w-5 h-5 text-black" />
                                    <span>Uploaded Documents</span>
                                </div>
                                {user?.roleMetaData?.nationalIdOrPassportUrl && (
                                    <div className="border rounded-xl border-stroke-light p-4 mb-4">
                                        <div className="flex gap items-center gap-3">
                                            <FileIcon className="w-5 h-5 text-black" />
                                            <div>
                                                <div className="font-medium text-black">Passport copy</div>
                                                <div className="mt-1 text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(user.roleMetaData?.nationalIdOrPassportUrl)}
                                                type="button"
                                                className="p-2 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {user.roleMetaData?.emiratesIdUrl && (
                                    <div className="border rounded-xl border-stroke-light p-4 mb-4">
                                        <div className="flex gap items-center gap-3">
                                            <FileIcon className="w-5 h-5 text-black" />
                                            <div>
                                                <div className="font-medium text-black">Emirates ID</div>
                                                <div className="mt-1 text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(user.roleMetaData?.emiratesIdUrl)}
                                                type="button"
                                                className="p-2 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {user.roleMetaData?.companyLicenseUrl && (
                                    <div className="border rounded-xl border-stroke-light p-4 mb-4">
                                        <div className="flex gap items-center gap-3">
                                            <FileIcon className="w-5 h-5 text-black" />
                                            <div>
                                                <div className="font-medium text-black">Company license</div>
                                                <div className="mt-1 text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(user.roleMetaData?.companyLicenseUrl)}
                                                type="button"
                                                className="p-2 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {user.roleMetaData?.exportLicenseUrl && (
                                    <div className="border rounded-xl border-stroke-light p-4 mb-4">
                                        <div className="flex gap items-center gap-3">
                                            <FileIcon className="w-5 h-5 text-black" />
                                            <div>
                                                <div className="font-medium text-black">Export license</div>
                                                <div className="mt-1 text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(user.roleMetaData?.exportLicenseUrl)}
                                                type="button"
                                                className="p-2 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {user.roleMetaData?.passportUrl && (
                                    <div className="border rounded-xl border-stroke-light p-4 mb-4">
                                        <div className="flex gap items-center gap-3">
                                            <FileIcon className="w-5 h-5 text-black" />
                                            <div>
                                                <div className="font-medium text-black">Passport</div>
                                                <div className="mt-1 text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(user.roleMetaData?.passportUrl)}
                                                type="button"
                                                className="p-2 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
