"use client";
import { EmailIcon, LockIcon, ResetIcon, Shield } from "@/components/Icons";
import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";

type PropsT = {
    onClose: () => void;
};

const OTP_RESEND_TIME = 6;

export default function BankUpdateOtp({ onClose }: Readonly<PropsT>) {
    const [submitting, setSubmitting] = useState(false);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [sendingReq, setSendingReq] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [otpResendTime, setOtpResendTime] = useState(OTP_RESEND_TIME);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    let user = null;
    try {
        const userData = localStorage.getItem("user");
        if (userData) {
            user = JSON.parse(userData);
        }
    } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
    }

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

    useEffect(() => {
        const sendOtp = async () => {
            try {
                await api.post("/users/api/v1/users/send-otp");
                startOtpResendTimer();
            } catch (err) {
                console.log(err);
            }
        };
        sendOtp();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        const payload = {
            email: user.emailId,
            mobile: user.phoneNumber,
            otp,
        };

        try {
            const res = await api.post<{ data: { verified: boolean } }>("users/api/v1/users/verify-otp", { body: payload });
            if (res.data?.verified) {
                router.push("/update-bank-details");
            }
        } catch (error) {
            console.log("error");

            setIsButtonDisabled(true);
            if ((error as FetchError).isFetchError) {
                setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Something went wrong. Please try again later.");
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
        const payload = {
            emailId: user.emailId,
            phoneNumber: user.phoneNumber,
        };
        try {
            await api.post("/users/api/v1/users/send-otp", { body: payload });
            startOtpResendTimer();
            setSendingReq(true);
            setTimeout(() => {
                setSendingReq(false);
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
            <div className="flex flex-col gap-2 text-center sm:text-left mb-4">
                <h2 className="text-lg leading-none font-semibold flex items-center text-brand-blue">
                    <Shield className="h-5 w-5 mr-2" />
                    Verify Bank Details Access
                </h2>
                <p className="text-muted-foreground text-sm">For your security, please verify your email address to access and edit your bank account details.</p>
            </div>
            <div className="space-y-6 overflow-auto max-h-[calc(100vh-100px)]">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <LockIcon className=" h-5 w-5 text-brand-blue mr-3 mt-0.5 shrink-0" />
                        <div className="text-sm text-gray-700">
                            <p className="font-medium text-brand-blue mb-1">Why we need verification</p>
                            <p className="text-xs">Bank details are sensitive information. Email verification ensures that only you can view or modify this data.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light">
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 [.border-b]:pb-6 pb-3">
                        <h4 className="text-sm flex items-center">
                            <EmailIcon className="h-4 w-4 mr-2 text-brand-blue" />
                            Email Verification
                            <span
                                className={`${
                                    sendingReq ? "bg-accent text-black" : "bg-brand-blue text-white"
                                } inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap- ml-2`}>
                                {sendingReq ? "sending..." : "sent"}
                            </span>
                        </h4>
                        <p className="text-xs text-gray-600">Code sent to: {user?.emailId || "Your email address"}</p>
                    </div>
                    <div className="px-6 last:pb-6 space-y-3">
                        <div className="flex space-x-2">
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
                                className="w-full px-1 py-3 bg-gray-100 rounded-lg placeholder-gray-400 text-brand-blue text-center"
                                aria-label="Otp"
                                autoComplete="one-time-code"
                            />
                            <EmailIcon className="h-4 w-4 text-blue-500" />
                        </div>
                        {otpResendTime > 0 ? (
                            <p className="text-xs text-gray-500 text-center">
                                Resend code in <span className="font-medium text-brand-blue">{otpResendTime}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={resendOtp}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 outline-none hover:text-brand-blue h-8 rounded-md gap-1.5 px-3 w-full text-brand-blue hover:bg-blue-50">
                                <ResetIcon className="h-3 w-3 mr-1" />
                                Resend Email Code
                            </button>
                        )}
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                                <p className="text-destructive text-sm" role="alert">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        title="Back to Login"
                        type="reset"
                        onClick={onClose}
                        className="border w-full border-stroke-light rounded-lg hover:bg-accent flex items-center justify-center gap-2 text-sm text-black py-1.5 px-4">
                        Cancel
                    </button>
                    <button
                        title="Back to Login"
                        disabled={submitting || isButtonDisabled}
                        type="submit"
                        onClick={handleSubmit}
                        className="border w-full border-stroke-light rounded-lg bg-brand-blue hover:bg-beand-blue-10 flex items-center justify-center gap-2 text-sm text-white py-1.5 px-4">
                        complete
                    </button>
                </div>
            </div>
        </>
    );
}
