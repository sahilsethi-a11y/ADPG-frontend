import { BuildingIcon, CalendarIcon, CallIcon, CloseIcon, DownloadIcon, EmailIcon, FileIcon, LocationIcon, UserIcon } from "@/components/Icons";
import { StatusBadge, type User } from "@/components/admin/UsersTable";
import { downloadFile } from "@/lib/utils";

export default function ViewUser({ onClose, user }: Readonly<{ onClose: () => void; user: User | null }>) {
    return (
        <div className="relative w-sm text-brand-blue">
            <button onClick={onClose} className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                <CloseIcon />
            </button>
            <h2 className="text-lg font-medium ">User Details</h2>
            {user && (
                <div className="max-h-[80vh] overflow-auto p-2">
                    <div className="border-b pb-6 border-stroke-light">
                        <h3 className="text-sm my-4 ">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-4 text-xs">
                            <div className="flex gap items-start gap-3">
                                <UserIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="font-medium text-gray-500">User ID</div>
                                    <div className="text-black">{user.id}</div>
                                </div>
                            </div>
                            <div className="flex gap items-start gap-3">
                                <UserIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-500">Full Name</div>
                                    <div className="mt-1 text-black">{user.name}</div>
                                </div>
                            </div>
                            <div className="flex gap items-start gap-3">
                                <EmailIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-500">Email</div>
                                    <div className="mt-1 text-black">{user.emailId}</div>
                                </div>
                            </div>
                            <div className="flex gap items-start gap-3">
                                <CallIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-500">Mobile</div>
                                    <div className="mt-1 text-black">{user.phoneNumber}</div>
                                </div>
                            </div>
                            {user.roleMetaData?.dob && (
                                <div className="flex gap items-start gap-3">
                                    <CalendarIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                    <div>
                                        <div className="font-medium text-gray-500">Date of Birth</div>
                                        <div className="mt-1 text-black">{user.roleMetaData.dob}</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap items-start gap-3">
                                <UserIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-500">User Type</div>
                                    <div className="mt-1 text-black">{user.roleType}</div>
                                </div>
                            </div>
                            <div className="flex gap items-start gap-3">
                                <UserIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                <div>
                                    <div className="font-medium text-gray-500">Status</div>
                                    <div className="mt-1 text-black">
                                        <StatusBadge user={user} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {user.roleMetaData && (
                        <div className="border-b pb-6 border-stroke-light">
                            <h3 className="text-sm my-4 ">Business Information</h3>
                            <div className="grid grid-cols-1 gap-4 text-xs">
                                <div className="flex gap items-start gap-3">
                                    <BuildingIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-gray-500">Dealership/Company Name</div>
                                        <div className="text-black">{user.roleMetaData?.dealershipName || user.roleMetaData?.companyName}</div>
                                    </div>
                                </div>
                                <div className="flex gap items-start gap-3">
                                    <UserIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                    <div>
                                        <div className="font-medium text-gray-500">Representative Name</div>
                                        <div className="mt-1 text-black">{user.name}</div>
                                    </div>
                                </div>
                                <div className="flex gap items-start gap-3">
                                    <CallIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                    <div>
                                        <div className="font-medium text-gray-500">Representative Mobile</div>
                                        <div className="mt-1 text-black">{user.phoneNumber}</div>
                                    </div>
                                </div>
                                {user.locationAttribute?.emirate && (
                                    <div className="flex gap items-start gap-3">
                                        <LocationIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-500">Emirate</div>
                                            <div className="mt-1 text-black">{user.locationAttribute.emirate}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {user.locationAttribute && (
                        <div className="border-b pb-6 border-stroke-light">
                            <h3 className="text-sm my-4 ">Location Information</h3>
                            <div className="grid grid-cols-1 gap-4 text-xs">
                                {user.roleMetaData?.address && (
                                    <div className="flex gap items-start gap-3">
                                        <LocationIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-500">Address</div>
                                            <div className="mt-1 text-black">{user.roleMetaData.address}</div>
                                        </div>
                                    </div>
                                )}
                                {user.locationAttribute?.city && (
                                    <div className="flex gap items-start gap-3">
                                        <LocationIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-500">City</div>
                                            <div className="mt-1 text-black">{user.locationAttribute.city}</div>
                                        </div>
                                    </div>
                                )}
                                {user.locationAttribute?.district && (
                                    <div className="flex gap items-start gap-3">
                                        <LocationIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-500">District</div>
                                            <div className="mt-1 text-black">{user.locationAttribute.district}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {user.roleMetaData && (
                        <div className="pb-6">
                            <h3 className="text-sm my-4 ">Documents</h3>
                            <div className="grid grid-cols-1 gap-4 text-xs">
                                {user.roleMetaData?.emiratesIdUrl && (
                                    <div className="flex gap items-center gap-3 p-3 rounded-lg bg-gray-100">
                                        <FileIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-black">Emirates ID</div>
                                            <div className="mt-1 text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(user.roleMetaData?.emiratesIdUrl)}
                                            type="button"
                                            className="p-1.5 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {user.roleMetaData?.nationalIdOrPassportUrl && (
                                    <div className="flex gap items-center gap-3 p-3 rounded-lg bg-gray-100">
                                        <FileIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-black">National Id / Passport</div>
                                            <div className="mt-1 text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(user.roleMetaData?.nationalIdOrPassportUrl)}
                                            type="button"
                                            className="p-1.5 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {user.roleMetaData?.companyLicenseUrl && (
                                    <div className="flex gap items-center gap-3 p-3 rounded-lg bg-gray-100">
                                        <FileIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-black">Company License</div>
                                            <div className="mt-1 text-text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(user.roleMetaData?.companyLicenseUrl)}
                                            type="button"
                                            className="p-1.5 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {user.roleMetaData?.exportLicenseUrl && (
                                    <div className="flex gap items-center gap-3 p-3 rounded-lg bg-gray-100">
                                        <FileIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-black">Export License</div>
                                            <div className="mt-1 text-text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(user.roleMetaData?.exportLicenseUrl)}
                                            type="button"
                                            className="p-1.5 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {user.roleMetaData?.passportUrl && (
                                    <div className="flex gap items-center gap-3 p-3 rounded-lg bg-gray-100">
                                        <FileIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-black">Passport</div>
                                            <div className="mt-1 text-text-gray-500">ID Document • Uploaded: {user.createDate}</div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(user.roleMetaData?.passportUrl)}
                                            type="button"
                                            className="p-1.5 text-brand-blue hover:text-gray-700 hover:bg-accent rounded-md border border-stroke-light ml-auto">
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
