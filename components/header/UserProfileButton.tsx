"use client";
import { useState, useRef } from "react";
import { UserIcon, UserCircleIcon, LogoutIcon, MessageSquareIcon } from "@/components/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import type { User } from "@/components/header/Header";
import message from "@/elements/message";
import { api } from "@/lib/api/client-request";

export default function UserProfileButton({ user }: Readonly<{ user: User }>) {
    const [loginDropdown, setLoginDropdown] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    useOutsideClick(ref, () => setLoginDropdown(false));

    const navigateToDashboard = () => {
        setLoginDropdown(false);
        switch (user?.roleType?.toLowerCase()) {
            case "admin":
                router.push("/admin/dashboard");
                break;
            case "seller":
                router.push("/seller/dashboard");
                break;
            case "buyer":
                router.push("/buyer/dashboard");
                break;
            case "dealer":
                router.push("/dealer/dashboard");
                break;
            default:
                break;
        }
    };

    const logout = async () => {
        setLoginDropdown(false);
        try {
            const res = await api.post<{ status: string; message: string }>("/api/v1/auth/logout");
            if (res.status === "OK") {
                message.success({ title: res.message, duration: 1000 });
                router.push("/");
                router.refresh();
            }
        } catch {
            message.error("something went wrong. Unable to logout");
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setLoginDropdown((prev) => !prev)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                <UserCircleIcon className="h-4 w-4" />
            </button>
            {loginDropdown && (
                <div className="absolute border-black/10 bg-white rounded-md border shadow-md text-brand-blue overflow-y-auto w-50 z-50 right-0 top-10">
                    {user?.userId ? (
                        <>
                            <div className="px-3 py-2 border-b border-stroke-light">
                                <p className="font-medium text-sm">{user.name || user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                <span className="bg-accent inline-block mt-1 px-2 py-1 rounded-lg text-xs font-medium text-black">{user.roleType}</span>
                            </div>
                            <ul>
                                <li className="p-1">
                                    <button onClick={navigateToDashboard} title="dashboard" className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent text-sm/7">
                                        <UserIcon className="h-4 w-4 mr-2 text-light-gray-4" />
                                        Dashboard
                                    </button>
                                    <Link
                                        onClick={() => setLoginDropdown(false)}
                                        href="/my-negotiations"
                                        title="My Negotiations"
                                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent text-sm/7">
                                        <MessageSquareIcon className="h-4 w-4 mr-2 text-light-gray-4" />
                                        Negotiations
                                    </Link>
                                    <button type="button" onClick={logout} className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent text-sm/7">
                                        <LogoutIcon className="h-4 w-4 mr-2 text-light-gray-4" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </>
                    ) : (
                        <ul>
                            <li className="p-1">
                                <Link onClick={() => setLoginDropdown(false)} href="/login" title="Login" className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent text-sm/7">
                                    <UserIcon className="h-4 w-4 mr-2 text-light-gray-4" />
                                    Login
                                </Link>
                                <Link onClick={() => setLoginDropdown(false)} href="/signup" title="signup" className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent text-sm/7">
                                    <UserCircleIcon className="h-4 w-4 mr-2 text-light-gray-4" />
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
