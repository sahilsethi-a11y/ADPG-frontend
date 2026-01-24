"use client";
import { useState, useEffect, useRef } from "react";

type PropsT = {
    min: number;
    max: number;
    step?: number;
    value?: [number, number];
    onChange: (value: [number, number]) => void;
    label?: string;
    formatValue?: (val: number) => string | number;
    className?: string;
};

export default function DoubleRangeSlider({ min, max, step = 1, value = [min, max], onChange, label, formatValue = (val) => val }: Readonly<PropsT>) {
    const [minVal, setMinVal] = useState(value?.[0] || min);
    const [maxVal, setMaxVal] = useState(value?.[1] || max);
    const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);
    const sliderContainerRef = useRef<HTMLDivElement>(null);

    const getClientX = (e: MouseEvent | TouchEvent) => {
        if ("touches" in e) {
            return e.touches[0]?.clientX ?? e.changedTouches[0].clientX;
        }
        return e.clientX;
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!activeThumb) return;

            const slider = sliderContainerRef.current?.getBoundingClientRect();
            if (!slider) return;

            const clientX = getClientX(e);
            let position = (clientX - slider.left) / slider.width;
            position = Math.max(0, Math.min(1, position));
            const newValue = Math.round((max - min) * position + min);

            if (activeThumb === "min") {
                const newMin = Math.min(Math.max(min, newValue), maxVal - step);
                setMinVal(newMin);
                onChange([newMin, maxVal]);
            } else {
                const newMax = Math.max(Math.min(max, newValue), minVal + step);
                setMaxVal(newMax);
                onChange([minVal, newMax]);
            }
        };

        const endDrag = () => setActiveThumb(null);

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", endDrag);

        document.addEventListener("touchmove", handleMove, { passive: false });
        document.addEventListener("touchend", endDrag);

        return () => {
            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", endDrag);
            document.removeEventListener("touchmove", handleMove);
            document.removeEventListener("touchend", endDrag);
        };
    }, [activeThumb, min, max, minVal, maxVal, step]);

    const startDrag = (thumb: "min" | "max") => {
        setActiveThumb(thumb);
    };

    // ⭐ NEW: CLICK-TO-JUMP HANDLER
    const handleTrackClick = (e: React.MouseEvent | React.TouchEvent) => {
        const slider = sliderContainerRef.current?.getBoundingClientRect();
        if (!slider) return;

        const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;

        let position = (clientX - slider.left) / slider.width;
        position = Math.max(0, Math.min(1, position));
        const clickedValue = Math.round((max - min) * position + min);

        // Pick nearest thumb
        const distanceToMin = Math.abs(clickedValue - minVal);
        const distanceToMax = Math.abs(clickedValue - maxVal);

        if (distanceToMin < distanceToMax) {
            const newMin = Math.min(clickedValue, maxVal - step);
            setMinVal(newMin);
            onChange([newMin, maxVal]);
        } else {
            const newMax = Math.max(clickedValue, minVal + step);
            setMaxVal(newMax);
            onChange([minVal, newMax]);
        }
    };

    const getThumbPosition = (val: number) => `${((val - min) / (max - min)) * 100}%`;

    return (
        <div className="space-y-3">
            <h4 className="text-brand-blue">{label}</h4>

            <div className="px-3">
                <div ref={sliderContainerRef} className="relative flex h-3.5 items-center" onMouseDown={handleTrackClick} onTouchStart={handleTrackClick} style={{ touchAction: "none" }}>
                    <div className="absolute w-full h-3.5 rounded-full bg-accent/40" />

                    <div
                        className="absolute h-3.5 rounded-full bg-black"
                        style={{
                            left: getThumbPosition(minVal),
                            width: `calc(${getThumbPosition(maxVal)} - ${getThumbPosition(minVal)})`,
                        }}
                    />

                    {/* MIN THUMB */}
                    <div
                        className={`absolute h-4 w-4 rounded-full bg-white border-2 border-black shadow-md -ml-2 z-20 cursor-pointer ${
                            activeThumb === "min" ? "ring-2 ring-offset-2 ring-blue-500" : ""
                        }`}
                        style={{ left: getThumbPosition(minVal) }}
                        onMouseDown={(e) => startDrag("min")}
                        onTouchStart={(e) => startDrag("min")}
                    />

                    {/* MAX THUMB */}
                    <div
                        className={`absolute h-4 w-4 rounded-full bg-white border-2 border-black shadow-md -ml-2 z-20 cursor-pointer ${
                            activeThumb === "max" ? "ring-2 ring-offset-2 ring-blue-500" : ""
                        }`}
                        style={{ left: getThumbPosition(maxVal) }}
                        onMouseDown={(e) => startDrag("max")}
                        onTouchStart={(e) => startDrag("max")}
                    />
                </div>

                <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{formatValue(minVal)}</span>
                    <span>{formatValue(maxVal)}</span>
                </div>
            </div>
        </div>
    );
}
