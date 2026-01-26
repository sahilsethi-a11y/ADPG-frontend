export default function Loading() {
    const skeletonCards = Array.from({ length: 12 });

    return (
        <main className="text-[#4a5565] container mx-auto px-4 lg:px-6 py-8">
            <div className="border border-stroke-light rounded-md p-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <div className="w-full h-9 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="w-full h-9 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="w-full h-9 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="w-full h-9 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="w-full h-9 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex justify-center items-center gap-2 lg:gap-4">
                        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 mt-8">
                <span className="h-6 w-40 bg-gray-200 rounded-full" />
                <div className="w-52">
                    <div className="h-10 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skeletonCards.map((_, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-lg border border-stroke-light overflow-hidden shadow-sm"
                    >
                        {/* image area */}
                        <div className="relative h-44 bg-gray-100">
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="h-6 w-20 bg-gray-200 rounded-full" />
                                <span className="h-6 w-16 bg-gray-200 rounded-full" />
                            </div>
                            <div className="absolute top-3 right-3">
                                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                            </div>
                            <div className="absolute bottom-3 left-3">
                                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                            </div>
                        </div>

                        {/* content */}
                        <div className="p-4">
                            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
                            <div className="h-3 w-2/3 bg-gray-200 rounded mb-3 animate-pulse" />
                            <div className="h-5 w-1/3 bg-gray-200 rounded mb-3 animate-pulse" />

                            <div className="mb-3">
                                <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse" />
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
