import {
    PackageIcon,
    BellIcon,
    MessageSquareIcon,
    TrendingUpIcon,
} from "@/components/Icons";
import Button from "@/elements/Button";
import { useState } from "react";

const list = [
    {
        id: "otherUpdates",
        icon: <PackageIcon className="h-4 w-4" />,
        label: "Order Updates",
        description: "Notifications about order status and delivery",
    },
    {
        id: "newMessages",
        icon: <MessageSquareIcon className="h-4 w-4" />,
        label: "New Messages",
        description: "Notifications when sellers send you messages",
    },
    {
        id: "priceDropAlerts",
        icon: <TrendingUpIcon className="h-4 w-4" />,
        label: "Price Drop Alerts",
        description: "Alert when prices drop on saved vehicles",
    },
    {
        id: "promotionalEmails",
        icon: "",
        label: "Promotional Emails",
        description: "Special deals and new vehicle listings",
    },
];

type PropsT = {
    onClose: () => void;
};

const initialFormState = {
    otherUpdates: false,
    newMessages: false,
    priceDropAlerts: false,
    promotionalEmails: false,
};

export default function EmailNotificationsModal({ onClose }: Readonly<PropsT>) {
    const [checkBoxes, setCheckBoxes] =
        useState<Record<string, boolean>>(initialFormState);

    return (
        <div className="w-md">
            <h2 className="text-lg leading-none font-semibold text-brand-blue flex items-center gap-2 mb-2">
                <BellIcon className="h-5 w-5 text-brand-blue" />
                Email Notifications
            </h2>
            <p className="text-muted-foreground text-sm">
                Choose which email notifications you want to receive
            </p>

            <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto">
                <div className="bg-white text-foreground rounded-xl border border-stroke-light p-6">
                    <div className="mb-4">
                        <h4 className="leading-none text-brand-blue mb-1.5">
                            Notification Preferences
                        </h4>
                        <p className="text-muted-foreground">
                            Manage your email notification settings
                        </p>
                    </div>
                    {list.map((item) => (
                        <label
                            key={item.id}
                            className="flex items-center justify-between py-3 border-b last:border-b-0 border-stroke-light"
                        >
                            <div className="flex-1">
                                <div className="text-sm leading-none font-medium flex items-center gap-2">
                                    {item.icon}
                                    {item.label}
                                </div>
                                <p className="text-sm text-gray-600 pointer-none">
                                    {item.description}
                                </p>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name={item.id}
                                    checked={checkBoxes[item.id]}
                                    onChange={(e) => {
                                        setCheckBoxes((prev) => ({
                                            ...prev,
                                            [item.id]: e.target.checked,
                                        }));
                                    }}
                                    className="peer sr-only group"
                                />
                                <div className="h-4.5 w-8 rounded-full bg-gray-300 peer-checked:bg-brand-blue transition-colors duration-300"></div>
                                <div className="absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all duration-300 peer-checked:translate-x-3.5"></div>
                            </div>
                        </label>
                    ))}
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        fullWidth={true}
                        size="sm"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        fullWidth={true}
                        size="sm"
                        onClick={onClose}
                    >
                        {" "}
                        Save Preferences
                    </Button>
                </div>
            </div>
        </div>
    );
}
