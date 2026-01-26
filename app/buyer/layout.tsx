import Tabs from "@/components/Tabs";

const data = {
    title: " Buyer Dashboard",
    description:
        "Manage your purchases, track orders, and explore new vehicles.",
    tabs: [
        { label: "Dashboard", href: "/buyer/dashboard" },
        { label: "Orders", href: "/buyer/orders" },
        { label: "Shortlisted", href: "/buyer/shortlisted" },
        { label: "Profile", href: "/buyer/profile" },
        { label: "Negotiations", href: "/my-negotiations" },
    ],
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-medium">{data.title}</h1>
            <p className="text-gray-600 mb-8">{data.description}</p>
            <Tabs tabs={data.tabs} fullWidth={true} />
            {children}
        </main>
    );
}
