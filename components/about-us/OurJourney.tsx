type PropsT = {
    data: {
        title: string;
        description: string;
        list: {
            year: string;
            title: string;
            description: string;
        }[];
    };
};

export default function OurJourney({ data }: Readonly<PropsT>) {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 lg:px-[140px]">
                <div className="flex flex-col gap-10">
                    <div className="text-center max-w-[1132px] mx-auto">
                        <h2 className="text-3xl lg:text-[44px] leading-normal font-semibold text-neutral-950 mb-3.5">
                            {data.title}
                        </h2>
                        <p className="text-[15px] leading-normal font-normal text-[#4a5565]">
                            {data.description}
                        </p>
                    </div>
                    <div className="max-w-[500px] relative">
                        <div className="absolute left-2 top-1 w-0.5 h-full bg-[#208bc9]"></div>
                        <div className="flex flex-col gap-[30px] relative">
                            {data.list.map((item) => (
                                <div
                                    key={item.year}
                                    className="flex gap-2 items-start relative"
                                >
                                    <div className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center mt-1 z-10 bg-[#208bc9]">
                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                    </div>
                                    <div className="bg-white rounded-[6.75px] border border-[rgba(36,39,44,0.1)] h-[26px] px-2 flex items-center ml-2 ">
                                        <span className="text-[13px] leading-3.5 font-normal text-[#24272c]">
                                            {item.year}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[400px] ml-2 ">
                                        <h3 className="text-[20px] leading-6.5 font-medium text-[#24272c]">
                                            {item.title}
                                        </h3>
                                        <p className="text-[15px] leading-6 font-normal text-[rgba(36,39,44,0.7)]">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
