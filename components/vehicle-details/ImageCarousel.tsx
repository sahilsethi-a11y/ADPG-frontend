"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";

export default function ImageCarousel({
    images,
}: Readonly<{ images: string[] }>) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    return (
        <div className="relative">
            <div className="w-full h-[380px] rounded-md overflow-hidden relative">
                {images.length > 0 && (
                    <Image
                        key={images[currentIndex]}
                        preload={true}
                        width={664}
                        height={372}
                        src={images[currentIndex]}
                        alt="car-image"
                        className="w-full h-full object-cover"
                    />
                )}
                <button
                    onClick={prevSlide}
                    className="absolute left-[11px] top-[170px] w-8 h-8 bg-black bg-opacity-50 rounded-[45px] flex items-center justify-center hover:bg-opacity-70 transition-all"
                >
                    <ArrowLeftIcon className="h-5 w-5 text-white" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-[11px] top-[170px] w-8 h-8 bg-[#24272c] bg-opacity-50 rounded-[45px] flex items-center justify-center hover:bg-opacity-70 transition-all"
                >
                    <ArrowRightIcon className="h-5 w-5 text-white" />
                </button>
            </div>
        </div>
    );
}
