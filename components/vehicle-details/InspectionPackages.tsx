import { Shield } from "@/components/Icons";

export type VehicleInsurance = {
    name: string;
    features: string[];
    currency: string;
    price: string;
    type: string;
};

type PropsT = {
    data: VehicleInsurance[];
    handleInsuranceChange: (insurance: VehicleInsurance) => void;
};

export default function InspectionPackages({
    data,
    handleInsuranceChange,
}: Readonly<PropsT>) {
    return (
        <div className="bg-white text-foreground rounded-xl border border-stroke-light p-6">
            <h4 className="leading-none text-brand-blue flex items-center gap-2">
                <Shield />
                Inspection Packages
            </h4>
            <div className="space-y-4 mt-6">
                <div className="space-y-3">
                    <div role="radiogroup" className="grid gap-2">
                        {data.map((item, i) => (
                            <label
                                key={`${item.name}-${i}`}
                                className="flex items-center space-x-6 p-4 border border-stroke-light rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="insurance"
                                    className="accent-brand-blue"
                                    onChange={() => handleInsuranceChange(item)}
                                />
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <div className="text-brand-blue flex items-center gap-2">
                                            {item.name}
                                            {item?.type && (
                                                <span className="rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden border-transparent bg-purple-100 text-purple-800">
                                                    {item.type}
                                                </span>
                                            )}
                                        </div>
                                        <ul className="text-sm list-disc list-inside text-gray-600">
                                            {item.features.map((i) => (
                                                <li key={i}> {i}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="text-lg text-brand-blue">
                                        {item.currency} {item.price}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
