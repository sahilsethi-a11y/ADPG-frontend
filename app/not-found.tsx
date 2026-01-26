import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-xl w-full text-center">
                <div className="w-64 h-64 mx-auto mb-8 relative">
                    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <circle cx="250" cy="250" r="200" fill="#F3F4F6" />
                        <text x="250" y="220" fontSize="80" fontWeight="bold" fill="#161738" textAnchor="middle" className="select-none">
                            404
                        </text>
                        <g className="text-[#161738]" opacity="0.15">
                            <circle cx="150" cy="150" r="20" fill="currentColor" />
                            <circle cx="350" cy="150" r="15" fill="currentColor" />
                            <circle cx="150" cy="350" r="15" fill="currentColor" />
                            <circle cx="350" cy="350" r="20" fill="currentColor" />
                            <path d="M250 100 L250 150" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                            <path d="M250 350 L250 400" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                            <path d="M100 250 L150 250" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                            <path d="M350 250 L400 250" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        </g>
                        <path d="M180 280 C180 280, 220 320, 250 320 C280 320, 320 280, 320 280" stroke="#161738" strokeWidth="12" strokeLinecap="round" fill="none" />
                    </svg>
                </div>
                <h1 className="text-4xl font-bold text-brand-blue mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-8 text-lg">Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been removed, renamed, or is temporarily unavailable.</p>
                <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Homepage
                </Link>
            </div>
        </div>
    );
}
