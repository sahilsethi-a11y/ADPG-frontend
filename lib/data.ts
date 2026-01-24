import { cache } from "react";
import { api } from "@/lib/api/client-request";

export type Brand = {
    displayName: string;
    id: string;
    name: string;
};

export type Model = {
    displayName: string;
    id: string;
    modelId: string;
    modelName: string;
};

export type Variant = {
    id: string;
    variantName: string;
    oemId: string;
    modelId: string;
};

export const getFilters = async () => {
    return api.get<{ data: Record<string, unknown> }>("/masters/api/filters/map", { cacheRevalidate: 300 }); // 300 seconds or 5 min cache
};

export const getBrands = cache(async () => {
    return api.get<{ data: Brand[] }>("/masters/api/v1/mtoc/brands");
});

export const getModals = cache(async (brand: string) => {
    return await api.get<{ data: Model[] }>("/masters/api/v1/mtoc/brands/models", { params: { ref: brand } });
});

export const getVariants = cache(async (model: string) => {
    return await api.get<{ data: Variant[] }>("/masters/api/v1/mtoc/models/variants", { params: { ref: model } });
});

export const getCountryDetails = cache(async (countryCode: string) => {
    return api.get<{ data: { id: string }[] }>("/masters/api/v1/locations/roots/" + countryCode);
});

export const getCities = cache(async (countryCode: string) => {
    const res = await getCountryDetails(countryCode);
    const countryId = res.data?.[0]?.id;
    return api.get<{ data: { id: string; name: string }[] }>(`/masters/api/v1/locations/${countryId}/children`);
});

export const uploadFile = async <T>(file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    return api.post<T>("/users/api/v1/users/upload", { body: formData });
};
