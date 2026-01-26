import LoginForm from "@/components/login/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Automarketplace - Login to see your vehicles",
    description: "Automarketplace - Your premier destination for buying and selling vehicles.",
};

export default async function Login({ searchParams }: Readonly<{ searchParams: Promise<{ redirectUrl?: string }> }>) {
    const { redirectUrl } = await searchParams;

    return (
        <main>
            <LoginForm redirectUrl={redirectUrl} />
        </main>
    );
}
