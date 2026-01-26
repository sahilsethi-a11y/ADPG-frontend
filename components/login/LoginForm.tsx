"use client";
import { useState } from "react";
import SignIn from "@/components/login/SignIn";
import VerifyOtp from "@/components/login/VerifyOtp";
import { useRouter } from "next/navigation";

export type User = {
    emailId: string;
    id?: string;
    username?: string;
    phoneNumber?: string;
    passwordTemporary?: boolean;
    roleId?: string;
    roleType?: string;
};

export default function LoginForm({ redirectUrl }: Readonly<{ redirectUrl?: string }>) {
    const [step, setStep] = useState<"signIn" | "verifyOtp">("signIn");
    const [user, setUser] = useState<User>();
    const router = useRouter();

    const signInCallback = (user: User) => {
        setUser(user);
        setStep("verifyOtp");
    };

    const verifyOtpCallback = () => {
        if (user?.passwordTemporary) {
            router.push("/reset-password");
            return;
        }
        if (redirectUrl) {
            router.push(redirectUrl);
            router.refresh();
            return;
        }
        switch (user?.roleType?.toLowerCase()) {
            case "admin":
                router.push("/admin/dashboard");
                router.refresh();
                break;
            case "seller":
                router.push("/seller/dashboard");
                router.refresh();
                break;
            case "buyer":
                router.push("/buyer/dashboard");
                router.refresh();
                break;
            case "dealer":
                router.push("/dealer/dashboard");
                router.refresh();
                break;
            default:
                break;
        }
    };

    const renderStep = () => {
        switch (step) {
            case "signIn":
                return <SignIn successCallback={signInCallback} />;
            case "verifyOtp":
                return <VerifyOtp actionType="login" successCallback={verifyOtpCallback} handleBack={() => setStep("signIn")} user={user} />;
            default:
                return <></>;
        }
    };

    return <div className="px-4 py-8 bg-gray-50">{renderStep()}</div>;
}
