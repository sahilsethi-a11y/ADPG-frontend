import Image from "@/elements/Image";
import Link from "next/link";

type PropsT = {
    data: {
        title: string;
        description: string;
        image: string;
        list: {
            icon: string;
            title: string;
            description: string;
            link: string;
        }[];
    };
};

export default function Services({ data }: Readonly<PropsT>) {
    return (
        <section className="pt-18 pb-16 px-4 bg-white">
            <div className="container mx-auto !lg:px-40 text-black">
                <div className="text-center mb-12">
                    <h2 className="text-[32px] lg:text-[44px] leading-[1.2] font-semibold mb-4 ">{data.title}</h2>
                    <p className="text-[14px] lg:text-[15px] leading-[1.6] font-normal text-[#4a5565] max-w-4xl mx-auto ">{data.description}</p>
                </div>
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-6xl mx-auto">
                    <div className="flex-1 space-y-8 lg:space-y-12 w-full lg:w-auto">
                        {data.list.map((service) => (
                            <div key={service.title} className="flex items-start gap-4 lg:gap-6">
                                <Image alt={service.title} src={service.icon} height={42} width={42} className="rounded-full" />
                                <div className="flex-1">
                                    <h3 className="text-[18px] lg:text-[20px] leading-[1.4] font-medium  mb-2 lg:mb-3 group-hover:text-[#208bc9] transition-colors">{service.title}</h3>
                                    <p className="text-[14px] lg:text-[15px] leading-[1.6] font-normal text-[#4a5565] ">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 relative w-full lg:w-auto">
                        <div className="relative rounded-[20px] lg:rounded-[25px] h-75 lg:h-100 overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
                            <Image alt={data.title} src={data.image} fill={true} height={300} width={400} className="object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
