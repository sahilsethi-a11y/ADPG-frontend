export default function LoadingConversation() {
    return (
        <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen flex flex-col pb-32">
            <div className="animate-pulse space-y-6">
                <div className="h-6 w-44 rounded bg-gray-200" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-lg border border-stroke-light bg-white p-5 space-y-3">
                            <div className="h-5 w-40 rounded bg-gray-200" />
                            <div className="h-24 w-full rounded bg-gray-100" />
                            <div className="h-24 w-full rounded bg-gray-100" />
                        </div>

                        <div className="rounded-lg border border-stroke-light bg-white p-5 space-y-3 min-h-96">
                            <div className="h-5 w-32 rounded bg-gray-200" />
                            <div className="h-14 w-3/4 rounded bg-gray-100" />
                            <div className="h-14 w-2/3 rounded bg-gray-100 ml-auto" />
                            <div className="h-14 w-4/5 rounded bg-gray-100" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg border border-stroke-light bg-white p-5 space-y-3">
                            <div className="h-5 w-20 rounded bg-gray-200" />
                            <div className="h-4 w-full rounded bg-gray-100" />
                            <div className="h-4 w-4/5 rounded bg-gray-100" />
                        </div>

                        <div className="rounded-lg border border-stroke-light bg-white p-5 space-y-3">
                            <div className="h-5 w-28 rounded bg-gray-200" />
                            <div className="h-20 w-full rounded bg-gray-100" />
                            <div className="h-10 w-full rounded bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
