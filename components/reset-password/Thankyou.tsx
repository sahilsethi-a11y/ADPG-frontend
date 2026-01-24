import { CheckCircleIcon } from "@/components/Icons";
import Link from "next/link";
const data = {
    title: "Password Reset Successfully",
    description: "Your password has been updated successfully. You can now sign in with your new password.",
};

export default function Thankyou() {
    return (
        <div className="px-4 py-8 bg-gray-50">
            <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-black/10">
                <div className="space-y-6 text-center">
                    <div>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500">
                            <CheckCircleIcon className="text-white h-7 w-7" />
                        </div>
                        <h1 className="text-2xl text-brand-blue">{data.title}</h1>
                        <p className="text-muted-foreground mt-2">{data.description}</p>
                    </div>
                    <Link
                        href="/login"
                        title="Sign in now"
                        className="w-full bg-brand-blue text-white py-3 rounded-lg text-xs shadow-sm hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2">
                        Sign In Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
