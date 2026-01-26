"use client";

import { ImageIcon, Spinner, UploadIcon } from "@/components/Icons";
import Button from "@/elements/Button";
import Image from "@/elements/Image";
import { ChangeEvent } from "react";

type BannerUploadProps = {
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeBanner: () => void;
    image: string;
    loading: boolean;
};

export default function BannerUpload({ handleFileChange, removeBanner, image, loading }: Readonly<BannerUploadProps>) {
    return (
        <div className="border border-stroke-light p-6 space-y-6 rounded-xl">
            <h4 data-slot="card-title" className="leading-none text-brand-blue flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Banner Image
            </h4>
            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                {image && <Image src={image} alt="user banner" height={128} width={558} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />}
            </div>
            <div className="flex flex-col gap-2">
                <label className="cursor-pointer">
                    <div
                        className={`flex items-center justify-center w-full gap-2 h-12 border-2 border-dashed border-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors ${
                            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}>
                        {loading ? <Spinner className="text-brand-blue h-4 w-4" /> : <UploadIcon className="h-4 w-4 text-brand-blue" />}
                        <span className="text-brand-blue text-sm font-medium">Upload Banner Image</span>
                    </div>
                    <input disabled={loading} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="text-xs text-gray-500">Recommended size: 1200x300px. Max file size: 5MB</p>
            </div>
            {image && (
                <Button type="reset" onClick={removeBanner} variant="ghost" fullWidth>
                    Remove Banner
                </Button>
            )}
        </div>
    );
}
