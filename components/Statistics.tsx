import Image from "@/elements/Image";

type PropsT = {
    data: {
        title: string;
        description: string;
        image: string;
        list: {
            icon: string;
            title: string;
            subtitle: string;
            description: string;
        }[];
    };
};

export default function Statistics({ data }: Readonly<PropsT>) {
    return (
        <section
            className="py-16 relative bg-cover bg-center"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${data.image})`,
            }}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col gap-12 items-center">
                    <div className="text-center text-white flex flex-col gap-4">
                        <h2 className="text-[44px] leading-[57.2px] font-semibold">{data.title}</h2>
                        <div className="text-[15px] leading-[21px] font-normal max-w-2xl">
                            <p>{data.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl">
                        {data.list.map((item) => (
                            <div
                                key={item.title}
                                className="backdrop-blur-[7.5px] bg-[rgba(255,255,255,0.25)] h-60 w-full rounded-[20px] border border-white p-5 flex flex-col gap-5 items-center justify-center">
                                <Image alt={item.title} src={item.icon} height={50} width={50} />
                                <h3 className="text-[24px] leading-[31.5px] font-bold  text-[#212529] text-center">{item.title}</h3>
                                <div className="flex flex-col gap-2 text-center">
                                    <p className="text-[15px] leading-[24.5px] font-medium text-[#212529]">{item.subtitle}</p>
                                    <p className="text-[13px] leading-[17.5px] font-normal text:white">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
