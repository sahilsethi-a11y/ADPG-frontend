"use client";
import { FormEvent, useState } from "react";
import { ArrowLeftIcon } from "@/components/Icons";
import Link from "next/link";
import type { User } from "@/components/login/LoginForm";
import { isValidEmail } from "@/lib/validationUtils";
import Input from "@/elements/Input";
import Button from "@/elements/Button";
import { FetchError } from "@/lib/api/shared";
import { api } from "@/lib/api/client-request";

const data = {
    title: "Reset Password",
    description: "Enter your registered email and phone number to reset your password",
};

type PropsT = {
    successCallback: (user: User) => void;
};

export default function EmailForm({ successCallback }: Readonly<PropsT>) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const validateForm = () => {
        if (email.trim() === "") {
            setError("Please enter your registered Email address.");
            return false;
        }
        if (phone.trim() === "") {
            setError("Please enter your registered Phone number.");
            return false;
        }
        if (!isValidEmail(email.trim())) {
            setError("Please enter valid email address.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            try {
                const payload = {
                    emailId: email,
                    phoneNumber: phone,
                };
                await api.post("/users/api/v1/users/send-otp", { body: payload });
                // if successfully otp trigger then switch the screen to verify otp
                successCallback(payload as User);
            } catch (error) {
                if ((error as FetchError).isFetchError) {
                    setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Invalid credentials");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="px-4 py-8 bg-gray-50">
                <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-black/10">
                    <h1 className="text-2xl text-center text-brand-blue mb-1">{data.title}</h1>
                    <p className="text-center text-gray-500 mb-6">{data.description}</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Registered Email Address"
                            value={email}
                            name="email"
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            type="email"
                            placeholder="Enter your email address"
                            aria-label="Email"
                            autoComplete="email"
                            className="py-3"
                            required
                        />

                        <Input
                            name="phone"
                            label="Registered Phone Number"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                setError("");
                            }}
                            type="tel"
                            className="py-3"
                            aria-label="Phone"
                            autoComplete="tel"
                            required
                        />
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-destructive text-sm" role="alert">
                                    {error}
                                </p>
                            </div>
                        )}
                        <Button type="submit" disabled={submitting} loading={submitting} size="lg" className="w-full">
                            Send Reset Code
                        </Button>
                        <Link
                            title="Back to Login"
                            href="/login"
                            className="border border-stroke-light rounded-lg hover:bg-accent flex items-center justify-center gap-2 text-sm text-black py-1.5 px-4">
                            <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to login
                        </Link>
                    </form>
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link title="Sign in" href="/login" className="hover:underline text-brand-blue">
                        Sign in here
                    </Link>
                </p>
            </div>
        </>
    );
}
