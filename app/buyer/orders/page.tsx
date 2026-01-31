import NegotiationOrdersSection from "@/components/buyer/NegotiationOrdersSection";

export default function Orders() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl text-[#202C4A]">Order Management</h2>
                    <p className="text-gray-600">Track and manage your vehicle orders</p>
                </div>
            </div>
            <NegotiationOrdersSection role="buyer" />
        </div>
    );
}
