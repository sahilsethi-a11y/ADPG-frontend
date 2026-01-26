import RecentOrders from "@/components/buyer/RecentOrders";
import QuickActions from "@/components/buyer/QuickActions";
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
    <div className="bg-white rounded-xl p-6 hover:shadow-md flex items-center justify-between border border-stroke-light">
        <div>
            <h3 className="text-sm text-gray-600">{title}</h3>
            <p className="text-xl">{value}</p>
        </div>
        <div className="opacity-60">{icon}</div>
    </div>
);

interface ActivityItem {
    label: string;
    value: string;
}

interface ActivityOverviewProps {
    title: string;
    items: ActivityItem[];
}

const ActivityOverview = ({ title, items }: ActivityOverviewProps) => (
    <div className="bg-white rounded-xl p-6 border border-stroke-light">
        <h2 className="text-lg  mb-6 text-gray-800">{title}</h2>
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export default function BuyerDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <StatCard
                    title="Total Orders"
                    value="0"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            // className="h-7 w-7 text-blue-600"
                            aria-hidden="true"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                    }
                />

                <StatCard
                    title="Cart Items"
                    value="0"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            // className="h-7 w-7 text-green-600"
                            aria-hidden="true"
                        >
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                            <circle cx="7" cy="17" r="2"></circle>
                            <path d="M9 17h6"></path>
                            <circle cx="17" cy="17" r="2"></circle>
                        </svg>
                    }
                />

                <StatCard
                    title="Shortlisted"
                    value="0"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            // className=" h-7 w-7 text-orange-600"
                            aria-hidden="true"
                        >
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                        </svg>
                    }
                />

                <StatCard
                    title="Active Negotiations"
                    value="0"
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            // className="h-7 w-7 text-purple-600"
                            aria-hidden="true"
                        >
                            <path d="M16 7h6v6"></path>
                            <path d="m22 7-8.5 8.5-5-5L2 17"></path>
                        </svg>
                    }
                />
            </div>

            {/* Activity Overview and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityOverview
                    title="Activity Overview"
                    items={[
                        { label: "Total Views", value: "0" },
                        { label: "Total Inquiries", value: "0" },
                        { label: "Purchase Rate", value: "0" },
                        { label: "Avg Order Value", value: "0" },
                    ]}
                />
                <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
                    <h2 className="leading-none text-brand-blue">
                        Quick Actions
                    </h2>
                    <QuickActions variant="vertical" />
                </div>
            </div>

            <RecentOrders />
        </div>
    );
}
