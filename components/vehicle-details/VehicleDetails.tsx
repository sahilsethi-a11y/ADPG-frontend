"use client";

import Button from "@/elements/Button";
import { FileIcon } from "@/components/Icons";
import { downloadFile } from "@/lib/utils";
import { useVehicle } from "@/hooks/useVehicle";
import { useEffect } from "react";

export type VehicleDetailsData = {
    id: string;
    mileage: string;
    numberOfOwners: string;
    warrantyRemaining: string;
    inspectionReportUrl: string;
};

export default function VehicleDetails({ data }: Readonly<{ data: VehicleDetailsData[] }>) {
    const { vehicles, addVehicle, updateVehicles, clearVehicles, totalItems } = useVehicle();

    const headers = ["Select", "Mileage", "Number of Owners", "Warranty Remaining", "View Inspection Report"];

    if (data.length === 1) {
        headers.shift();
    }

    useEffect(() => {
        if (data.length === 1) {
            updateVehicles(data.map((i) => i.id));
        }
        return () => {
            clearVehicles();
        };
    }, []);

    return (
        <div className="bg-white rounded-xl border border-[rgba(36,39,44,0.1)] p-4 md:p-7.5">
            <div className="flex flex-col gap-6 md:items-center justify-between mb-6 md:flex-row">
                <div className="flex gap-4">
                    <h3 className="text-xl font-semibold text-black">Vehicle Details</h3>
                    {totalItems > 0 && data.length !== 1 && <p className="text-[13px] text-gray-600 mt-1">{totalItems} inventory selected</p>}
                </div>
                {data.length !== 1 && (
                    <div className="flex gap-2">
                        {totalItems > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => clearVehicles()}>
                                Clear Selection
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => updateVehicles(data.map((item) => item.id))}>
                            Select All
                        </Button>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            {headers.map((item: string) => (
                                <th key={item} className="text-left py-3 px-4 text-[13px] font-semibold text-gray-700 whitespace-nowrap">
                                    {item}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item: VehicleDetailsData) => (
                            <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${vehicles.includes(item.id) && "bg-brand-blue/5"}`}>
                                {data.length > 1 && (
                                    <td className="py-3 px-4">
                                        <Button variant={vehicles.includes(item.id) ? "primary" : "outline"} size="sm" onClick={() => addVehicle(item.id)}>
                                            {vehicles.includes(item.id) ? "Selected" : "Select"}
                                        </Button>
                                    </td>
                                )}
                                <td className="py-3 px-4 text-[13px] text-gray-700">{item.mileage}</td>
                                <td className="py-3 px-4 text-[13px] text-gray-700">{item.numberOfOwners}</td>
                                <td className="py-3 px-4 text-[13px] text-gray-700">{item.warrantyRemaining}</td>
                                <td className="py-3 px-4">
                                    <Button
                                        type="button"
                                        disabled={!item.inspectionReportUrl}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadFile(item.inspectionReportUrl)}
                                        leftIcon={<FileIcon className="h-3 w-3 mr-1" />}>
                                        View
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
