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

type NegotiationOrder = {
    conversationId: string;
    logisticsPartner: "UGR" | "None";
    selectedPort?: string;
    destinationPort?: string;
    items: Array<{
        bucketKey: string;
        name: string;
        totalUnits: number;
        unitPrice: number;
        currency: string;
        discountPercent: number;
        total: number;
        mainImageUrl?: string;
        brand?: string;
        model?: string;
        variant?: string;
        color?: string;
        year?: number;
        condition?: string;
        bodyType?: string;
    }>;
    totals: {
        total: number;
        downpayment: number;
        pending: number;
    };
};

export default function CartList({
    list = [],
    negotiationOrders = [],
    selectedNegotiations = {},
    onToggleNegotiation,
    onRemoveNegotiation,
    onSelectAllNegotiations,
}: Readonly<{
    list: Cart[];
    negotiationOrders?: NegotiationOrder[];
    selectedNegotiations?: Record<string, boolean>;
    onToggleNegotiation?: (id: string) => void;
    onRemoveNegotiation?: (id: string) => void;
    onSelectAllNegotiations?: (value: boolean) => void;
}>) {
    const router = useRouter();

    if (list?.length < 1 && negotiationOrders.length < 1) {
        return (
            <div className="flex justify-center">
                <div className="p-4 border rounded-2xl border-stroke-light">Cart is Empty</div>
            </div>
        );
    }

    const selectedItems = list.filter((i) => i.isSelected) ?? [];
    const isAllSelected = selectedItems?.length === list.length && Object.values(selectedNegotiations).every(Boolean);
    const selectedUnits = selectedItems.reduce((acc, i) => acc + i.quantity, 0);
    const fobTotal = selectedItems.reduce((acc, i) => acc + i.quantity * i.price, 0);
    const logisticsFees = selectedItems.reduce((acc, i) => acc + i.quantity * i.logisticPrice, 0);
    const negotiatedTotal = negotiationOrders.reduce(
        (acc, o) => acc + (selectedNegotiations[o.conversationId] ? o.totals?.total ?? 0 : 0),
        0
    );
    const negotiatedUnits = negotiationOrders.reduce(
        (acc, o) =>
            acc +
            (selectedNegotiations[o.conversationId]
                ? o.items.reduce((sum, i) => sum + (i.totalUnits || 0), 0)
                : 0),
        0
    );
    const tatalPayable = fobTotal + logisticsFees + negotiatedTotal;

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

    const currency = list?.[0]?.currency || negotiationOrders?.[0]?.items?.[0]?.currency;

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between p-4 border border-stroke-light rounded-xl">
                    <label className="flex gap-2">
                        <input
                            className="accent-brand-blue"
                            checked={isAllSelected}
                            onChange={() => {
                                handleSelectAll();
                                onSelectAllNegotiations?.(!isAllSelected);
                            }}
                            type="checkbox"
                        />
                        <span>Select All ({list.length + negotiationOrders.length} Items)</span>
                    </label>
                    <div className="text-sm text-gray-600">
                        {selectedItems?.length + Object.values(selectedNegotiations).filter(Boolean).length} of{" "}
                        {list.length + negotiationOrders.length} selected
                    </div>
                </div>
                {list?.map((i) => (
                    <CartCard key={i.cartId} item={i} />
                ))}
                {negotiationOrders.map((order) => (
                    <NegotiationOrderCard
                        key={order.conversationId}
                        order={order}
                        currencyFallback={currency}
                        isSelected={Boolean(selectedNegotiations[order.conversationId])}
                        onToggle={() => onToggleNegotiation?.(order.conversationId)}
                        onRemove={() => onRemoveNegotiation?.(order.conversationId)}
                    />
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
                            <span>{selectedUnits + negotiatedUnits}</span>
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

const NegotiationOrderCard = ({
    order,
    currencyFallback,
    isSelected,
    onToggle,
    onRemove,
}: {
    order: {
        conversationId: string;
        logisticsPartner: "UGR" | "None";
        selectedPort?: string;
        destinationPort?: string;
        items: Array<{
            bucketKey: string;
            name: string;
            totalUnits: number;
            unitPrice: number;
            currency: string;
            discountPercent: number;
            total: number;
        }>;
        totals: {
            total: number;
            downpayment: number;
            pending: number;
        };
    };
    currencyFallback?: string;
    isSelected?: boolean;
    onToggle?: () => void;
    onRemove?: () => void;
}) => {
    return (
        <div className="p-4 border border-stroke-light rounded-xl">
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex gap-4">
                    <input className="accent-brand-blue self-baseline" checked={!!isSelected} onChange={onToggle} type="checkbox" />
                    <div className="h-20 w-20 rounded bg-gray-100 overflow-hidden">
                        {order.items?.[0]?.mainImageUrl ? (
                            <img src={order.items[0].mainImageUrl} alt={order.items[0].name} className="h-full w-full object-cover" />
                        ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">Order</div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                    <div className="flex items-start gap-4 justify-between flex-wrap">
                        <div>
                            <h3 className="text-lg text-brand-blue">Negotiated Order</h3>
                            <p className="text-sm text-gray-600">
                                {order.items.length} buckets •{" "}
                                {order.items.reduce((acc, i) => acc + (i.totalUnits || 0), 0)} units
                            </p>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div>From: {order.selectedPort || "—"}</div>
                                <div>To: {order.destinationPort || "—"}</div>
                                <div>Logistics: {order.logisticsPartner}</div>
                            </div>
                            <div className="mt-2">
                                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium">
                                    Token Payment
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl text-brand-blue">
                                {formatPrice(order.totals.total, order.items[0]?.currency || currencyFallback)}
                            </div>
                            <div className="text-xs text-gray-500">
                                Down payment:{" "}
                                {formatPrice(order.totals.downpayment, order.items[0]?.currency || currencyFallback)}
                            </div>
                            <div className="text-xs text-gray-500">
                                Pending: {formatPrice(order.totals.pending, order.items[0]?.currency || currencyFallback)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        {order.items.map((item) => (
                            <div key={item.bucketKey} className="flex items-center justify-between text-sm border border-stroke-light rounded-md p-2">
                                <div className="min-w-0 flex items-center gap-3">
                                    <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden shrink-0">
                                        {item.mainImageUrl ? (
                                            <img src={item.mainImageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : null}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{item.name}</div>
                                        <div className="text-xs text-gray-500">Qty: {item.totalUnits}</div>
                                        <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-gray-500">
                                            {[item.year, item.color, item.variant, item.condition, item.bodyType].filter(Boolean).map((v, idx) => (
                                                <span key={`${item.bucketKey}-${idx}`} className="px-1.5 py-0.5 border border-stroke-light rounded-full">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{formatPrice(item.total, item.currency)}</div>
                                    {item.discountPercent > 0 ? (
                                        <div className="text-[11px] text-gray-400 line-through">
                                            {formatPrice(item.unitPrice * item.totalUnits, item.currency)}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={onRemove} size="sm" variant="danger">
                            Remove
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
