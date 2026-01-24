export default function Inventory() {
    return (
        <div>
            <div className="mt-6">
                <div className="mb-4">
                    <h2 className="text-[16px] font-medium text-[#24272c] leading-[22px] mb-1">All Vehicles</h2>
                    <p className="text-[13px] text-[#6c757d]">0 of 0 vehicles</p>
                </div>
                <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
                    <div data-slot="table-container" className="relative w-full overflow-x-auto">
                        <table data-slot="table" className="w-full caption-bottom text-sm">
                            <thead data-slot="table-header" className="[&amp;_tr]:border-b">
                                <tr data-slot="table-row" className="hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors bg-[#f8f9fa] border-b border-[rgba(0,0,0,0.1)] h-[48px]">
                                    <th
                                        data-slot="table-head"
                                        className="h-10 text-left align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px]">
                                        VIN
                                    </th>
                                    <th
                                        data-slot="table-head"
                                        className="h-10 text-left align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px]">
                                        Vehicle Details
                                    </th>
                                    <th
                                        data-slot="table-head"
                                        className="h-10 text-left align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px]">
                                        Year
                                    </th>
                                    <th
                                        data-slot="table-head"
                                        className="h-10 text-left align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px]">
                                        Price (AED)
                                    </th>
                                    <th
                                        data-slot="table-head"
                                        className="h-10 text-left align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px]">
                                        Regional Specs
                                    </th>
                                    <th
                                        data-slot="table-head"
                                        className="h-10 text-left align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px]">
                                        Inventory Status
                                    </th>
                                    <th
                                        data-slot="table-head"
                                        className="h-10 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px] text-center">
                                        Negotiable
                                    </th>
                                    <th
                                        data-slot="table-head"
                                        className="h-10 text-left align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] font-medium text-[#495057] px-[16px] py-[12px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody data-slot="table-body" className="[&amp;_tr:last-child]:border-0">
                                <tr data-slot="table-row" className="data-[state=selected]:bg-muted transition-colors border-b border-[rgba(0,0,0,0.1)] h-[56px] hover:bg-[#f8f9fa]">
                                    <td
                                        colSpan={8}
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] text-[#24272c] px-[16px] py-[16px] font-medium">
                                        Data Not Available
                                    </td>
                                    {/* <td
                                        data-slot="table-cell"
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] text-[#24272c] px-[16px] py-[16px]">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Toyota Camry</span>
                                            <span className="text-[12px] text-[#6c757d]">SE</span>
                                        </div>
                                    </td>
                                    <td
                                        data-slot="table-cell"
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] text-[#24272c] px-[16px] py-[16px]">
                                        2022
                                    </td>
                                    <td
                                        data-slot="table-cell"
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] text-[#24272c] px-[16px] py-[16px] font-medium">
                                        85,000
                                    </td>
                                    <td
                                        data-slot="table-cell"
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] text-[13px] text-[#24272c] px-[16px] py-[16px]">
                                        <span
                                            data-slot="badge"
                                            className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&amp;]:hover:bg-accent [a&amp;]:hover:text-accent-foreground text-xs">
                                            GCC
                                        </span>
                                    </td>
                                    <td
                                        data-slot="table-cell"
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] px-[16px] py-[16px]">
                                        <span className="bg-[#e7f7e7] text-[#2d5a2d] px-[6px] py-[3px] rounded-[4px] text-[11px] font-medium border-none">Live</span>
                                    </td>
                                    <td
                                        data-slot="table-cell"
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] px-[16px] py-[16px]">
                                        <div className="flex items-center justify-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-circle-check-big h-5 w-5 text-green-600"
                                                aria-hidden="true">
                                                <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                                                <path d="m9 11 3 3L22 4"></path>
                                            </svg>
                                        </div>
                                    </td>
                                    <td
                                        data-slot="table-cell"
                                        className="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px] px-[16px] py-[16px]">
                                        <button
                                            data-slot="dropdown-menu-trigger"
                                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([className*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 rounded-md gap-1.5 has-[&gt;svg]:px-2.5 h-[24px] w-[24px] p-0 text-[#6c757d] hover:text-[#202c4a] hover:bg-transparent"
                                            type="button"
                                            id="radix-:r5u:"
                                            aria-haspopup="menu"
                                            aria-expanded="false"
                                            data-state="closed">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-ellipsis-vertical h-[16px] w-[16px]"
                                                aria-hidden="true">
                                                <circle cx="12" cy="12" r="1"></circle>
                                                <circle cx="12" cy="5" r="1"></circle>
                                                <circle cx="12" cy="19" r="1"></circle>
                                            </svg>
                                        </button>
                                    </td> */}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
