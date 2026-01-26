"use client";

import Image from "@/elements/Image";
import { DeleteIcon, LocationIcon, Spinner } from "@/components/Icons";
import PriceBadge from "@/elements/PriceBadge";
import Button from "@/elements/Button";
import { useState } from "react";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export type Cart = {
    cartId: string;
    name: string;
    year: number;
    location: string;
    quantity: number;
    price: number;
    remainingPrice: number;
    paymentType: string;
    mainImageUrl: string;
    sellerCompany: string;
    destinationPort: string;
    sourcePort: string;
    logistics: string;
    currency: string;
    logisticPrice: number;
    inventorySize: number;
    isSelected: boolean;
};

export default function CartList({ list = [] }: Readonly<{ list: Cart[] }>) {
    const router = useRouter();

    if (list?.length < 1) {
        return (
            <div className="flex justify-center">
                <div className="p-4 border rounded-2xl border-stroke-light">Cart is Empty</div>
            </div>
        );
    }

    const selectedItems = list.filter((i) => i.isSelected) ?? [];
    const isAllSelected = selectedItems?.length === list.length;
    const selectedUnits = selectedItems.reduce((acc, i) => acc + i.quantity, 0);
    const fobTotal = selectedItems.reduce((acc, i) => acc + i.quantity * i.price, 0);
    const logisticsFees = selectedItems.reduce((acc, i) => acc + i.quantity * i.logisticPrice, 0);
    const tatalPayable = fobTotal + logisticsFees;

    const handleSelectAll = async () => {
        try {
            const res = await api.put<{ status: string }>("/inventory/api/v1/inventory/updateCart", {
                body: {
                    selectAll: !isAllSelected,
                },
            });
            if (res.status === "OK") {
                router.refresh();
            }
        } catch {
            message.error("Something went wrong");
        }
    };

    const currency = list?.[0]?.currency;

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between p-4 border border-stroke-light rounded-xl">
                    <label className="flex gap-2">
                        <input className="accent-brand-blue" checked={isAllSelected} onChange={() => handleSelectAll()} type="checkbox" />
                        <span>Select All ({list.length} Items)</span>
                    </label>
                    <div className="text-sm text-gray-600">
                        {selectedItems?.length} of {list.length} selected
                    </div>
                </div>
                {list?.map((i) => (
                    <CartCard key={i.cartId} item={i} />
                ))}
            </div>
            <div>
                <div className="flex flex-col gap-6 rounded-xl border border-stroke-light p-6 sticky top-20">
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5">
                        <h4 className="leading-none text-brand-blue">Order Summary</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span>Selected Items:</span>
                            <span>{selectedItems?.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Selected Units:</span>
                            <span>{selectedUnits}</span>
                        </div>
                        <div className="bg-border shrink-0"></div>
                        <div className="flex justify-between">
                            <span>FOB Total:</span>
                            <span>{formatPrice(fobTotal, currency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Logistics Fees:</span>
                            <span>{formatPrice(logisticsFees, currency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform fees:</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div className="bg-border shrink-0 "></div>
                        <div className="flex justify-between text-xl">
                            <span>Total Amount:</span>
                            <span>{formatPrice(tatalPayable, currency)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">* Token payments: Remaining balance will be collected on delivery</div>
                        <Button disabled type="submit" fullWidth={true} size="sm">
                            Checkout {selectedItems?.length} Item
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CartCard = ({ item }: { item: Cart }) => {
    const router = useRouter();
    const { removeFromCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [fullPageLoading, setFullPageLoading] = useState(false);

    const handleRemoveItem = async () => {
        try {
            setLoading(true);
            const res = await api.delete<{ status: string }>("/inventory/api/v1/inventory/removeCart", { params: { cartId: item.cartId } });
            if (res.status === "OK") {
                message.success("Item removed from cart");
                removeFromCart();
                router.refresh();
            }
        } catch {
            message.error("Failed to remove item from cart");
        }
    };

    const handleQuantityUpdate = async (qty: number) => {
        try {
            setFullPageLoading(true);
            const res = await api.put<{ status: string }>("/inventory/api/v1/inventory/updateCart/" + item.cartId, {
                body: {
                    quantity: qty,
                },
            });
            if (res.status === "OK") {
                router.refresh();
            }
        } catch {
            message.error("Failed to update quantity");
        } finally {
            setFullPageLoading(false);
        }
    };

    const handleSelect = async (item: Cart) => {
        try {
            const res = await api.put<{ status: string }>("/inventory/api/v1/inventory/updateCart/" + item.cartId, {
                body: {
                    isSelected: !item.isSelected,
                },
            });

            if (res.status === "OK") {
                router.refresh();
            }
        } catch {
            message.error("Something went wrong");
        }
    };

    return (
        <div>
            {fullPageLoading && (
                <div className="fixed inset-0 flex justify-center items-center h-screen z-60 backdrop-blur-xs">
                    <Spinner />
                </div>
            )}
            <div className="p-4 border border-stroke-light rounded-xl">
                <div className="flex flex-col gap-4 flex-wrap md:flex-row">
                    <div className="flex gap-4">
                        <input className="accent-brand-blue self-baseline" checked={item.isSelected} onChange={() => handleSelect(item)} type="checkbox" />
                        <Image src={item.mainImageUrl} alt={item.name} height={84} width={84} className="h-21 rounded object-cover" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start gap-4 justify-between flex-wrap">
                            <div>
                                <h3 className="text-lg text-brand-blue">{item.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {item.year} • {item.location}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span> {item.sellerCompany}</span>
                                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit ml-2 text-xs text-foreground">Verified</span>
                                </p>
                                {item.inventorySize > 1 && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Quantity:</span>
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                            <button
                                                onClick={() => handleQuantityUpdate(item.quantity - 1)}
                                                disabled={item.quantity < 2}
                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                                -
                                            </button>
                                            <span className="px-4 py-1 min-w-10 text-center border-x border-gray-300">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityUpdate(item.quantity + 1)}
                                                disabled={item.quantity >= item.inventorySize}
                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                                +
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-500">units</span>
                                    </div>
                                )}
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <LocationIcon className="w-2.5 h-2.5 mr-1" />
                                        From: {item.sourcePort}
                                    </p>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <LocationIcon className="w-2.5 h-2.5 mr-1" />
                                        To: {item.destinationPort}
                                    </p>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600 flex items-center">
                                        <LocationIcon className="w-2.5 h-2.5 mr-1" />
                                        Logistics: {item.logistics}
                                    </p>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 text-foreground text-xs">
                                            {item.paymentType === "tokenPayment" ? "Token Payment" : "Full Payment"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="text-xl text-brand-blue">{formatPrice(item.price * item.quantity, item.currency)}</div>
                                        <PriceBadge />
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">Remaining: {formatPrice(item.remainingPrice, item.currency)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button loading={loading} onClick={handleRemoveItem} size="sm" leftIcon={<DeleteIcon className="h-3 w-3" />} type="button" variant="danger">
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
