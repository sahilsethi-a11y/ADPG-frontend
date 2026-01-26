type PropsT = {
    title: string;
    description: string;
    image: string;
    children?: React.ReactNode;
    verticalCenter?: boolean;
};

export default function TopBanner(props: Readonly<PropsT>) {
    const { verticalCenter } = props;
    return (
        <div
            className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${props.image})`,
            }}>
            <div className={`flex justify-center text-white ${verticalCenter ? "h-full items-center" : "pt-[10vh] items-start"}`}>
                <div className="text-center max-w-4xl px-4">
                    <h1 className="text-3xl lg:text-5xl font-bold mb-6 lg:whitespace-nowrap ">{props.title}</h1>
                    <p className="text-[18px] mb-4 md:text-[20px] lg:text-[22px] font-normal text-white/95 max-w-3xl mx-auto">{props.description}</p>
                    {props.children}
                </div>
            </div>
        </div>
    );
}
