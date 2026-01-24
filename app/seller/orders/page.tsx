export default function Orders() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl text-[#202C4A]">Order Management</h2>
                    <p className="text-gray-600">Track and manage your vehicle orders</p>
                    <p className="text-sm text-gray-500 mt-1">0 of 0 orders</p>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        data-slot="badge"
                        className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&amp;]:hover:bg-primary/90 bg-blue-100 text-blue-800">
                        0 Total Orders
                    </span>
                </div>
            </div>
        </div>
    );
}
