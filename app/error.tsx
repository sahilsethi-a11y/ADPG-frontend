"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: Readonly<{ error?: Error; reset?: () => void }>) {
    useEffect(() => {
        if (error) console.error("Unhandled error (app/error.tsx):", error);
    }, [error]);

    return (
        <main className="flex-1 flex items-center justify-center py-20 px-4">
            <div className="max-w-4xl w-full bg-white shadow-md rounded-2xl border border-stroke-light overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-10 flex flex-col justify-center items-start gap-6">
                        <span className="text-sm font-semibold text-indigo-600 uppercase">Something went wrong</span>
                        <h1 className="text-5xl font-extrabold text-gray-900">Oops — an error occurred</h1>
                        <p className="text-base text-gray-600 leading-relaxed">
                            We ran into an unexpected problem while loading this page. You can try reloading, go back to the homepage, or contact support if the issue persists.
                        </p>

                        {error && <pre className="w-full max-h-36 overflow-auto bg-gray-100 p-3 rounded-md text-sm text-gray-700 border border-gray-200">{error?.message}</pre>}

                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={() => (reset ? reset() : location.reload())}
                                className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                Try again
                            </button>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-md border border-stroke-light bg-white text-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                                Go home
                            </Link>

                            <a href="mailto:support@adpg-automarketplace.example" className="ml-2 text-sm text-gray-500 hover:text-gray-700">
                                Contact support
                            </a>
                        </div>
                    </div>

                    <div className="p-8 bg-linear-to-br from-indigo-50 to-white flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center">
                            {/* Decorative SVG illustration */}
                            <svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                <rect x="16" y="40" width="288" height="160" rx="12" fill="#eef2ff" />
                                <path d="M56 88h208v8H56z" fill="#c7d2fe" />
                                <circle cx="96" cy="136" r="28" fill="#6366f1" />
                                <rect x="160" y="116" width="96" height="40" rx="6" fill="#a78bfa" />
                                <text x="96" y="142" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">
                                    500
                                </text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
