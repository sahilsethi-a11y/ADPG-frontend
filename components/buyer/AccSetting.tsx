"use client";
import Button from "@/elements/Button";
import Modal from "@/elements/Modal";
import { useState } from "react";
import EmailNotifications from "@/components/buyer/EmailNotificationsModal";
import PrivacySettingModal from "@/components/buyer/PrivacySettingModal";
import { CreditCardIcon } from "@/components/Icons";

export default function AccSetting() {
    const [manageEmail, setManageEmail] = useState(false);
    const [privacySettings, setPrivacySettings] = useState(false);

    return (
        <>
            <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                <h4 className="leading-none text-brand-blue">
                    Account Settings
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stroke-light">
                        <div>
                            <p className="text-brand-blue">
                                Email Notifications
                            </p>
                            <p className="text-sm text-gray-600">
                                Get updates about your orders
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManageEmail(true)}
                        >
                            Manage
                        </Button>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-stroke-light">
                        <div>
                            <p className="text-brand-blue">Payment Methods</p>
                            <p className="text-sm text-gray-600">
                                Manage your saved cards
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={
                                <CreditCardIcon className="h-4 w-4 mr-2" />
                            }
                        >
                            Manage
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-brand-blue">Privacy Settings</p>
                            <p className="text-sm text-gray-600">
                                Control your data preferences
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrivacySettings(true)}
                        >
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={manageEmail}
                onClose={() => setManageEmail(false)}
                showCloseButton={true}
            >
                <EmailNotifications onClose={() => setManageEmail(false)} />
            </Modal>

            <Modal
                isOpen={privacySettings}
                onClose={() => setPrivacySettings(false)}
                showCloseButton={true}
            >
                <PrivacySettingModal
                    onClose={() => setPrivacySettings(false)}
                />
            </Modal>
        </>
    );
}
