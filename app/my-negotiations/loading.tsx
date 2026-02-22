export default function LoadingNegotiationsPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
                <div className="space-y-2">
                    <div className="h-8 w-56 rounded bg-gray-200" />
                    <div className="h-4 w-96 max-w-full rounded bg-gray-100" />
                </div>

                <div className="rounded-xl border border-stroke-light p-4 space-y-3">
                    <div className="h-10 w-full rounded bg-gray-100" />
                    <div className="flex gap-2">
                        <div className="h-8 w-14 rounded bg-gray-200" />
                        <div className="h-8 w-20 rounded bg-gray-200" />
                        <div className="h-8 w-16 rounded bg-gray-200" />
                        <div className="h-8 w-24 rounded bg-gray-200" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-stroke-light p-4 grid grid-cols-[80px_1fr] md:grid-cols-[80px_1fr_250px] gap-4">
                        <div className="h-16 w-20 rounded bg-gray-100" />
                        <div className="space-y-3">
                            <div className="h-6 w-64 rounded bg-gray-200" />
                            <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
                            <div className="h-4 w-48 rounded bg-gray-100" />
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-3">
                            <div className="h-7 w-28 rounded bg-gray-200" />
                            <div className="h-8 w-28 rounded bg-gray-200" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-stroke-light p-4 grid grid-cols-[80px_1fr] md:grid-cols-[80px_1fr_250px] gap-4">
                        <div className="h-16 w-20 rounded bg-gray-100" />
                        <div className="space-y-3">
                            <div className="h-6 w-52 rounded bg-gray-200" />
                            <div className="h-4 w-72 max-w-full rounded bg-gray-100" />
                            <div className="h-4 w-44 rounded bg-gray-100" />
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-3">
                            <div className="h-7 w-24 rounded bg-gray-200" />
                            <div className="h-8 w-28 rounded bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
