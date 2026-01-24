import UsersTable, { type Data } from "@/components/admin/UsersTable";
import { api } from "@/lib/api/server-request";

export default async function Users() {
    const res = await api.get<{ data: Data }>("/users/api/v1/users/list", { params: { size: 10 } });

    return (
        <main>
            <UsersTable data={res.data} />
        </main>
    );
}
