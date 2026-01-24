import BankDetailsForm from "@/components/bank-details/BankDetailsForm";
import { ArrowLeftIcon, Shield } from "@/components/Icons";
import Link from "next/link";

export default function page() {
    return (
        <main>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4 gap-3.5">
                        <Link
                            title="Back to Login"
                            href="/seller/dashboard"
                            className="border border-none rounded-lg hover:bg-accent hover:text-brand-blue flex items-center justify-center gap-2 text-sm h-9 px-4 py-2 text-gray-600">
                            <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Dashboard
                        </Link>
                        <div>
                            <h1 className="text-3xl text-brand-blue">Bank Account Details</h1>
                            <p className="text-gray-600">Update your banking information for payments and withdrawals</p>
                        </div>
                    </div>
                    <span className="bg-green-100 text-green-800 flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 border-transparent">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Session
                    </span>
                </div>
                <div className="text-foreground flex flex-col gap-6 rounded-xl border mb-8 border-blue-200 bg-blue-50">
                    <div className="p-6">
                        <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="text-blue-900 mb-2">Security & Privacy</h3>
                                <p className="text-blue-800 text-sm">
                                    Your banking information is encrypted and stored securely. We use industry-standard security measures to protect your financial data. This information will only be used for processing payments and withdrawals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <BankDetailsForm />
            </div>
        </main>
    )
}
