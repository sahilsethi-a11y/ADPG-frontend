"use server";
import { cookies } from "next/headers";

export const getCurrency = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("currencyCookie")?.value ?? "USD";
};
