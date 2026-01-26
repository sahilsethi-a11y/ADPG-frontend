import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/components/Icons";
import { ChangeEvent, Dispatch, SetStateAction, useState, KeyboardEvent } from "react";
import type { FormState } from "@/components/add-vehicle/VehicleForm";
import Input from "@/elements/Input";
import Button from "@/elements/Button";
import { ZodTreeError } from "@/validation/shared-schema";

type PropsT = {
    formState: FormState;
    updateFormField: (name: Partial<keyof FormState>, value: string[], errorPath?: (string | number)[]) => void;
    setStep: Dispatch<SetStateAction<number>>;
    handleSubmit: () => void;
    errors?: ZodTreeError;
};

export default function FeatureForm({ formState, errors, updateFormField, setStep, handleSubmit }: Readonly<PropsT>) {
    const [feature, setFeature] = useState("");
    const [features, setFeatures] = useState<string[]>(formState.features ?? []);
    const [error, setError] = useState<string>("");

    const handleFeatureChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFeature(value);
        setError("");
    };

    const handleKeyboardEvent = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addFeature();
        }
    };

    const addFeature = () => {
        if (!feature) return;
        if (features.includes(feature)) {
            setError("Feature already added");
            return;
        }
        if (features.length >= 20) {
            setError("You can add up to 20 features only");
            return;
        }
        setFeature("");
        const allFeatures = [...features, feature];
        setFeatures(allFeatures);
        updateFormField("features", allFeatures);
    };

    const removeFeature = (feature: string) => {
        const allFeatures = features.filter((f) => f !== feature);
        setFeatures(allFeatures);
        updateFormField("features", allFeatures);
    };

    return (
        <form>
            <div className="border rounded-xl p-4 mb-6 border-stroke-light">
                <h3 className="text-brand-blue mb-4">Vehicle Features</h3>
                <div className="flex space-x-2 mb-2">
                    <Input
                        type="text"
                        name="feature"
                        value={feature}
                        onChange={handleFeatureChange}
                        onKeyDown={handleKeyboardEvent}
                        maxLength={50}
                        parentClassName="flex-1"
                        placeholder="Add a feature (e.g., Leather Seats, Navigation)"
                    />
                    <Button type="button" onClick={addFeature} className="whitespace-nowrap">
                        Add Feature
                    </Button>
                </div>
                {errors?.properties?.features?.errors?.map((err: string) => (
                    <span key={err} className="text-xs text-destructive mt-1 block">
                        {err}
                    </span>
                ))}
                {error && <span className="text-xs text-destructive mt-1 block">{error}</span>}
                {features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {features.map((i: string) => (
                            <div key={i} className="rounded-md border text-xs font-medium truncate border-transparent bg-accent hover:bg-accent/90 gap-3 flex items-center justify-between p-2">
                                <span className="truncate block">{i}</span>
                                <button type="button" onClick={() => removeFeature(i)} className="cursor-pointer">
                                    <CloseIcon className="h-2.5 w-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No features added yet. Add some features to make your listing more attractive.</p>
                )}
            </div>
            <div className="pt-6 border-t border-stroke-light">
                <div className="flex space-x-3 justify-between">
                    <Button type="button" variant="ghost" leftIcon={<ArrowLeftIcon className="h-3.5 w-3.5" />} onClick={() => setStep((prev) => prev - 1)}>
                        Previous
                    </Button>
                    <Button type="button" rightIcon={<ArrowRightIcon className="h-3.5 w-3.5" />} onClick={() => handleSubmit()}>
                        Next
                    </Button>
                </div>
            </div>
        </form>
    );
}
