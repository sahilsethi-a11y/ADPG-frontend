import { Dispatch, SetStateAction } from "react";
import { FilterIcon, CloseIcon, ResetIcon } from "@/components/Icons";
import Select, { Option } from "@/elements/Select";
import DoubleRangeSlider from "@/components/DoubleRangeSlider";
import type { SearchParams } from "next/dist/server/request/search-params";

type FilterSidebarProps = {
    isOpen: boolean;
    closeFilters: () => void;
    data: Record<string, unknown>;
    filterState: SearchParams;
    setFilterState: Dispatch<SetStateAction<SearchParams>>;
    handleApply: () => void;
    clearAllFilter: () => void;
};

export default function FilterSidebar(props: Readonly<FilterSidebarProps>) {
    const { data, filterState, setFilterState, handleApply, clearAllFilter } = props;

    const updateFilterState = (updates: Record<string, string>) => {
        setFilterState((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const handleCheckboxChange = (type: "fuelType" | "drivetrain", value: string) => {
        setFilterState((prev) => ({
            ...prev,
            [type]: prev[type]?.includes(value) ? (prev[type] as string[]).filter((v) => v !== value) : [...(prev[type] as string), value],
        }));
    };

    const count = Object.entries(filterState).reduce((acc, [_, value]) => {
        if (Array.isArray(value)) {
            return acc + value.length;
        }
        return acc + (value ? 1 : 0);
    }, 0);

    return (
        <>
            {props.isOpen && <div className="fixed inset-0 z-54 bg-black/50" onClick={props.closeFilters} aria-hidden="true" />}
            <div
                className={`fixed inset-y-0 right-0 w-full sm:w-6/10 border border-stroke-light sm:max-w-sm p-0 bg-white z-65 transition-transform duration-400 ease-in-out ${
                    props.isOpen ? "translate-x-0" : "translate-x-full"
                }`}>
                <div className="flex flex-col h-full max-h-screen">
                    <div className="bg-white border-b border-stroke-light px-5.75 py-3.5 shrink-0">
                        <h2 className="flex items-center gap-2 font-semibold text-black text-sm/5.25">
                            <button className="hover:text-gray-700 focus:outline-none" aria-label="Close filters">
                                <FilterIcon className="h-4.5 w-4.5" />
                            </button>
                            Advanced Filters
                            {count > 0 && (
                                <span className="ml-2 inline-flex gap-1 items-center border-transparent px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[#030213] whitespace-nowrap">
                                    {count} active
                                </span>
                            )}
                            <button onClick={props.closeFilters} className="flex items-center ml-auto">
                                <CloseIcon className="h-3.5 w-3.5" />
                            </button>
                        </h2>
                    </div>
                    <div className="flex-1 space-y-6 py-6 px-6 pb-8 overflow-y-auto">
                        <Select
                            options={data?.sellerTypeOptions as Option[]}
                            value={filterState?.userType}
                            onChange={(value) =>
                                updateFilterState({
                                    userType: value as string,
                                })
                            }
                            label="User Type"
                            placeholder="Select user type"
                            border="bg-accent/40"
                            labelCls="text-base/5.25 text-brand-blue"
                        />

                        <div className="space-y-3">
                            <h4 className="text-brand-blue">Colour</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {(data?.colors as { label: string; value: string; hex: string }[])?.map((c) => (
                                    <label
                                        key={c.value}
                                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                                            filterState.color === c.value ? "bg-brand-blue/10 border-brand-blue" : "border-gray-200 hover:border-brand-blue/50"
                                        }`}>
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300 shrink-0 "
                                            style={{
                                                backgroundColor: c.hex,
                                            }}
                                            aria-hidden="true"
                                        />
                                        <input
                                            type="radio"
                                            name="color"
                                            value={c.value}
                                            onClick={() =>
                                                updateFilterState({
                                                    color: c.value,
                                                })
                                            }
                                            hidden
                                        />
                                        <span className="text-xs/4.5 text-black flex-1">{c.value}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-brand-blue">Fuel Type</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {(data?.fuelTypeOptions as Option[])?.map((option) => (
                                    <label key={option.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border border-brand-blue bg-accent/40 accent-brand-blue"
                                            checked={filterState.fuelType?.includes(option.value) || false}
                                            onChange={() => handleCheckboxChange("fuelType", option.value)}
                                        />
                                        <span className="ml-2 text-sm text-gray-700 cursor-pointer capitalize">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-brand-blue">Drivetrain</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {(data?.drivetrainOptions as Option[])?.map((option) => (
                                    <label key={option.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border border-brand-blue bg-accent/40 accent-brand-blue"
                                            checked={filterState.drivetrain?.includes(option.value) || false}
                                            onChange={() => handleCheckboxChange("drivetrain", option.value)}
                                        />
                                        <span className="ml-2 text-sm text-gray-700 cursor-pointer capitalize">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <DoubleRangeSlider
                            min={2000}
                            max={new Date().getFullYear()}
                            step={1}
                            label="Year Range"
                            value={[Number(filterState.yearFrom), Number(filterState.yearTo)]}
                            onChange={([minVal, maxVal]: [number, number]) => {
                                updateFilterState({
                                    yearTo: maxVal.toString(),
                                    yearFrom: minVal.toString(),
                                });
                            }}
                        />
                        <Select
                            options={data?.regionalSpecsOptions as Option[]}
                            value={filterState.regionalSpecs}
                            onChange={(value) =>
                                updateFilterState({
                                    regionalSpecs: value as string,
                                })
                            }
                            label="Regional Specs"
                            placeholder="Select regional specs"
                            labelCls="text-base/5.25 text-brand-blue"
                            border="bg-accent/40"
                        />

                        <Select
                            options={data?.transmissionOptions as Option[]}
                            value={filterState.transmission}
                            onChange={(value) =>
                                updateFilterState({
                                    transmission: value as string,
                                })
                            }
                            label="Transmission"
                            placeholder="Select Transmission"
                            labelCls="text-base/5.25 text-brand-blue"
                            border="bg-accent/40"
                        />

                        <Select
                            options={data?.bodyConditionOptions as Option[]}
                            value={filterState.condition}
                            onChange={(value) =>
                                updateFilterState({
                                    condition: value as string,
                                })
                            }
                            label="Body Condition"
                            placeholder="Select Condition"
                            labelCls="text-base/5.25 text-brand-blue"
                            border="bg-accent/40"
                        />
                    </div>

                    <div className="px-5.75 py-3.5 border-t border-stroke-light bg-white shrink-0 shadow-lg">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => clearAllFilter()}
                                className="border inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium outline-none h-9 px-4 py-2 text-gray-600 border-gray-300 hover:bg-gray-50 shrink-0">
                                <ResetIcon className="h-3.25 w-3.25" />
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={props.closeFilters}
                                className="border whitespace-nowrap rounded-md text-xs font-medium outline-none h-9 px-4 py-2 text-gray-600 border-gray-300 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApply()}
                                className="flex-1 inline-flex items-center whitespace-nowrap justify-center h-9 px-3 py-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-[#202C4A] hover:bg-[#1a2438] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Apply Filters
                                {count > 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white text-brand-blue border-transparent">{count}</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
