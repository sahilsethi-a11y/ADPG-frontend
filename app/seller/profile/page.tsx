import { UserIcon } from "@/components/Icons";
import ProfileForm from "@/components/profile/ProfileForm";
import { api } from "@/lib/api/server-request";
import Link from "next/link";

type Data = {
    data: {
        profileSetting: {
            bannerImage: string;
            website: string;
            specialties: string[];
            description: string;
            businessCompanyName: string;
            workingHours: string;
        };
        userId: string;
    };
};

export default async function Profile() {
    const res = await api.get<Data>("/users/api/v1/users/profile-settings");

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h2 className="text-xl text-brand-blue mb-2">Profile Settings</h2>
                    <p className="text-gray-600 text-sm">Manage your seller profile and public listing page</p>
                </div>
                <Link
                    href={"/seller-details/" + res?.data?.userId}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background px-3.5 py-1.5 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
                    <UserIcon className="w-3.5 h-3.5" />
                    View Public Profile
                </Link>
            </div>
            <ProfileForm data={res?.data?.profileSetting} />
        </div>
    );
}
