import { NextResponse } from "next/server";

type CheckoutEmailPayload = {
    buyerEmail: string;
    sellerEmails: string[];
    summary: {
        items: Array<{
            name: string;
            quantity: number;
            price: number;
            currency: string;
            sellerCompany?: string;
            sourcePort?: string;
            destinationPort?: string;
            logistics?: string;
            mainImageUrl?: string;
        }>;
        negotiationOrders: Array<{
            sellerCompany?: string;
            items: Array<{
                name: string;
                totalUnits: number;
                total: number;
                currency: string;
                brand?: string;
                model?: string;
                variant?: string;
                year?: number;
                mainImageUrl?: string;
            }>;
            totals: {
                total: number;
                downpayment: number;
                pending: number;
            };
            selectedPort?: string;
            destinationPort?: string;
            logisticsPartner?: string;
        }>;
        totals: {
            fobTotal: number;
            logisticsFees: number;
            negotiatedTotal: number;
            total: number;
        };
        currency?: string;
    };
};

const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

const formatMoney = (value: number, currency?: string) => {
    if (!currency) return value.toLocaleString();
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
};

const buildEmailText = (payload: CheckoutEmailPayload, role: "buyer" | "seller") => {
    const { summary } = payload;
    const currency = summary.currency;
    const lines: string[] = [];
    lines.push(role === "buyer" ? "Checkout summary" : "New checkout summary");
    lines.push("");
    if (summary.items?.length) {
        lines.push("Cart Items:");
        for (const item of summary.items) {
            lines.push(
                `- ${item.name} x${item.quantity} (${formatMoney(
                    item.price * item.quantity,
                    item.currency
                )})`
            );
            if (item.sellerCompany) lines.push(`  Seller: ${item.sellerCompany}`);
            if (item.sourcePort) lines.push(`  From: ${item.sourcePort}`);
            if (item.destinationPort) lines.push(`  To: ${item.destinationPort}`);
            if (item.logistics) lines.push(`  Logistics: ${item.logistics}`);
        }
        lines.push("");
    }
    if (summary.negotiationOrders?.length) {
        lines.push("Negotiated Orders:");
        for (const order of summary.negotiationOrders) {
            const units = order.items.reduce((acc, i) => acc + (i.totalUnits || 0), 0);
            lines.push(`- ${units} units (${formatMoney(order.totals.total, currency)})`);
            if (order.sellerCompany) lines.push(`  Seller: ${order.sellerCompany}`);
            if (order.selectedPort) lines.push(`  From: ${order.selectedPort}`);
            if (order.destinationPort) lines.push(`  To: ${order.destinationPort}`);
            if (order.logisticsPartner) lines.push(`  Logistics: ${order.logisticsPartner}`);
            lines.push("  Buckets:");
            for (const b of order.items) {
                const nameParts = [b.year, b.brand, b.model, b.variant].filter(Boolean).join(" ");
                const bucketName = nameParts ? `${b.name} (${nameParts})` : b.name;
                lines.push(
                    `   - ${bucketName} x${b.totalUnits} (${formatMoney(b.total, b.currency)})`
                );
            }
            lines.push(
                `  Downpayment: ${formatMoney(order.totals.downpayment, currency)}`
            );
            lines.push(`  Pending: ${formatMoney(order.totals.pending, currency)}`);
            lines.push(`  Total: ${formatMoney(order.totals.total, currency)}`);
        }
        lines.push("");
    }
    lines.push(`FOB Total: ${formatMoney(summary.totals.fobTotal, currency)}`);
    lines.push(`Logistics Fees: ${formatMoney(summary.totals.logisticsFees, currency)}`);
    lines.push(`Negotiated Total: ${formatMoney(summary.totals.negotiatedTotal, currency)}`);
    lines.push(`Total Amount: ${formatMoney(summary.totals.total, currency)}`);
    return lines.join("\n");
};

const buildEmailHtml = (payload: CheckoutEmailPayload, role: "buyer" | "seller") => {
    const { summary } = payload;
    const currency = summary.currency;
    const itemsHtml = summary.items
        .map((item) => {
            const lines = [
                `<strong>${item.name} x${item.quantity}</strong> — ${formatMoney(
                    item.price * item.quantity,
                    item.currency
                )}`,
                item.sellerCompany ? `Seller: ${item.sellerCompany}` : null,
                item.sourcePort ? `From: ${item.sourcePort}` : null,
                item.destinationPort ? `To: ${item.destinationPort}` : null,
                item.logistics ? `Logistics: ${item.logistics}` : null,
            ].filter(Boolean);
            const img = item.mainImageUrl
                ? `<div style="margin:6px 0;"><img src="${item.mainImageUrl}" alt="${item.name}" width="180" style="border-radius:8px; display:block;" /></div>`
                : "";
            return `<li>${img}${lines.join("<br />")}</li>`;
        })
        .join("");
    const negotiationHtml = summary.negotiationOrders
        .map((order) => {
            const units = order.items.reduce((acc, i) => acc + (i.totalUnits || 0), 0);
            const buckets = order.items
                .map((b) => {
                    const nameParts = [b.year, b.brand, b.model, b.variant].filter(Boolean).join(" ");
                    const bucketName = nameParts ? `${b.name} (${nameParts})` : b.name;
                    const img = b.mainImageUrl
                        ? `<div style="margin:6px 0;"><img src="${b.mainImageUrl}" alt="${bucketName}" width="160" style="border-radius:8px; display:block;" /></div>`
                        : "";
                    return `<li>${img}${bucketName} x${b.totalUnits} — ${formatMoney(b.total, b.currency)}</li>`;
                })
                .join("");
            return `
                <li>
                    <strong>${units} units — ${formatMoney(order.totals.total, currency)}</strong>
                    <div style="margin-top:6px;">
                        ${order.sellerCompany ? `Seller: ${order.sellerCompany}<br />` : ""}
                        ${order.selectedPort ? `From: ${order.selectedPort}<br />` : ""}
                        ${order.destinationPort ? `To: ${order.destinationPort}<br />` : ""}
                        ${order.logisticsPartner ? `Logistics: ${order.logisticsPartner}<br />` : ""}
                        <strong>Buckets</strong>
                        <ul>${buckets}</ul>
                        <div>Downpayment: ${formatMoney(order.totals.downpayment, currency)}</div>
                        <div>Pending: ${formatMoney(order.totals.pending, currency)}</div>
                        <div>Total: ${formatMoney(order.totals.total, currency)}</div>
                    </div>
                </li>
            `;
        })
        .join("");
    return `
        <div style="font-family: Arial, sans-serif; line-height:1.4;">
            <h2>${role === "buyer" ? "Checkout summary" : "New checkout summary"}</h2>
            ${summary.items?.length ? `<h3>Cart Items</h3><ul>${itemsHtml}</ul>` : ""}
            ${summary.negotiationOrders?.length ? `<h3>Negotiated Orders</h3><ul>${negotiationHtml}</ul>` : ""}
            <h3>Totals</h3>
            <ul>
                <li>FOB Total: ${formatMoney(summary.totals.fobTotal, currency)}</li>
                <li>Logistics Fees: ${formatMoney(summary.totals.logisticsFees, currency)}</li>
                <li>Negotiated Total: ${formatMoney(summary.totals.negotiatedTotal, currency)}</li>
                <li><strong>Total Amount: ${formatMoney(summary.totals.total, currency)}</strong></li>
            </ul>
        </div>
    `;
};

const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_FROM_EMAIL;
    if (!apiKey || !from) {
        throw new Error("Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL");
    }

    const res = await fetch(SENDGRID_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: from },
            subject,
            content: [
                { type: "text/plain", value: text },
                { type: "text/html", value: html },
            ],
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "SendGrid error");
    }
};

export async function POST(req: Request) {
    try {
        const payload = (await req.json()) as CheckoutEmailPayload;
        if (!payload?.buyerEmail) {
            return new NextResponse("Missing buyer email", { status: 400 });
        }
        const buyerText = buildEmailText(payload, "buyer");
        const buyerHtml = buildEmailHtml(payload, "buyer");
        await sendEmail(payload.buyerEmail, "Checkout Summary", buyerText, buyerHtml);

        const uniqueSellers = Array.from(new Set(payload.sellerEmails || [])).filter(Boolean);
        if (uniqueSellers.length > 0) {
            const sellerText = buildEmailText(payload, "seller");
            const sellerHtml = buildEmailHtml(payload, "seller");
            for (const email of uniqueSellers) {
                await sendEmail(email, "New Checkout Summary", sellerText, sellerHtml);
            }
        }

        return NextResponse.json({ status: "ok", sellersNotified: uniqueSellers.length });
    } catch (err) {
        return new NextResponse((err as Error).message || "Failed to send email", { status: 500 });
    }
}
