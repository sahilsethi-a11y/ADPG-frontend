type PropsT = {
    data: {
        title: string;
        subTitle: string;
        description: string;
        image: string;
    };
};

export default function TopBanner({ data }: Readonly<PropsT>) {
    return (
        <section
            className="relative h-screen min-h-[700px] overflow-hidden"
            style={{
                backgroundImage: `linear-gradient(rgba(32, 44, 74, 0.8), rgba(32, 44, 74, 0.8)), url(${data.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
            }}
        >
            <div className="absolute inset-0 opacity-20">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%, rgba(32, 139, 201, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(32, 139, 201, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(32, 139, 201, 0.3) 0%, transparent 50%)",
                    }}
                ></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="mb-4">
                    <div className="text-white text-xl lg:text-2xl font-semibold mb-4">
                        {data.title}
                    </div>
                </div>
                <h1 className="text-2xl lg:text-[46px] leading-8.5 lg:leading-16.5 font-bold text-white mb-4">
                    {data.subTitle}
                </h1>
                <p className="text-white text-sm lg:text-[20px] leading-normal min-w-3xs max-w-2xl">
                    {data.description}
                </p>
            </div>
        </section>
    );
}
