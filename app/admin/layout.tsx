import Tabs from "@/components/Tabs";

const data = {
    title: "Admin dashboard",
    description: "Platform management and oversight tools.",
    tabs: [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Users Management", href: "/admin/users" },
        { label: "Listings Moderation", href: "/admin/listings" },
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
            <Tabs tabs={data.tabs} />
            {children}
        </main>
    );
}
