import type { RequestOptions } from "@/lib/api/shared";
import { mockStore } from "@/lib/mock/store";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const withData = <T>(data: T) => ({ data });
const ok = (extra?: Record<string, unknown>) => ({ status: "OK", ...(extra ?? {}) });

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const startsWithPath = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + "?") || path.startsWith(prefix + "/");

const applyParams = (value: unknown, params?: Record<string, unknown>) => {
    if (!params) return value;
    return value;
};

const getParamString = (params: RequestOptions["params"], key: string) => {
    const value = params?.[key];
    return typeof value === "string" ? value : "";
};

const toListingByUser = (userId: string) => {
    const listing = mockStore.clone(mockStore.data.inventory.listing);
    const content = Array.isArray(listing?.content) ? listing.content : [];
    if (!userId) return listing;
    const scoped = content.filter((row: unknown) => {
        const typed = row as { user?: { userId?: string }; inventory?: { userId?: string } };
        const rowUserId = typed.user?.userId ?? typed.inventory?.userId;
        return rowUserId === userId;
    });
    return {
        ...listing,
        content: scoped,
        totalItems: scoped.length,
        totalElements: scoped.length,
        totalPages: 1,
        currentPage: 1,
        first: true,
        last: true,
    };
};

const toSellerInfoByUser = (userId: string) => {
    const fallback = mockStore.clone(mockStore.data.inventory.sellerInfo);
    if (!userId) return fallback;

    const listing = toListingByUser(userId);
    const first = Array.isArray(listing?.content) ? listing.content[0] : undefined;
    if (!first) return fallback;

    const sellerName =
        first?.user?.roleMetaData?.companyName ??
        first?.user?.roleMetaData?.dealershipName ??
        first?.user?.organisationName ??
        first?.user?.name ??
        fallback?.about?.businessCompanyName;

    return {
        ...fallback,
        userInformation: {
            ...fallback.userInformation,
            totalInventory: String(Array.isArray(listing.content) ? listing.content.length : 0),
            locationAttribute: {
                ...fallback.userInformation.locationAttribute,
                countryCode: first?.user?.locationAttribute?.countryCode ?? fallback.userInformation.locationAttribute.countryCode,
                country: first?.inventory?.country ?? first?.user?.locationAttribute?.country ?? fallback.userInformation.locationAttribute.country,
                city: first?.inventory?.city ?? first?.user?.locationAttribute?.city ?? fallback.userInformation.locationAttribute.city,
                district: first?.user?.locationAttribute?.district ?? fallback.userInformation.locationAttribute.district,
            },
            organizationName: sellerName,
        },
        about: {
            ...fallback.about,
            businessCompanyName: sellerName,
        },
    };
};

export function mockApiRequest<T = unknown>(pathInput: string, options: RequestOptions = {}): T {
    const method = (options.method || "GET").toUpperCase() as Method;
    const path = normalizePath(pathInput);

    if (method === "GET") {
        if (startsWithPath(path, "/api/v1/auth/getUserInfoByToken")) return withData(mockStore.clone(mockStore.data.auth.user)) as T;
        if (startsWithPath(path, "/api/v1/auth/setCurrency")) return ok() as T;

        if (startsWithPath(path, "/masters/api/filters/map")) return withData(mockStore.clone(mockStore.data.masters.filters)) as T;
        if (startsWithPath(path, "/masters/api/v1/mtoc/brands/models")) return withData(mockStore.clone(mockStore.data.masters.models)) as T;
        if (startsWithPath(path, "/masters/api/v1/mtoc/models/variants")) return withData(mockStore.clone(mockStore.data.masters.variants)) as T;
        if (startsWithPath(path, "/masters/api/v1/mtoc/brands")) return withData(mockStore.clone(mockStore.data.masters.brands)) as T;
        if (startsWithPath(path, "/masters/api/v1/locations/roots/")) return withData(mockStore.clone(mockStore.data.masters.locations.roots)) as T;
        if (path.startsWith("/masters/api/v1/locations/") && path.includes("/children")) return withData(mockStore.clone(mockStore.data.masters.locations.children)) as T;

        if (startsWithPath(path, "/inventory/api/v1/inventory/getCartCountForUser")) {
            return withData({ cartCount: mockStore.state.inventoryCart.length }) as T;
        }
        if (startsWithPath(path, "/inventory/api/v1/inventory/search")) {
            return withData(mockStore.clone(mockStore.data.inventory.listing)) as T;
        }
        if (startsWithPath(path, "/inventory/api/v1/inventory/getInventoryDetails")) return withData(mockStore.clone(mockStore.data.inventory.details)) as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/inventoryListForUser")) {
            const userId = getParamString(options.params, "userId");
            return withData(toListingByUser(userId)) as T;
        }
        if (startsWithPath(path, "/inventory/api/v1/inventory/getAllInventoryListForUser")) {
            const userId = getParamString(options.params, "userId");
            return withData(toListingByUser(userId)) as T;
        }
        if (startsWithPath(path, "/inventory/api/v1/inventory/adminList")) return withData(mockStore.clone(mockStore.data.inventory.listing)) as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/getInventorySellerDealerInfo")) {
            const userId = getParamString(options.params, "userId");
            return withData(toSellerInfoByUser(userId)) as T;
        }
        if (startsWithPath(path, "/inventory/api/v1/inventory/getFavouriteListForUser")) return withData(mockStore.clone(mockStore.data.inventory.favourites)) as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/getUserCart")) return withData(mockStore.clone(mockStore.state.inventoryCart)) as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/getInventoryById")) return withData(mockStore.clone(mockStore.data.inventory.details)) as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/profile-analytics")) return withData(mockStore.clone(mockStore.data.inventory.profileAnalytics)) as T;

        if (startsWithPath(path, "/users/api/v1/users/buyer-profile")) return withData(mockStore.clone(mockStore.data.users.buyerProfile)) as T;
        if (startsWithPath(path, "/users/api/v1/users/profile-settings")) return withData(mockStore.clone(mockStore.data.users.profileSettings)) as T;
        if (startsWithPath(path, "/users/api/v1/users/bank-details")) return withData(mockStore.clone(mockStore.data.users.bankDetails)) as T;
        if (startsWithPath(path, "/users/api/v1/users/list")) return withData(mockStore.clone(mockStore.data.users.list)) as T;

        if (startsWithPath(path, "/analytics/api/v1/analytics/dashboard-analytics")) return withData(mockStore.clone(mockStore.data.analytics.dashboard)) as T;

        if (startsWithPath(path, "/chat/api/negotiations")) return withData(mockStore.clone(mockStore.data.chat.negotiations)) as T;
        if (startsWithPath(path, "/chat/api/conversations/messages/")) return withData(mockStore.clone(mockStore.data.chat.conversation)) as T;
    }

    if (method === "POST") {
        if (startsWithPath(path, "/api/v1/auth/login")) return withData(mockStore.clone({ user: mockStore.data.auth.user })) as T;
        if (startsWithPath(path, "/api/v1/auth/logout")) return ok({ message: "Logged out" }) as T;

        if (startsWithPath(path, "/users/api/v1/users/send-otp")) return ok() as T;
        if (startsWithPath(path, "/users/api/v1/users/verify-otp")) return withData({ verified: true }) as T;
        if (startsWithPath(path, "/users/api/v1/users/forgot/reset-password")) return ok() as T;
        if (startsWithPath(path, "/users/api/v1/users/v2/create")) return ok() as T;
        if (startsWithPath(path, "/users/api/v1/users/create")) return withData({}) as T;
        if (startsWithPath(path, "/users/api/v1/users/upload")) return withData({ fileLocation: "/assets/home-banner.avif" }) as T;
        if (startsWithPath(path, "/users/api/v1/users/bank-details")) return ok() as T;

        if (startsWithPath(path, "/inventory/api/v1/inventory/create-inventory")) return ok() as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/upload-vehicle")) return { message: "Uploaded" } as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/addCart")) return ok() as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/suspend-vehicle")) return ok() as T;
        if (startsWithPath(path, "/inventory/api/v1/inventory/unsuspend-vehicle")) return ok() as T;

        if (startsWithPath(path, "/chat/api/conversations/send-negotiation-otp")) return ok() as T;
        if (startsWithPath(path, "/chat/api/conversations/verify-negotiation-otp")) {
            return withData(mockStore.clone(mockStore.data.chat.conversation.negotiationInfo)) as T;
        }

        return ok() as T;
    }

    if (method === "PUT" || method === "PATCH") {
        if (startsWithPath(path, "/users/api/v1/users/profile-settings")) {
            return ok({ message: "Profile updated" }) as T;
        }
        return ok() as T;
    }

    if (method === "DELETE") {
        if (startsWithPath(path, "/inventory/api/v1/inventory/removeCart")) {
            const cartId = String(options.params?.cartId || "");
            if (cartId) {
                mockStore.state.inventoryCart = mockStore.state.inventoryCart.filter((item) => {
                    const value = item.cartId;
                    return (typeof value === "string" ? value : "") !== cartId;
                });
            }
            return ok() as T;
        }
        return ok() as T;
    }

    return applyParams(ok(), options.params) as T;
}
