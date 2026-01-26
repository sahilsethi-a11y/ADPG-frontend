"use client";
import { useState } from "react";
import { EyeIcon, EyeOffIcon, Spinner } from "@/components/Icons";
import Link from "next/link";
import type { User } from "@/components/login/LoginForm";
import { isValidPassword } from "@/lib/validationUtils";
import { FetchError } from "@/lib/api/shared";
import { api } from "@/lib/api/client-request";

const data = {
    title: "Create New Password",
    description: "Choose a strong password for your account",
};

type PropsT = {
    successCallback: () => void;
    user?: User;
};

export default function PasswordForm({ user, successCallback }: Readonly<PropsT>) {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false,
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validateForm = ({ password, confirmPassword }: { password: string; confirmPassword: string }) => {
        if (password.trim() === "") {
            setError("Please enter your new password.");
            return false;
        }
        if (confirmPassword.trim() === "") {
            setError("Please confirm your new password.");
            return false;
        }
        if (!isValidPassword(password.trim())) {
            setError("Password must be at least 8 characters and include a number, an uppercase letter, and a special character.");
            return false;
        }
        if (password.trim() !== confirmPassword.trim()) {
            setError("Passwords do not match. Please try again.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting || !validateForm(formData)) return;
        setSubmitting(true);
        try {
            const payload = {
                emailId: user?.emailId,
                newPassword: formData.password,
                confirmPassword: formData.confirmPassword,
                userId: user?.id,
                phoneNumber: user?.phoneNumber,
            };
            await api.post("/users/api/v1/users/forgot/reset-password", { body: payload });
            // Handle success
            successCallback();
        } catch (error) {
            if ((error as FetchError).isFetchError) {
                setError((error as FetchError<{ message: string }>)?.response?.data?.message || "Something went wrong. Please try again later.");
            } else {
                setError("Something went wrong. Please try again later.");
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
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-800 mb-2">
                                New Password{" "}
                                <span className="text-red-500" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, password: e.target.value }));
                                        setError("");
                                    }}
                                    type={showPassword.password ? "text" : "password"}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 bg-gray-100 rounded-lg placeholder-gray-400 text-brand-blue"
                                    aria-label="Password"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => ({ ...prev, password: !prev.password }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                                    {showPassword.password ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-2">
                                Confirm New Password{" "}
                                <span className="text-red-500" aria-hidden="true">
                                    *
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                                        setError("");
                                    }}
                                    type={showPassword.confirmPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 bg-gray-100 rounded-lg placeholder-gray-400 text-brand-blue"
                                    aria-label="Password"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                                    {showPassword.confirmPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Password must contain:</p>
                            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                                <li>• At least 8 characters</li>
                                <li>• One uppercase letter</li>
                                <li>• One number</li>
                                <li>• One special character</li>
                            </ul>
                        </div>
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-destructive text-sm" role="alert">
                                    {error}
                                </p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold shadow-sm hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2">
                            {submitting && <Spinner />}
                            {submitting ? "Resetting Password..." : "Reset Password"}
                        </button>
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
