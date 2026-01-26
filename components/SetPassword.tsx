"use client";
import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";

type PropsT = {
    password: string;
    confirmPassword: string;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    error?: string;
};

export default function SetPassword({ password, confirmPassword, setPassword, setConfirmPassword, error }: Readonly<PropsT>) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-black/10 p-6">
            <div>
                <h4 className="leading-none text-brand-blue flex items-center gap-2">
                    <LockIcon className="h-5 w-5" />
                    Set Your Password
                </h4>
                <p className="text-muted-foreground">Create a secure password for your account</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2 text-sm leading-none font-medium">
                        <LockIcon className="h-4 w-4" />
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            autoComplete="new-password"
                            placeholder="Enter a strong password"
                            className="w-full px-3 py-1 h-9 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">Password must be at least 8 characters and include uppercase, lowercase, and numbers</p>
                </div>
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm leading-none font-medium">
                        <LockIcon className="h-4 w-4" />
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            autoComplete="new-password"
                            type={showConfirm ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="w-full px-3 py-1 h-9 border border-transparent outline-none focus-visible:border-black/40 focus-visible:ring-black/20 focus-visible:ring-[3px] bg-accent/40 rounded-md placeholder:text--muted-foreground text-sm text-gray-900"
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showConfirm ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                        <p className="text-destructive text-sm" role="alert">
                            {error}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
