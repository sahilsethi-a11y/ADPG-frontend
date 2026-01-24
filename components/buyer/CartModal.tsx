"use client";

import Image from "@/elements/Image";
import { CarIcon, CartIcon, CheckCircleIcon, DollerIcon, MapPinIcon } from "@/components/Icons";
import { useState } from "react";
import Select from "@/elements/Select";
import Button from "@/elements/Button";
import { type Data } from "@/components/buyer/AddToCardButton";
import PriceBadge from "@/elements/PriceBadge";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import { formatPrice, scrollToField } from "@/lib/utils";
import z from "zod";
import { clearFieldError, ZodTreeError } from "@/validation/shared-schema";
import { useCart } from "@/hooks/useCart";

export const cartFormSchema = z.object({
    paymentType: z.enum(["tokenPayment", "fullPayment"]),
    sourcePort: z.string().min(1, "Please select loading port"),
    destinationPort: z.string().min(1, "Please select destination port"),
    logistics: z.string().min(1, "Please select logistics partner"),
});

type PropsT = {
    cartData: Data;
    quantity?: number;
    vehicleId: string;
    isPriceNegotiated?: boolean;
    onClose: () => void;
};

const initialFormState = {
    paymentType: "tokenPayment",
    sourcePort: "",
    destinationPort: "",
    logistics: "",
};

export default function CartModel({ cartData, quantity = 1, onClose, vehicleId, isPriceNegotiated = false }: Readonly<PropsT>) {
    const [formState, setFormState] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ZodTreeError>();
    const { addToCart } = useCart();

    const selectedPayment = formState.paymentType;

    const updateFormField = (name: string, value: string) => {
        setFormState((prev) => ({ ...prev, [name]: value }));
        clearFieldError(errors, [name]);
    };

    const addVehicleIntoCart = async () => {
        // velidate info
        const result = cartFormSchema.safeParse(formState);
        if (!result.success) {
            const errors = result.error;
            const formattedErrors = z.treeifyError(errors);
            setErrors(formattedErrors);
            // scroll to first field
            const firstField = formattedErrors.properties ? Object.keys(formattedErrors.properties)[0] : null;
            if (firstField) {
                scrollToField(firstField);
            }

            message.error("Please fix the errors before adding to cart");
            return false;
        }
        try {
            setLoading(true);
            const payload = {
                vehicleId,
                isPriceNegotiated,
                quantity,
                ...formState,
            };
            const res = await api.post<{ status: string }>("/inventory/api/v1/inventory/addCart", { body: payload });
            if (res.status === "OK") {
                message.success("Vehicle added into cart");
                addToCart();
                onClose();
            }
        } catch {
            message.error("Failed to add vehicle into cart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md">
            <div className="flex flex-col gap-2 text-center sm:text-left mb-4">
                <h2 className="text-lg leading-none font-semibold text-brand-blue">Add to Cart</h2>
                <p className="text-muted-foreground text-sm">Configure your vehicle purchase with payment options, logistics service, and port selections.</p>
            </div>
            <form className="space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light">
                    <div className="last:pb-6 p-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <Image width={100} height={64} alt="car-img" src={cartData.vehicle.mainImageUrl} className="object-cover rounded-lg w-20" />
                            <div className="flex-1">
                                <h3 className="text-brand-blue">{cartData.vehicle.name}</h3>
                                <div className="text-lg text-brand-blue w-full flex-wrap mt-1 flex items-center gap-1">
                                    {formatPrice(cartData.vehicle?.price?.price, cartData.vehicle?.price?.currency)}
                                    {quantity > 1 && (
                                        <span className="text-xs text-gray-600 ml-2">
                                            × {quantity} = {formatPrice(Number(cartData.vehicle?.price?.price) * quantity, cartData.vehicle?.price?.currency)}
                                        </span>
                                    )}{" "}
                                    <PriceBadge />
                                    {isPriceNegotiated && (
                                        <span className="inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 bg-green-600 text-white text-xs px-2 py-0.5">
                                            Negotiated Price
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1 items-center mt-2">
                                    <span
                                        className={`block font-medium w-fit whitespace-nowrap border text-xs px-2 py-0.5 rounded-md ${
                                            cartData.isBulkAvailable ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-50 text-gray-600 border-gray-300"
                                        }`}>
                                        {cartData.isBulkAvailable ? "Bulk Purchase available" : "Bulk Purchase unavailable"}
                                    </span>
                                    {quantity > 1 && (
                                        <span className="block font-medium w-fit whitespace-nowrap border text-xs px-2 py-0.5 rounded-md  bg-green-600 text-white">{quantity} units selected</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                    <fieldset className="space-y-4">
                        <legend>
                            <h4 className="leading-none text-brand-blue flex items-center gap-2">
                                <DollerIcon className="h-4 w-4" />
                                Payment Option
                            </h4>
                        </legend>
                        <div className="grid gap-2">
                            <label className="flex items-center p-4 gap-2 border border-stroke-light rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    className="accent-brand-blue"
                                    checked={selectedPayment === "tokenPayment"}
                                    onChange={() => setFormState((prev) => ({ ...prev, paymentType: "tokenPayment" }))}
                                />
                                <div className="flex-1 flex items-center justify-between flex-wrap">
                                    <div>
                                        <h5 className="text-brand-blue text-sm">Token Payment</h5>
                                        <p className="text-xs text-gray-600">{cartData.paymentOption.tokenPayment.text}</p>
                                    </div>
                                    <div className="text-brand-blue">{formatPrice(cartData.paymentOption.tokenPayment.price, cartData.vehicle?.price?.currency)}</div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between gap-2 p-4 border border-stroke-light rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    className="accent-brand-blue"
                                    checked={selectedPayment === "fullPayment"}
                                    onChange={() => setFormState((prev) => ({ ...prev, paymentType: "fullPayment" }))}
                                />
                                <div className="flex-1 flex items-center justify-between flex-wrap">
                                    <div>
                                        <h5 className="text-sm text-brand-blue">Full Payment</h5>
                                        <p className="text-xs text-gray-600">Pay the complete vehicle price now</p>
                                    </div>
                                    <div className="text-brand-blue">{formatPrice(cartData.paymentOption?.fullPayment?.price, cartData.vehicle?.price?.currency)}</div>
                                </div>
                            </label>
                        </div>
                        {selectedPayment === "tokenPayment" && cartData.paymentOption?.tokenPayment?.remainingVehiclePayment && (
                            <div className="bg-blue-50 flex items-center gap-2 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs">
                                <CheckCircleIcon />
                                Remaining {formatPrice(cartData.paymentOption.tokenPayment.remainingVehiclePayment, cartData.vehicle?.price?.currency)} will be collected upon delivery
                            </div>
                        )}
                    </fieldset>
                </div>
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                    <h4 className="leading-none text-brand-blue flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        Port of Loading
                    </h4>
                    <Select
                        label="Select your preferred port of loading in China"
                        value={formState.sourcePort}
                        options={cartData.portOfLoading.map((item) => ({
                            value: item,
                            label: item,
                        }))}
                        placeholder="Select port"
                        onChange={(value) => updateFormField("sourcePort", value)}
                        border="border border-stroke-light bg-input-background"
                        labelCls="text-gray-600 text-sm"
                        required
                        name="sourcePort"
                        errors={errors?.properties?.sourcePort?.errors}
                    />
                </div>
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                    <h4 className="leading-none text-brand-blue flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        Destination Port
                    </h4>
                    <Select
                        label="Select your preferred destination port in the UAE"
                        value={formState.destinationPort}
                        options={cartData.destinationPort.map((item) => ({
                            value: item,
                            label: item,
                        }))}
                        placeholder="Select port"
                        onChange={(value) => updateFormField("destinationPort", value)}
                        border="border border-stroke-light bg-input-background"
                        labelCls="text-gray-600 text-sm"
                        required
                        name="destinationPort"
                        errors={errors?.properties?.destinationPort?.errors}
                    />
                </div>
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                    <h4 className="leading-none text-brand-blue flex items-center gap-2">
                        <CarIcon className="h-4 w-4" />
                        Logistics Service
                    </h4>
                    <Select
                        label="Select your preferred logistics service provider"
                        value={formState.logistics}
                        options={cartData.logisticServices?.services?.map((item) => ({
                            value: item,
                            label: item,
                        }))}
                        name="logistics"
                        placeholder="Select logistics service"
                        onChange={(value) => updateFormField("logistics", value)}
                        border="border border-stroke-light bg-input-background"
                        labelCls="text-gray-600 text-sm"
                        required
                        errors={errors?.properties?.logistics?.errors}
                    />
                    <div className="bg-blue-50 flex items-center gap-2 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs">
                        <CheckCircleIcon />
                        Logistics charges: {formatPrice(cartData.logisticServices?.price, cartData.vehicle?.price?.currency)} (included in total)
                    </div>
                </div>

                <div className="text-foreground flex flex-col gap-6 rounded-xl border bg-blue-50 border-blue-200 p-6">
                    <h4 className="leading-none text-brand-blue">Order Summary</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span> {selectedPayment === "tokenPayment" ? "Vehicle (token):" : "Vehicle (full):"}</span>
                            <span className="text-brand-blue">
                                {formatPrice(
                                    selectedPayment === "tokenPayment" ? cartData.paymentOption.tokenPayment.price : cartData.paymentOption.fullPayment.price,
                                    cartData.vehicle?.price?.currency
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Logistics Charges:</span>
                            <span className="text-brand-blue">{formatPrice(cartData.logisticServices?.price, cartData.vehicle?.price?.currency)}</span>
                        </div>

                        <div className="flex justify-between items-center text-lg pt-3 border-t border-stroke-light">
                            <span className="font-medium">Total to Pay Now:</span>
                            <span className="font-bold text-brand-blue">
                                {formatPrice(
                                    Number(cartData.logisticServices?.price) +
                                        Number(selectedPayment === "tokenPayment" ? cartData.paymentOption.tokenPayment.price : cartData.paymentOption.fullPayment.price),
                                    cartData.vehicle?.price?.currency
                                )}
                            </span>
                        </div>
                        {selectedPayment === "tokenPayment" && cartData.paymentOption.tokenPayment?.remainingVehiclePayment && (
                            <div className="text-sm text-gray-600 mt-2">
                                Remaining vehicle payment of {formatPrice(cartData.paymentOption?.tokenPayment?.remainingVehiclePayment, cartData.vehicle?.price?.currency)} due on delivery
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button variant="ghost" size="md" type="button" fullWidth={true} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="button" loading={loading} onClick={addVehicleIntoCart} size="md" fullWidth={true} leftIcon={<CartIcon className="h-4 w-4 mr-2" />}>
                        Add to Cart
                    </Button>
                </div>
            </form>
        </div>
    );
}
