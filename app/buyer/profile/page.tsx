import AccSetting from "@/components/buyer/AccSetting";
import PersonalInfo, { type User } from "@/components/buyer/PersonalInfo";
import { api } from "@/lib/api/server-request";

export default async function page() {
    const res = await api.get<{ data: User }>("/users/api/v1/users/buyer-profile");

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PersonalInfo user={res.data} />
                <AccSetting />
            </div>
        </div>
    );
}
