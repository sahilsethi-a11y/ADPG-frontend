import { EnternalLinkIcon, StarIcon } from "@/components/Icons";
import Tabbin from "@/components/Tabbin";
import Image from "@/elements/Image";
import Link from "next/link";

type PartnerData = {
    title: string;
    subtitle: string;
    items: {
        isFeatured?: boolean;
        image: string;
        title: string;
        description: string;
        link: string;
    }[];
};

export default async function PartnerNetwork() {
    const data = {
        title: "Partner Networks",
        description:
            "We collaborate with leading service providers to deliver exceptional automotive solutions. Our strategic partnerships ensure quality, reliability, and comprehensive service coverage.",
        inspection: {
            title: "Inspection Partners",
            subtitle: "Certified vehicle inspection service providers",
            items: [
                {
                    isFeatured: true,
                    image: "/assets/elite.jpeg",
                    title: "Elite Auto Inspection",
                    description: "Leading automotive inspection services with 15+ years of experience in the UAE market.",
                    link: "https://www.google.com/search?q=Elite Auto Inspection",
                },
                {
                    image: "/assets/vehicle-assessment.jpeg",
                    title: "Premium Vehicle Assessment",
                    description: "Comprehensive vehicle assessment and certification services across Middle East.",
                    link: "https://www.google.com/search",
                },
                {
                    image: "/assets/gulf-inspection.jpeg",
                    title: "Gulf Inspection Services",
                    description: "Specialized in luxury and commercial vehicle inspections with certified technicians.",
                    link: "https://www.google.com",
                },
            ],
        },
        logistics: {
            title: "Logistics Partners",
            subtitle: "Trusted shipping and transportation providers Featured",
            items: [
                {
                    isFeatured: true,
                    image: "/assets/global-auto-transport.jpeg",
                    title: "Global Auto Transport",
                    description: "Worldwide vehicle shipping with insurance coverage and real-time tracking.",
                    link: "https://www.google.com",
                },
                {
                    image: "/assets/emirates-logistics-hub.jpeg",
                    title: "Emirates Logistics Hub",
                    description: "Regional logistics expert specializing in automotive transportation.",
                    link: "https://www.google.com",
                },
            ],
        },
        financing: {
            title: "Financing Partners",
            subtitle: "Financial institutions and payment solutions",
            items: [
                {
                    isFeatured: true,
                    image: "/assets/uae-national-bank.jpeg",
                    title: "UAE National Bank",
                    description: "Leading bank offering competitive auto financing solutions and payment processing.",
                    link: "https://www.google.com",
                },
                {
                    image: "/assets/gulf-finance-corporation.jpeg",
                    title: "Gulf Finance Corporation",
                    description: "Specialized automotive financing with flexible payment terms.",
                    link: "https://www.google.com",
                },
            ],
        },
        technology: {
            title: "Technology Partners",
            subtitle: "Technology and data integration partners",
            items: [
                {
                    image: "/assets/car-tech-systems.jpeg",
                    title: "AutoData Solutions",
                    description: "Vehicle data and market analytics platform providing real-time insights.",
                    link: "https://www.google.com",
                },
                {
                    image: "/assets/car-tech-systems.jpeg",
                    title: "CarTech Systems",
                    description: "Advanced automotive technology solutions and integration services.",
                    link: "https://www.google.com",
                },
            ],
        },
        benifits: {
            title: "Why Partner With Us",
            description: "Join our ecosystem of trusted service providers and grow your business",
            items: [
                {
                    title: "Access to Network",
                    description: "Connect with thousands of buyers, sellers, and dealers across our platform",
                    icon: "/assets/users.svg",
                },
                {
                    title: "Business Growth",
                    description: "Expand your reach and grow your business with our marketing support",
                    icon: "/assets/trend-up.svg",
                },
                {
                    title: "Quality Assurance",
                    description: "Maintain high service standards with our quality assurance programs",
                    icon: "/assets/shield.svg",
                },
            ],
        },
    };

    const tabs = [
        {
            label: "Inspection Partners",
            panel: <TabPanel data={data.inspection} />,
        },
        {
            label: "Logistics Partners",
            panel: <TabPanel data={data.logistics} />,
        },
        {
            label: "Financing Partners",
            panel: <TabPanel data={data.financing} />,
        },
        {
            label: "Technology Partners",
            panel: <TabPanel data={data.technology} />,
        },
    ];

    const benifits = data.benifits;

    return (
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl mb-4 text-brand-blue">{data.title}</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">{data.description}</p>
            </div>
            <Tabbin items={tabs} />
            <section className="mt-16 py-12 bg-gray-50 rounded-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl mb-4">{benifits.title}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">{benifits.description}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {benifits.items.map((item) => (
                        <div key={item.title} className="text-center space-y-4">
                            <div className="w-16 h-16 bg-stroke-light rounded-full flex items-center justify-center mx-auto">
                                <Image alt={item.title} src={item.icon} height={28} width={28} />
                            </div>
                            <h4>{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

const TabPanel = ({ data }: { data: PartnerData }) => {
    return (
        <div>
            <div className="my-6">
                <h2 className="text-2xl mb-2">{data.title}</h2>
                <p className="text-gray-600">{data.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items?.map((item) => (
                    <div key={item.title} className={`p-6 relative border rounded-xl ${item.isFeatured ? "border-2" : "border-stroke-light"}`}>
                        {item.isFeatured && (
                            <span className="inline-flex items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium absolute -top-3 left-4 bg-primary text-white bg-black">
                                <StarIcon className="h-2.5 w-2.5" />
                                Featured
                            </span>
                        )}
                        <Image src={item.image} alt={item.title} height={100} width={200} className="h-12 w-auto mb-4" />
                        <h3 className="mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        <Link
                            href={item.link}
                            target="_blank"
                            className="flex items-center justify-center text-sm font-medium border bg-background text-foreground hover:bg-accent hover:text-accent-foreground py-1 rounded-md gap-1.5 px-3 border-stroke-light">
                            <EnternalLinkIcon className="h-3.5 w-3.5" />
                            Visit Website
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
