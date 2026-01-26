import { AddIcon, BankCardIcon, EditIcon, MessageSquareIcon } from "@/components/Icons";
import Tabs from "@/components/Tabs";
import Link from "next/link";
const data = {
    title: "Dealer Dashboard",
    description: "Welcome back! Here's your business overview.",
    tabs: [
        { label: "Dashboard", href: "/dealer/dashboard" },
        { label: "Inventory", href: "/dealer/inventory" },
        { label: "Orders", href: "/dealer/orders" },
        // { label: "Profile Settings", href: "/seller/profile" },
    ],
};

export default function SellerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-medium">{data.title}</h1>
                    <p className="text-gray-600">{data.description}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/seller/listings" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <EditIcon className="w-4 h-4" />
                        My Listings
                    </Link>
                    <button
                        type="button"
                        // href="/update-bank-details"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <BankCardIcon className="w-4 h-4" />
                        Update Bank Details
                    </button>{" "}
                    <Link
                        href="/seller/negotiations"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <MessageSquareIcon className="w-4 h-4" />
                        Manage Negotiations
                    </Link>
                    <Link href="/seller/add-vehicle" className="flex bg-brand-blue items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                        <AddIcon className="w-4 h-4" />
                        Add New Vehicle
                    </Link>
                </div>
            </div>
            <Tabs tabs={data.tabs} />
            {children}
        </main>
    );
}
