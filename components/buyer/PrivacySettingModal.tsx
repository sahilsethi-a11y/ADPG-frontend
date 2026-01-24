"use client";
import { useState } from "react";
import { DeleteIcon, DownloadIcon, Shield } from "@/components/Icons";
import Button from "@/elements/Button";

type PropsT = {
    onClose: () => void;
};

export default function PrivacySettingModal({ onClose }: Readonly<PropsT>) {
    const [showContactInfo, setShowContactInfo] = useState(false);

    return (
        <div className="w-md">
            <h2 className="text-lg leading-none font-semibold text-brand-blue flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-brand-blue" />
                Privacy Settings
            </h2>
            <p className="text-muted-foreground text-sm">
                Manage your privacy preferences and data
            </p>

            <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto">
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                    <div>
                        <h4 className="leading-none text-brand-blue mb-1">
                            Profile Privacy
                        </h4>
                        <p className="text-muted-foreground">
                            Control what information is visible to others
                        </p>
                    </div>
                    <label className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="text-sm leading-none font-medium flex items-center gap-2">
                                Show Contact Information
                            </div>
                            <p className="text-sm text-gray-600 pointer-none">
                                Allow sellers to see your contact details
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type="checkbox"
                                name="showContactInfo"
                                checked={showContactInfo}
                                onChange={() =>
                                    setShowContactInfo((prev) => !prev)
                                }
                                className="peer sr-only group"
                            />
                            <div className="h-4.5 w-8 rounded-full bg-gray-300 peer-checked:bg-brand-blue transition-colors duration-300"></div>
                            <div className="absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all duration-300 peer-checked:translate-x-3.5"></div>
                        </div>
                    </label>
                </div>
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                    <div>
                        <h4 className="leading-none text-brand-blue mb-1">
                            Data Management
                        </h4>
                        <p className="text-muted-foreground">
                            Manage your personal data
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Button
                            leftIcon={<DownloadIcon className="h-4 w-4 mr-2" />}
                            variant="outline"
                            size="sm"
                            fullWidth={true}
                            className="hover:bg-blue-50 hover:text-accent-foreground"
                        >
                            Download Personal Data
                        </Button>
                        <div className="border-t border-stroke-light" />
                        <Button
                            leftIcon={<DeleteIcon className="h-4 w-4 mr-2" />}
                            variant="danger"
                            size="sm"
                            fullWidth={true}
                            className="bg-white border border-red-600 text-red-600 hover:text-accent-foreground hover:bg-red-50 cursor-pointer"
                        >
                            Delete Account/Data
                        </Button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        fullWidth={true}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button fullWidth={true} size="sm" onClick={onClose}>
                        {" "}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
