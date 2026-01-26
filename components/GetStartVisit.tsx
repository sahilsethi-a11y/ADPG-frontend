import Image from "@/elements/Image";
type PropsT = {
  data: {
    title: string;
    subTitle: string;
    List: {
      icon: string;
      title: string;
      subTitle: string;
    }[];
  };
  parentBg?: string;
  cardCls: string;
  grid: string;
  cardTitleCls?: string;
  imgBgCls?: string;
  imgCls?: string;
};

export default function GetStartVisit(props: Readonly<PropsT>) {
  const { data, parentBg = "bg-white" } = props;
  return (
    <section className={`py-16 ${parentBg}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4 text-brand-blue">{data.title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{data.subTitle}</p>
        </div>
        <div className={`${props.grid}`}>
          {data.List.map((item) => (
            <div
              key={item.title}
              className={`${props.cardCls} bg-white text-black`}
            >
              <div className={`${props.imgBgCls ? "" : "p-6"}`}>
                <div className="flex items-center justify-center">
                  <div className={props.imgBgCls}>
                    <Image
                      alt={item.title}
                      src={item.icon}
                      height={30}
                      width={30}
                      className={
                        props.imgCls
                          ? props.imgCls
                          : "rounded-full mx-auto mb-3"
                      }
                    />
                  </div>
                </div>
                <div className={`${props.cardTitleCls} text-brand-blue`}>
                  {item.title}
                </div>
                <div className="text-sm text-gray-600">{item.subTitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
