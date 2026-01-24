import Image from "@/elements/Image";
import Link from "next/link";
import SelectCurrency from "@/components/header/SelectCurrency";
import UserProfileButton from "@/components/header/UserProfileButton";
import Sidebar from "@/components/header/Sidebar";
import { api } from "@/lib/api/server-request";
import DesktopNav from "@/components/header/DesktopNav";
import { SearchIcon } from "@/components/Icons";
import CartButton from "@/components/header/CartButton";
import QuoteBuilderButton from "@/components/header/QuoteBuilderButton";
import { getFilters } from "@/lib/data";
import { getCurrency } from "@/lib/serverActions";

export type User = {
    name: string;
    username: string;
    email: string;
    roleType: string;
    userId: string;
    otpVerified: boolean;
};

export default async function Header() {
    const selectedCurrency = await getCurrency();

    const userPromise = api.get<{ data: User }>("/api/v1/auth/getUserInfoByToken", { isAuthRequired: false });
    const cartPromise = api.get<{ data: { cartCount: number } }>("/inventory/api/v1/inventory/getCartCountForUser", { isAuthRequired: false });
    const filterPromise = getFilters();

    const [userData, cartResp, filters] = await Promise.all([userPromise, cartPromise, filterPromise]);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-stroke-light shadow-sm">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between py-2.5 gap-2">
                    <Link title="AD Ports Group" href="/" className="h-6 md:h-7">
                        <Image className="h-full w-auto hidden md:block" alt="AD Ports Group" width={294} height={51} src="/assets/logo.png" preload />
                        <Image className="h-full w-auto md:hidden" alt="AD Ports Group" width={51} height={51} src="/assets/adp-logo.png" preload />
                    </Link>
                    <DesktopNav isLoggedIn={userData.data?.userId} />
                    <div className="flex gap-2 md:gap-4 items-center">
                        <SelectCurrency filters={filters?.data} selectedCurrency={selectedCurrency} />
                        <Link className="p-2 hover:bg-gray-100 block rounded-md" href="/vehicles" title="Search vehicles">
                            <SearchIcon className="h-4 w-4" />
                        </Link>
                        {userData.data?.roleType?.toLocaleLowerCase() === "buyer" && (
                            <>
                                <QuoteBuilderButton />
                                <CartButton initialCount={cartResp?.data?.cartCount ?? 0} />
                            </>
                        )}{" "}
                        <UserProfileButton user={userData.data} />
                        <div className="md:hidden">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
