import { api } from "@/lib/api/server-request";

export default async function AdminDashboard() {
    const res = await api.get<{ data: { activeListing: number; platformRevenue: number; totalUsers: number; pendingVerifications: number } }>("/analytics/api/v1/analytics/dashboard-analytics");
    const data = res.data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <StatCard
                title="Total Users"
                value={data?.totalUsers ?? 0}
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7 text-blue-600"
                        aria-hidden="true">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                }
            />

            <StatCard
                title="Active Listings"
                value={data?.activeListing ?? 0}
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7 text-green-600"
                        aria-hidden="true">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                        <circle cx="7" cy="17" r="2"></circle>
                        <path d="M9 17h6"></path>
                        <circle cx="17" cy="17" r="2"></circle>
                    </svg>
                }
            />

            <StatCard
                title="Pending Verifications"
                value={data?.pendingVerifications ?? 0}
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className=" h-7 w-7 text-orange-600"
                        aria-hidden="true">
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                    </svg>
                }
            />

            <StatCard
                title="Platform Revenue"
                value={data?.platformRevenue ?? 0}
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7 text-purple-600"
                        aria-hidden="true">
                        <path d="M16 7h6v6"></path>
                        <path d="m22 7-8.5 8.5-5-5L2 17"></path>
                    </svg>
                }
            />
        </div>
    );
}

type StatCardProps = {
    title: string;
    value: number;
    icon: React.ReactNode;
};

const StatCard = ({ title, value, icon }: StatCardProps) => (
    <div className="bg-white rounded-xl p-6 hover:shadow-md flex items-center justify-between border border-stroke-light">
        <div>
            <h3 className="text-sm text-gray-600">{title}</h3>
            <p className="text-xl">{value}</p>
        </div>
        <div className="opacity-60">{icon}</div>
    </div>
);
