import QuickActions from "@/components/seller/QuickActions";
import Tabs from "@/components/Tabs";
const data = {
    title: " Seller Dashboard",
    description: "Manage your vehicle listings and track your sales.",
    tabs: [
        { label: "Dashboard", href: "/seller/dashboard" },
        { label: "Inventory", href: "/seller/inventory" },
        { label: "Orders", href: "/seller/orders" },
        { label: "Profile Settings", href: "/seller/profile" },
    ],
};

export default function SellerLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-medium">{data.title}</h1>
                    <p className="text-gray-600">{data.description}</p>
                </div>
                <QuickActions />
            </div>
            <Tabs tabs={data.tabs} />
            {children}
        </main>
    );
}
