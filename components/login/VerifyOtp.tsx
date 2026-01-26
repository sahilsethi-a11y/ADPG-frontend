"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, EmailIcon, Spinner } from "@/components/Icons";
import Link from "next/link";
import type { User } from "@/components/login/LoginForm";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";

type PropsT = {
    handleBack: () => void;
    successCallback: () => void;
    user?: User;
    ctaText?: string;
    inProgressCtaText?: string;
    backButtonCta?: string;
    actionType?: string;
};

const OTP_RESEND_TIME = 60;

export default function VerifyOtp({
    handleBack,
    successCallback,
    user,
    ctaText = "Verify & Sign In",
    inProgressCtaText = "Signing in...",
    backButtonCta = "Back to login",
    actionType,
}: Readonly<PropsT>) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [otp, setOtp] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [otpResendTime, setOtpResendTime] = useState(OTP_RESEND_TIME);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startOtpResendTimer();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const startOtpResendTimer = () => {
        // Clear any running timer first
        if (intervalRef.current) clearInterval(intervalRef.current);

        setOtpResendTime(OTP_RESEND_TIME);
        intervalRef.current = setInterval(() => {
            setOtpResendTime((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (submitting || !user) return;
        setSubmitting(true);

        const payload: Record<string, any> = {
            otp,
        };

        // Add userId if available, otherwise use email and mobile
        if (user.id) {
            payload.userId = user.id;
        } else if (user.emailId && user.phoneNumber) {
            payload.email = user.emailId;
            payload.mobile = user.phoneNumber;
        }

        if (actionType) {
            payload.actionType = actionType;
        }

        try {
            console.log("Sending OTP verification payload:", payload);
            const res = await api.post<{ data: { verified: boolean } }>("/users/api/v1/users/verify-otp", { body: payload });
            console.log("OTP verification response:", res);
            if (res.data?.verified) {
                successCallback();
            }
        } catch (error) {
            setIsButtonDisabled(true);
            console.error("OTP verification error:", error);
            if ((error as FetchError).isFetchError) {
                const errorMsg = (error as FetchError<{ message: string }>)?.response?.data?.message || "OTP verification failed.";
                setError(errorMsg);
            } else {
                setError("Something went wrong. Please try again later.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resendOtp = async () => {
        setError("");
        setOtp("");
        setIsButtonDisabled(true);
        if (!user) return;
        const payload = { userId: user.id, emailId: user.emailId, phoneNumber: user.phoneNumber };
        try {
            await api.post("/users/api/v1/users/send-otp", { body: payload });
            startOtpResendTimer();
            setSuccessMsg("OTP resent successfully");
            setTimeout(() => {
                setSuccessMsg("");
            }, 3000);
        } catch (error) {
            if ((error as FetchError).isFetchError) {
                setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Something went wrong. Please try again later.");
            } else {
                setError("Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <>
            <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-black/10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand-blue">
                    <EmailIcon className="text-white" />
                </div>
                <h1 className="text-2xl text-center text-brand-blue mb-1">Verify Your Email</h1>
                <p className="text-center text-gray-500 mb-6">
                    <span>We&apos;ve sent a 6-digit verification code to</span>
                    <span className="block font-medium">{user?.emailId || "Your email address"}</span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-800 mb-2">
                            Enter Otp
                        </label>
                        <input
                            id="otp"
                            autoFocus
                            value={otp}
                            onChange={(e) => {
                                if (e.target.value.length > 6) return;
                                if (e.target.value.length === 6) {
                                    setIsButtonDisabled(false);
                                } else {
                                    setIsButtonDisabled(true);
                                }
                                setOtp(e.target.value);
                                setError("");
                            }}
                            type="number"
                            placeholder="Enter 6-digit code"
                            className="w-full px-4 py-3 bg-gray-100 rounded-lg placeholder-gray-400 text-brand-blue text-center"
                            aria-label="Otp"
                            autoComplete="one-time-code"
                        />
                    </div>
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                            <p className="text-destructive text-sm" role="alert">
                                {error}
                            </p>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={submitting || isButtonDisabled}
                        className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold shadow-sm hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2">
                        {submitting && <Spinner />}
                        {submitting ? inProgressCtaText : ctaText}
                    </button>
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
                        {otpResendTime > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Resend code in <span className="font-medium text-brand-blue">{otpResendTime}s</span>
                            </p>
                        ) : (
                            <button type="button" onClick={resendOtp} className="text-sm hover:underline font-medium text-brand-blue cursor-pointer">
                                Resend Code
                            </button>
                        )}
                    </div>
                    {successMsg && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                            <p className="text-green-700 text-sm" role="alert">
                                {successMsg}
                            </p>
                        </div>
                    )}
                    <button
                        title="Back to Login"
                        type="reset"
                        onClick={handleBack}
                        className="border w-full border-stroke-light rounded-lg hover:bg-accent flex items-center justify-center gap-2 text-sm text-black py-1.5 px-4">
                        <ArrowLeftIcon className="h-3.5 w-3.5" /> {backButtonCta}
                    </button>
                </form>
            </div>
            <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                    {"Don't have an account? "}
                    <Link title="Sign up" href="/signup" className="hover:underline text-brand-blue">
                        Sign up here
                    </Link>
                </p>
            </div>
        </>
    );
}
