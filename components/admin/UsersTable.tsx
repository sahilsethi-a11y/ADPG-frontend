"use client";

import { useRef, useState } from "react";
import Select from "@/elements/Select";
import AddDealerForm from "@/components/admin/AddDealerForm";
import Modal from "@/elements/Modal";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { KebabIcon, SearchIcon } from "@/components/Icons";
import ViewUser from "@/components/admin/ViewUser";
import EditUser from "@/components/admin/EditUser";
import { api } from "@/lib/api/client-request";
import Input from "@/elements/Input";
import Pagination from "@/components/Pagination";

export type User = {
    id: string;
    name: string;
    type: string;
    active: boolean;
    emailId: string;
    roleType: string;
    phoneNumber: string;
    createDate: string;
    roleId: string;
    passwordTemporary: boolean;
    roleMetaData?: {
        emiratesIdUrl?: string;
        companyName?: string;
        companyLicenseUrl: string;
        address: string;
        dob: string;
        dealershipName?: string;
        exportLicenseUrl: string;
        nationalIdOrPassportUrl?: string;
        passportUrl?: string;
    };
    locationAttribute?: {
        countryCode: string;
        country: string;
        emirate?: string;
        city?: string;
        district?: string;
    };
};

export type Data = {
    content: User[];
    currentPage: number;
    totalPages: number;
    size: number;
    totalItems: number;
};

const statusOptions = [
    { value: "", label: "All Status" },
    { value: "True", label: "Active" },
    { value: "False", label: "Disabled" },
];
const typeOptions = [
    { value: "All", label: "All Types" },
    { value: "Buyer", label: "Buyer" },
    { value: "Seller", label: "Seller" },
    { value: "Dealer", label: "Dealer" },
];

export const StatusBadge = ({ user: { active, passwordTemporary } }: { user: User }) => {
    const base = "inline-flex items-center px-2 py-0.5 rounded-md text-xs";
    if (passwordTemporary) return <span className={`${base} bg-accent/50`}>Pending Password Reset</span>;
    return active ? <span className={`${base} bg-black text-white`}>Active</span> : <span className={`${base} bg-destructive text-white`}>Disabled</span>;
};

export default function UsersTable({ data: initialData }: Readonly<{ data: Data }>) {
    const [data, setData] = useState(initialData ?? []);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [error, setError] = useState<string | null>(null);
    const [isAddDealerOpen, setIsAddDealerOpen] = useState(false);
    const [isViewUser, setIsViewUser] = useState(false);
    const [isEditUser, setIsEditUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const applyFilter = async (statusFilter: string, typeFilter: string, page: number = initialData.currentPage, size = initialData.size) => {
        setError(null);
        try {
            const res = await api.get<{ data: Data }>("/users/api/v1/users/list", {
                params: {
                    active: statusFilter,
                    roleType: typeFilter === "All" ? undefined : typeFilter,
                    page,
                    size,
                },
            });
            setData(res?.data);
        } catch {
            setError("Failed to fetch users");
        }
    };

    const handleUserDisable = async (id: string) => {
        try {
            await api.put("/users/api/v1/users/disable/" + id);
            applyFilter(statusFilter, typeFilter);
        } catch {
            setError("Failed to disable user");
        }
    };

    const handleUserEnable = async (id: string) => {
        try {
            await api.put("/users/api/v1/users/enable/" + id);
            applyFilter(statusFilter, typeFilter);
        } catch {
            setError("Failed to enable user");
        }
    };

    const filtered = data.content?.filter((u) => {
        if (query && !`${u.name} ${u.emailId} ${u.id}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <>
            <div className="bg-white border border-stroke-light rounded-xl p-6 my-8 ">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-lg">User Management</h2>
                    <button onClick={() => setIsAddDealerOpen(true)} className="bg-brand-blue text-white text-sm px-4 py-2 rounded-md">
                        Add User
                    </button>
                </div>

                <Modal isOpen={isAddDealerOpen} onClose={() => setIsAddDealerOpen(false)}>
                    <AddDealerForm onClose={() => setIsAddDealerOpen(false)} />
                </Modal>
                <Modal isOpen={isViewUser} onClose={() => setIsViewUser(false)}>
                    <ViewUser user={selectedUser} onClose={() => setIsViewUser(false)} />
                </Modal>
                <Modal isOpen={isEditUser} onClose={() => setIsEditUser(false)}>
                    <EditUser
                        user={selectedUser}
                        onClose={(isRefresh) => {
                            setIsEditUser(false);
                            if (isRefresh) applyFilter(statusFilter, typeFilter);
                        }}
                    />
                </Modal>

                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <div className="max-w-sm">
                        <div className="relative">
                            <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="search" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Select
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                applyFilter(value, typeFilter);
                            }}
                            label=""
                            placeholder="Select Status"
                            labelCls="text-base/5.25 text-brand-blue"
                            border="bg-accent/40"
                            cls="w-40"
                        />
                        <Select
                            options={typeOptions}
                            value={typeFilter}
                            onChange={(value) => {
                                setTypeFilter(value);
                                applyFilter(statusFilter, value);
                            }}
                            label=""
                            placeholder="Select Type"
                            labelCls="text-base/5.25 text-brand-blue"
                            border="bg-accent/40"
                            cls="w-40"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {error && <div className="py-6 text-center text-sm text-red-600">{error}</div>}
                    {filtered && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="text-left text-sm">
                                    <th className="py-3 pr-6">User ID</th>
                                    <th className="py-3 pr-6">Name</th>
                                    <th className="py-3 pr-6">Email</th>
                                    <th className="py-3 pr-6">Type</th>
                                    <th className="py-3 pr-6">Status</th>
                                    <th className="py-3 pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filtered.map((u) => (
                                    <tr key={u.id} className="text-sm">
                                        <td className="py-2 pr-6">{u.id}</td>
                                        <td className="py-2 pr-6">{u.name}</td>
                                        <td className="py-2 pr-6">{u.emailId}</td>
                                        <td className="py-2 pr-6">
                                            <span className="inline-block px-3 py-1 border border-stroke-light rounded-md text-xs">{u.roleType}</span>
                                        </td>
                                        <td className="py-2 pr-6">
                                            <StatusBadge user={u} />
                                        </td>
                                        <td className="py-2 pr-6">
                                            <ActionMenu
                                                user={u}
                                                onView={() => {
                                                    setSelectedUser(u);
                                                    setIsViewUser(true);
                                                }}
                                                onEdit={() => {
                                                    setSelectedUser(u);
                                                    setIsEditUser(true);
                                                }}
                                                onDisable={() => handleUserDisable(u.id)}
                                                onEnable={() => handleUserEnable(u.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={(p) => {
                    applyFilter(statusFilter, typeFilter, p, data.size);
                }}
                pageSize={data.size}
                pageSizeOptions={[10, 25, 50, 100]}
                onPageSizeChange={(s) => {
                    applyFilter(statusFilter, typeFilter, initialData.currentPage, s);
                }}
                showQuickJump
                totalItems={data.totalItems}
                currentCount={data.content?.length ?? 0}
            />
        </>
    );
}

const ActionMenu = ({ onView, onEdit, onDisable, onEnable, user }: { onView: () => void; onEdit: () => void; onDisable: () => void; onEnable: () => void; user: User }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    useOutsideClick(ref, () => setOpen(false));

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button onClick={() => setOpen((s) => !s)} className="p-1 rounded-md hover:bg-gray-100" aria-expanded={open} aria-haspopup="true">
                <KebabIcon className="h-4 w-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-md bg-white border border-stroke-light z-10">
                    <div className="p-1">
                        <button
                            onClick={() => {
                                setOpen(false);
                                onView();
                            }}
                            className="w-full text-left px-2 py-1.5 text-sm  hover:bg-accent rounded-sm">
                            View
                        </button>
                        <button
                            onClick={() => {
                                setOpen(false);
                                onEdit();
                            }}
                            className="w-full text-left px-2 py-1.5 text-sm  hover:bg-accent rounded-sm">
                            Edit
                        </button>
                        {user.active ? (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    onDisable();
                                }}
                                className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-sm">
                                Disable
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    onEnable();
                                }}
                                className="w-full text-left px-2 py-1.5 text-sm text-green-600 hover:bg-accent rounded-sm">
                                Enable
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
