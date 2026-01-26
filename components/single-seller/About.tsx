import { ClockIcon } from "@/components/Icons";

export type AboutData = {
    bannerImage: string;
    specialties: string[];
    description: string;
    businessCompanyName: string;
    workingHours: string;
};

type PropsT = {
    data: AboutData;
};

export default function About({ data }: Readonly<PropsT>) {
    return (
        <div role="tabpanel" tabIndex={0} className="flex-1 outline-none space-y-6">
            <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5">
                    <h4 className="leading-none text-brand-blue">About {data.businessCompanyName}</h4>
                </div>
                <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">{data.description}</p>
                    <div>
                        <h3 className="font-medium text-brand-blue mb-3">Specialties</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.specialties?.map((item) => (
                                <span
                                    key={item}
                                    className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-all overflow-hidden border-transparent bg-brand-blue/10 text-brand-blue">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-brand-blue mb-2">Working Hours</h3>
                        <div className="flex items-center gap-2 text-gray-700">
                            <ClockIcon className="w-4 h-4" />
                            {data.workingHours}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
