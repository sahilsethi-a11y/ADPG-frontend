"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";
import Link from "next/link";
import type { User } from "@/components/login/LoginForm";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";
import Button from "@/elements/Button";
import Input from "@/elements/Input";

const data = {
    title: "Welcome Back",
    description: "Sign in to your ADPG Auto Marketplace account",
};

type PropsT = {
    successCallback: (user: User) => void;
};

export default function SignIn({ successCallback }: Readonly<PropsT>) {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const validateForm = ({ username, password }: { username: string; password: string }) => {
        if (username.trim() === "") {
            setError("Please enter your User ID.");
            return false;
        }
        if (password.trim() === "") {
            setError("Please enter your Password.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (submitting || !validateForm(formData)) return;
        setSubmitting(true);

        try {
            try {
                const res = await api.post<{ data: { user: User } }>("/api/v1/auth/login", { body: formData });

                // trigger otp if success response from login api
                const user: User = res.data?.user;

                if (user?.id) {
                    try {
                        api.post("/users/api/v1/users/send-otp", { body: { userId: user.id } });
                        // if successfully otp trigger then switch the screen to verify otp
                        successCallback(user);
                    } catch (error) {
                        if ((error as FetchError).isFetchError) {
                            setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Something went wrong. Please try again later.");
                        } else {
                            setError("Something went wrong. Please try again later.");
                        }
                    }
                }
            } catch (error) {
                if ((error as FetchError).isFetchError) {
                    setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Something went wrong. Please try again later.");
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
            <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-black/10">
                <h1 className="text-2xl text-center text-brand-blue mb-1">{data.title}</h1>
                <p className="text-center text-gray-500 mb-6">{data.description}</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email ID"
                        id="username"
                        value={formData.username}
                        onChange={(e) => {
                            setFormData((prev) => ({ ...prev, username: e.target.value }));
                            setError("");
                        }}
                        placeholder="Enter your User ID"
                        aria-label="User ID"
                        autoComplete="username"
                        required
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            id="password"
                            value={formData.password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setFormData((prev) => ({ ...prev, password: e.target.value }));
                                setError("");
                            }}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            aria-label="Password"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-11.5 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                            {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                        </button>
                    </div>
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-destructive text-sm" role="alert">
                                {error}
                            </p>
                        </div>
                    )}
                    <Button type="submit" loading={submitting} disabled={submitting} size="lg" className="w-full">
                        {submitting ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center text-sm">
                        <Link title="Forget password" href="/reset-password" className="hover:underline text-brand-blue">
                            Forgot your password?
                        </Link>
                    </div>
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
