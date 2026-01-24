"use client";
import { useState } from "react";
import {
    CheckCircleIcon,
    CopyIcon,
    FacebookICon,
    LinkedInIcon,
    QrCodeIcon,
    TwitterIcon,
    WhatsAppIcon,
} from "@/components/Icons";
import Modal from "@/elements/Modal";
import Link from "next/link";
import QRCode from "react-qr-code";

type PropsT = {
    vehicleUrl: string;
    iconCls?: string;
    btnCls?: string;
};

export default function QRShare({
    btnCls,
    vehicleUrl,
    iconCls = "h-5 w-5 text-brand-blue",
}: Readonly<PropsT>) {
    const [isQROpen, setIsQROpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    const url = globalThis.window?.location.origin + vehicleUrl;
    const encodedUrl = encodeURIComponent(url);
    const text = encodeURIComponent("Check this vehicle!");

    const icons = [
        {
            label: "Whatsapp",
            cls: "border-green-500 text-green-600 hover:bg-green-50",
            icon: <WhatsAppIcon className="h-4 w-4" />,
            url: `https://wa.me/?text=${text}%20${encodedUrl}`,
        },
        {
            label: "Facebook",
            cls: "border-blue-500 text-blue-600 hover:bg-blue-50",
            icon: <FacebookICon className="h-4 w-4" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            label: "Twitter",
            cls: "border-sky-500 text-sky-600 hover:bg-sky-50",
            icon: <TwitterIcon className="h-4 w-4" />,
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
        },
        {
            label: "LinkedIn",
            cls: "border-blue-700 text-blue-700 hover:bg-blue-50",
            icon: <LinkedInIcon className="h-4 w-4" />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        },
    ];

    return (
        <>
            <button
                className={`w-10 h-10 rounded-full ${
                    btnCls ?? "bg-gray-100"
                } hover:bg-gray-200 flex items-center justify-center transition-colors`}
                aria-expanded="false"
                aria-haspopup="dialog"
                aria-controls="qr-scan"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsQROpen(!isQROpen);
                }}
            >
                <QrCodeIcon className={iconCls} />
            </button>
            <Modal
                isOpen={isQROpen}
                onClose={() => setIsQROpen(!isQROpen)}
                showCloseButton={true}
            >
                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <h2 className="text-lg leading-none font-semibold">
                        Share Vehicle
                    </h2>
                </div>
                <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-white border-2 border-gray-100 rounded-lg">
                            <QRCode value={url} />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                            Scan to view 2023 Mercedes-Benz E-Class
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Share on social media:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {icons.map((i) => (
                                <Link
                                    href={i.url}
                                    target="_blank"
                                    key={i.label}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 border bg-white hover:text-accent-foreground h-8 rounded-md px-3 flex items-center gap-2 ${i.cls}`}
                                >
                                    {i.icon}
                                    {i.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 border-t border-stroke-light">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy();
                            }}
                            className="justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 border bg-white  h-8 rounded-md px-3  w-full flex items-center gap-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                        >
                            {copied ? (
                                <CheckCircleIcon className="h-4 w-4" />
                            ) : (
                                <CopyIcon className="h-4 w-4" />
                            )}
                            Copy Link
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
