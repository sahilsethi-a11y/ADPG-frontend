"use client";
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import SetPassword from "@/components/SetPassword";
import { Shield, CheckCircleIcon, ArrowLeftIcon } from "@/components/Icons";
import Link from "next/link";
import { isValidPassword } from "@/lib/validationUtils";

const data = {
    agreement: {
        title: "Agreement Summary",
        subTitle: "By creating a buyer account on ADPG Auto Marketplace, you agree to:",
        list: [
            "Provide accurate and complete information during registration",
            "Use the platform responsibly and in accordance with our policies",
            "Comply with all applicable laws and regulations",
            "Maintain the security and confidentiality of your account",
            "Make payments for purchased vehicles through our secure platform",
        ],
    },
    keyBenefits: {
        title: "Key Benefits as a Buyer:",
        list: ["Access to verified vehicles", "Secure payment processing", "Professional vehicle inspections", "Dedicated customer support"],
    },
};

type PropsT = {
    setStep: Dispatch<SetStateAction<number>>;
    finalCallBack: (password: string, confirmPassword: string) => void;
    error?: string;
    resetError?: () => void;
};

export default function TncForm({ setStep, finalCallBack, resetError, error }: Readonly<PropsT>) {
    const [checked, setChecked] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [tncError, setTncError] = useState(error);

    useEffect(() => {
        setTncError(error);
    }, [error]);

    const handlePasswordChange = (value: string) => {
        setPasswordError("");
        setPassword(value);
    };

    const handleConfirmPasswordChange = (value: string) => {
        setPasswordError("");
        setConfirmPassword(value);
    };

    const handleSubmit = () => {
        if (password !== confirmPassword) {
            setPasswordError("Confirm password and password do not match");
            return;
        }
        if (!isValidPassword(confirmPassword.trim())) {
            setPasswordError("Password must contain at least 8 characters, including uppercase, lowercase, number, and special character");
            return;
        }
        if (!checked) {
            setTncError("Please accept terms & condition");
            return;
        }
        finalCallBack(password, confirmPassword);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 shrink-0" />
                    <div>
                        <p className="text-green-800 font-medium">KYC Successful</p>
                        <p className="text-green-700 text-sm">Your identity verification has been completed successfully</p>
                    </div>
                </div>
                <div className="text-center mb-6">
                    <h3 className="text-lg mb-2 text-[#202C4A]">Complete Your Registration</h3>
                    <p className="text-gray-600 text-sm">Set your password and review our terms to complete your account setup</p>
                </div>
                <SetPassword error={passwordError} password={password} confirmPassword={confirmPassword} setConfirmPassword={handleConfirmPasswordChange} setPassword={handlePasswordChange} />
                <div className="rounded-xl border border-brand-blue bg-blue-50 p-6">
                    <h4 className="font-medium text-brand-blue mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {data.agreement.title}
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p>{data.agreement.subTitle} </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            {data.agreement.list.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-brand-blue mb-3">{data.keyBenefits.title}</h5>
                    <ul className="grid md:grid-cols-2 gap-2">
                        {data.keyBenefits.list.map((item) => (
                            <li key={item} className="text-sm text-gray-600 flex items-center">
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                            setTncError("");
                            setChecked((prev) => !prev);
                        }}
                        id="terms"
                        className="mt-1 h-4 w-4 rounded border border-brand-blue bg-accent/40 accent-brand-blue"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                        I acknowledge that I have read, understood, and agree to the{" "}
                        <Link href={"/"} className="text-brand-blue hover:underline font-medium">
                            Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href={"/"} className="text-brand-blue hover:underline font-medium">
                            Privacy Policy
                        </Link>{" "}
                        of ADPG Auto Marketplace.
                    </label>
                </div>
            </div>
            {tncError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                    <p className="text-destructive text-sm" role="alert">
                        {tncError}
                    </p>
                </div>
            )}
            <div className="flex justify-between gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => {
                        setStep((prev) => prev - 1);
                        resetError?.();
                    }}
                    className="inline-flex items-center justify-center gap-2 text-brand-blue border border-brand-blue hover:bg-brand-blue hover:text-white px-4 py-2 h-9 rounded-md whitespace-nowrap">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm/4.25 font-medium">Previous</span>
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center justify-center gap-1.2 bg-brand-blue h-9 px-4 py-2 rounded-md text-white hover:bg-primary-hover whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="text-xs/4.25 font-medium">Complete Registration</span>
                    <CheckCircleIcon className="h-3.5 w-3.5 ml-2 lg:ml-2" />
                </button>
            </div>
        </>
    );
}
