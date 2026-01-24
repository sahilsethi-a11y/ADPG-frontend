"use client";
import { useState } from "react";
import EmailForm from "@/components/reset-password/EmailForm";
import VerifyOtp from "@/components/login/VerifyOtp";
import type { User } from "@/components/login/LoginForm";
import PasswordForm from "@/components/reset-password/PasswordForm";
import Thankyou from "@/components/reset-password/Thankyou";

export default function ResetPasswordForm() {
    const [step, setStep] = useState<"emailForm" | "verifyOtp" | "passwordForm" | "thankyou">("emailForm");
    const [user, setUser] = useState<User>();

    const emailCallback = (user: User) => {
        setUser(user);
        setStep("verifyOtp");
    };

    const renderStep = () => {
        switch (step) {
            case "emailForm":
                return <EmailForm successCallback={emailCallback} />;
            case "verifyOtp":
                return (
                    <VerifyOtp
                        successCallback={() => setStep("passwordForm")}
                        handleBack={() => setStep("emailForm")}
                        user={user}
                        ctaText="Verify Code"
                        inProgressCtaText="Verifying..."
                        backButtonCta="Back"
                    />
                );
            case "passwordForm":
                return <PasswordForm user={user} successCallback={() => setStep("thankyou")} />;
            case "thankyou":
                return <Thankyou />;
            default:
                return <></>;
        }
    };

    return <div className="px-4 py-8 bg-gray-50">{renderStep()}</div>;
}
