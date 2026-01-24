import { CheckCircleIcon, CreditCardIcon } from "@/components/Icons";

export type paymentOption = {
    currency: string;
    price: string;
    remainingVehiclePayment: string | null;
    text: string | null;
    dynamictext: string | null;
    type: "token" | "full";
};

type PropsT = {
    data: {
        tokenPayment: paymentOption;
        fullPayment: paymentOption;
    };
    selectedPayment: string;
    handlePaymentChange: (paymentOption: string) => void;
};

const staticData = {
    tokenPayment: {
        currency: "AED",
        price: "158,000",
        text: "Pay AED 5,000 token to reserve the vehicle",
        list: [
            "Reserve vehicle for 7 days",
            "Complete payment before delivery",
            "Refundable if inspection fails",
        ],
    },
};

export default function PaymentOptions({
    data,
    selectedPayment,
    handlePaymentChange,
}: Readonly<PropsT>) {
    return (
        <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
            <fieldset className="space-y-4">
                <legend>
                    <h4 className="leading-none text-brand-blue flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5" />
                        Payment Option
                    </h4>
                </legend>
                <div className="space-y-2">
                    <PaymentOptionCard
                        title="Token Payment"
                        handlePaymentChange={() => handlePaymentChange("token")}
                        paymentData={data.tokenPayment}
                        checked={selectedPayment === "token"}
                    />
                    <PaymentOptionCard
                        title="Full Payment"
                        handlePaymentChange={() => handlePaymentChange("full")}
                        paymentData={data.fullPayment}
                        checked={selectedPayment === "full"}
                    />
                </div>
            </fieldset>
        </div>
    );
}

const PaymentOptionCard = ({
    title,
    paymentData,
    checked,
    handlePaymentChange,
}: Readonly<{
    title: string;
    paymentData: paymentOption;
    checked: boolean;
    handlePaymentChange: () => void;
}>) => {
    return (
        <label className="grid grid-cols-1 md:grid-cols-[1fr_5fr_6fr_6fr] items-center gap-4 p-4 border border-stroke-light rounded-lg text-xs hover:bg-gray-50 transition-colors">
            <input
                type="radio"
                name="payment"
                className="accent-brand-blue h-4 w-4"
                checked={checked}
                onChange={() => handlePaymentChange()}
            />
            <div className="flex items-center gap-2">
                <h5 className="text-brand-blue">{title}</h5>
                <span className="text-brand-blue">
                    {paymentData.currency} {paymentData.price}
                </span>
            </div>
            <p className="text-sm text-gray-600">{paymentData.text}</p>
            <ul className="text-xs text-gray-500 space-y-1">
                {staticData.tokenPayment.list.map((item) => (
                    <li key={item} className="flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                        {item}
                    </li>
                ))}
            </ul>
        </label>
    );
};
