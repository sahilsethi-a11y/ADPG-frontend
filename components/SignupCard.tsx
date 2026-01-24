import Link from "next/link";

type PropsT = {
    data: {
        title: string;
        description: string;
        image: string;
        link: string;
        linkText: string;
    };
};

export default function SignupCard({ data }: Readonly<PropsT>) {
    return (
        <section className="py-16 relative">
            <div className="container mx-auto px-4">
                <div
                    className="bg-cover bg-center bg-black rounded-[20px] shadow-[0px_4px_50px_0px_rgba(92,96,111,0.2)] h-[400px] overflow-hidden relative flex items-center justify-center"
                    style={{
                        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.8) 30%, transparent 70%), url(${data.image})`,
                    }}>
                    <div className="text-center text-white flex flex-col gap-6 max-w-2xl px-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[44px] leading-[66px] font-bold">{data.title}</h2>
                            <div className="text-[15px] leading-[24.5px] font-normal">
                                <p>{data.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Link href={data.link} className="bg-white text-black py-3 text-xs font-medium px-7 rounded-lg hover:bg-gray-100">
                                {data.linkText}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
