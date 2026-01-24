import Image from "@/elements/Image";
import { VerifiedIcon } from "@/components/Icons";

type PropsT = {
    data: {
        title: string;
        mission: {
            title: string;
            description: string;
        };
        vision: {
            title: string;
            description: string;
            list: string[];
        };
        statics: {
            icon: string;
            title: string;
            subTitle: string;
            description: string;
        }[];
    };
};

export default function MissonVision({ data }: Readonly<PropsT>) {
    return (
        <section className="py-16 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-[140px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="flex flex-col gap-8 order-2 lg:order-1">
                        <h2 className="text-3xl lg:text-[44px] lg:leading-[57.2px] font-semibold text-[#24272c]">
                            {data.title}
                        </h2>
                        <div className="flex flex-col gap-[30px] max-w-[518px]">
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xl lg:text-[20px] lg:leading-[26px] font-medium text-[#24272c]">
                                    {data.mission.title}
                                </h3>
                                <p className="text-[15px] leading-8 font-normal text-[rgba(36,39,44,0.7)]">
                                    {data.mission.description}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xl lg:text-[20px] lg:leading-[26px] font-medium text-[#24272c]">
                                    {data.vision.title}
                                </h3>
                                <p className="text-[15px] leading-6 font-normal text-[rgba(36,39,44,0.7)]">
                                    {data.vision.description}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4 pt-4">
                                {data.vision.list.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-2 h-2 bg-[#202c4a] rounded-full"></div>
                                        <span className="text-[14px] text-[#24272c] font-medium">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 relative">
                        <div className="relative w-full h-[400px] lg:h-[500px] rounded-[20px] overflow-hidden shadow-xl">
                            <Image
                                width={392}
                                height={500}
                                src="/assets/home-banner.avif"
                                alt="Electric vehicles charging at modern charging stations showcasing sustainable automotive future"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#202c4a]/10 rounded-full"></div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#208bc9]/10 rounded-full"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                    {data.statics.map((item, index) => (
                        <div
                            key={`${item.title}-${index}`}
                            className="bg-white rounded-2xl border border-[rgba(0,0,0,0.1)] p-6 flex flex-col gap-4 items-center text-center shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="bg-[rgba(32,139,201,0.15)] rounded-full w-14 h-14 flex items-center justify-center">
                                <VerifiedIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-[24px] leading-8 font-bold text-[#202c4a]">
                                {item.title}
                            </h3>
                            <div className="text-center">
                                <p className="text-[16px] leading-5 font-medium text-[#212529] mb-2">
                                    {item.subTitle}
                                </p>
                                <p className="text-[13px] leading-[18px] font-normal text-[#4a5565]">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
