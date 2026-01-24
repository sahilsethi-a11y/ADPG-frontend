"use client";
import { type Step } from "@/components/add-vehicle/VehicleForm";
import { CheckCircleIcon } from "@/components/Icons";
import { Dispatch, SetStateAction } from "react";

export default function Stepper({ currentStep, steps, setStep }: Readonly<{ currentStep: number; steps: Step[]; setStep: Dispatch<SetStateAction<number>> }>) {
    const progress = (currentStep / steps.length) * 100 + "%";

    const getBtnCls = (i: number) => {
        if (currentStep < i) return "bg-gray-100 text-gray-400";
        if (currentStep === i) return "bg-brand-blue text-white shadow-lg";
        if (currentStep > i) return "bg-green-500 text-white";
    };

    const handleSteps = (i: number) => {
        if (currentStep <= i) return;
        setStep(i);
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center flex-1">
                        <button
                            onClick={() => handleSteps(index + 1)}
                            disabled={currentStep < index + 1}
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200 disabled:cursor-not-allowed ${getBtnCls(index + 1)}`}>
                            {currentStep > index + 1 ? <CheckCircleIcon className="h-4.5 w-4.5" /> : step.icon}
                        </button>
                        <span className="text-sm text-center max-w-20 text-brand-blue font-medium">{step.label}</span>
                    </div>
                ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand-blue h-2 rounded-full transition-all duration-300" style={{ width: progress }}></div>
            </div>
        </div>
    );
}
