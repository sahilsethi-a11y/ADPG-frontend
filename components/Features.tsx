import Image from "@/elements/Image";

type PropsT = {
    data: {
        title: string;
        description: string;
        list: {
            icon: string;
            title: string;
            description: string;
        }[];
    };
};

export default function Features({ data }: Readonly<PropsT>) {
    return (
        <section className="py-16 bg-[#dce2ef] mx-auto px-4">
            <div className="flex flex-col gap-10 max-w-6xl mx-auto">
                <div className="flex flex-col gap-3.5 items-center">
                    <h2 className="text-[44px] leading-normal font-semibold text-neutral-950 text-center">{data.title}</h2>
                    <div className="text-center max-w-3xl">
                        <p className="text-xl leading-normal font-normal text-[#4a5565]">{data.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                    {data.list.map((feature) => (
                        <div key={feature.title} className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.1)] p-5 flex flex-col gap-5 items-center text-center">
                            <Image alt={feature.title} src={feature.icon} height={50} width={50} className="rounded-full" />
                            <div className="flex flex-col gap-2 text-center">
                                <h3 className="text-xl leading-7 font-medium  text-[#202c4a]">{feature.title}</h3>
                                <p className="text-base font-normal  text-[#4a5565]">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
