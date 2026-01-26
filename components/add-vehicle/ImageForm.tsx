import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, UploadIcon } from "@/components/Icons";
import { Dispatch, SetStateAction } from "react";
import type { FormState } from "@/components/add-vehicle/VehicleForm";
import Image from "@/elements/Image";
import message from "@/elements/message";
import { uploadFile } from "@/lib/data";
import Button from "@/elements/Button";
import { ZodTreeError } from "@/validation/shared-schema";

const MAX_IMAGE_COUNT = 10;

type PropsT = {
    formState: FormState;
    updateFormField: (name: Partial<keyof FormState>, value: string | string[], errorPath?: (string | number)[]) => void;
    setStep: Dispatch<SetStateAction<number>>;
    handleSubmit: () => void;
    errors?: ZodTreeError;
};

export default function ImageForm({ formState, updateFormField, setStep, handleSubmit, errors }: Readonly<PropsT>) {
    const images = formState.imageUrls || [];
    const mainImage = formState.mainImageUrl || "";

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const total = images.length + files.length;

        if (total > MAX_IMAGE_COUNT) {
            message.error(`You can only upload a maximum of ${MAX_IMAGE_COUNT} images total.`);
            e.target.value = "";
            return;
        }

        try {
            const filesArray = [];
            for (const file of files) {
                const res = uploadFile<{ data: { fileLocation: string } }>(file);
                filesArray.push(res);
            }
            const newFilesArray = await Promise.all(filesArray);
            const newImages = [...images, ...newFilesArray.map((i) => i.data.fileLocation)];
            updateFormField("imageUrls", newImages);
            e.target.value = "";
        } catch {
            message.error("Failed to upload file");
        }
    };

    const removeImage = (image: string) => {
        const newImages = images.filter((i) => i !== image);
        updateFormField("imageUrls", newImages);

        if (image === mainImage) {
            updateFormField("mainImageUrl", "");
        }
    };

    return (
        <div>
            <div className="border rounded-xl p-4 mb-6 border-stroke-light">
                <h3 className="text-brand-blue mb-6">Vehicle Images</h3>
                <div className="flex justify-between space-x-2 mb-2">
                    <p className="text-muted-foreground">
                        Upload up to {MAX_IMAGE_COUNT} images ({images.length}/{MAX_IMAGE_COUNT})
                    </p>

                    <label className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-primary-foreground h-9 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 flex items-center text-white">
                        <span className="flex items-center gap-1">
                            <UploadIcon className="h-4 w-4" />
                            Upload
                        </span>
                        <input name="image" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e)} accept="image/*" />
                    </label>
                </div>
                <div className="mb-2">
                    {errors?.properties?.mainImageUrl?.errors?.map((err: string) => (
                        <span key={err} className="text-xs text-destructive mt-1 block">
                            {err}
                        </span>
                    ))}
                    {errors?.properties?.imageUrls?.errors?.map((err: string) => (
                        <span key={err} className="text-xs text-destructive mt-1 block">
                            {err}
                        </span>
                    ))}
                </div>
                {images.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {images.map((i: string) => (
                            <div key={i} className="relative h-48 w-full group">
                                <Image
                                    fill={true}
                                    height={192}
                                    width={192}
                                    src={i}
                                    alt="user uploaded image"
                                    className="object-cover rounded-lg"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <button
                                    onClick={() => removeImage(i)}
                                    type="button"
                                    className=" hidden group-hover:block cursor-pointer absolute top-2 right-2 p-2 transition-all z-1 text-white bg-destructive rounded-md hover:bg-destructive/90">
                                    <CloseIcon className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => updateFormField("mainImageUrl", i)}
                                    type="button"
                                    className="hidden group-hover:block cursor-pointer absolute inset-1/2 w-fit h-fit px-2 py-1 transition-all z-1 text-black bg-accent/30 backdrop-blur-md -translate-1/2 whitespace-nowrap rounded-md hover:bg-accent/10">
                                    Set as main image
                                </button>
                                {mainImage === i && <span className="py-1 px-2 bg-brand-blue text-white absolute bottom-1 left-1 rounded-lg text-xs">Main Image</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                        <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No images uploaded yet</p>
                        <p className="text-sm text-muted-foreground">Click &quot;Add Image&quot; to upload your first image</p>
                    </div>
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
        </div>
    );
}
