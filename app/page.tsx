import Features from "@/components/Features";
import FilterBar from "@/components/FilterBar";
import Services from "@/components/Services";
import TopBanner from "@/components/TopBanner";
import SignupCard from "@/components/SignupCard";
import Statistics from "@/components/Statistics";
import VehiclesPrefetchOnMount from "@/components/VehiclesPrefetchOnMount";
import { getBrands, getFilters } from "@/lib/data";
import { Suspense } from "react";

const data = {
    metadata: {
        title: "ADPG Auto",
        description: "",
        schema: {
            "@context": "https://schema.org",
            "@type": "Organization",
        },
    },
    topBanner: {
        title: "Premium Automotive Marketplace",
        description: "Discover used vehicles from trusted dealers worldwide with comprehensive inspection and delivery services",
        image: "/assets/home-banner.avif",
    },
    features: {
        title: "Why Choose AD Ports Group",
        description:
            "Experience unparalleled value through our comprehensive automotive ecosystem, delivering trusted solutions, quality assurance, and global connectivity for all your vehicle trading needs.",
        list: [
            {
                icon: "/assets/shield.svg",
                title: "Verified Network",
                description: "All dealers and vehicles undergo rigorous verification for your peace of mind.",
            },
            {
                icon: "/assets/quality-assurance.svg",
                title: "Quality Assurance",
                description: "Professional inspection and certification ensuring highest quality standards.",
            },
            {
                icon: "/assets/globe.svg",
                title: "Global Reach",
                description: "Seamless international shipping to multiple countries with full logistics support.",
            },
            {
                icon: "/assets/support.svg",
                title: "Expert Support",
                description: "Dedicated customer support team available 24/7 for all your inquiries.",
            },
        ],
    },
    services: {
        title: "Our Services",
        description:
            "Comprehensive automotive solutions designed to provide seamless vehicle trading experience with trusted verification, professional inspection, and reliable logistics support worldwide.",
        image: "/assets/service.jpeg",
        list: [
            {
                icon: "/assets/marketplace.svg",
                title: "Marketplace",
                description: "Browse thousands of verified vehicles from trusted dealers worldwide with transparent pricing and detailed specifications.",
                link: "/vehicles",
            },
            {
                icon: "/assets/shield.svg",
                title: "Vehicle Inspection",
                description: "Professional vehicle inspection services ensuring quality and authenticity with comprehensive reports from certified experts.",
                link: "/about",
            },
            {
                icon: "/assets/delivery.svg",
                title: "Logistics & Delivery",
                description: "Pick up your car at the designated location and enjoy your premium driving experience with our top-quality service.",
                link: "/about",
            },
        ],
    },
    statistics: {
        title: "Platform Statistics",
        description: "Real-ti  me metrics showcasing our growing marketplace and the trust placed in our platform by dealers and customers worldwide.",
        image: "/assets/statistics.jpeg",
        list: [
            {
                icon: "/assets/car.svg",
                title: "12,450+",
                subtitle: "Active Listings",
                description: "Verified vehicles currently available",
            },
            {
                icon: "/assets/users.svg",
                title: "850+",
                subtitle: "Verified Dealers",
                description: "Trusted dealer partners",
            },
            {
                icon: "/assets/check-circle.svg",
                title: "5,200+",
                subtitle: "Completed Sales",
                description: "Successfully completed transactions",
            },
            {
                icon: "/assets/globe.svg",
                title: "45+",
                subtitle: "Countries Served",
                description: "Destination countries supported",
            },
        ],
    },
    signup: {
        title: "Ready to Join Our Marketplace?",
        description: "Whether you're looking to buy, sell, or partner with us as a dealer, ADPG Auto provides the perfect platform for all your automotive needs.",
        image: "/assets/signup.webp",
        link: "/signup",
        linkText: "Get Started Now",
    },
};

export default function Home() {
    const brandRes = getBrands();
    const filterRes = getFilters();

    return (
        <main className="bg-white relative size-full">
            <VehiclesPrefetchOnMount />
            <TopBanner title={data.topBanner.title} description={data.topBanner.description} image={data.topBanner.image} />
            <section className="relative -mt-[calc(15rem+12vh)] lg:-mt-[calc(16rem+14vh)] lg:px-4 mb-40">
                <div className="container mx-auto max-w-6xl px-4">
                    <Suspense>
                        <FilterBar
                            brandRes={brandRes}
                            filterRes={filterRes}
                            title="Find Your Perfect Vehicle"
                            subTitle="Search through thousands of verified vehicles from trusted dealers"
                            parentCls="shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
                            selectCls="border border-stroke-light"
                        />
                    </Suspense>
                </div>
            </section>
            <Services data={data.services} />
            <Features data={data.features} />
            <Statistics data={data.statistics} />
            <SignupCard data={data.signup} />
        </main>
    );
}

const FilterShimmer = () => (
    <div className="border border-stroke-light rounded-md p-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6 gap-4 mb-6">
            <div className="h-10 w-full lg:w-40 bg-gray-200 rounded-md" />
            <div className="h-10 w-full lg:w-40 bg-gray-200 rounded-md" />
            <div className="h-10 w-full lg:w-40 bg-gray-200 rounded-md" />
            <div className="h-10 w-full lg:w-40 bg-gray-200 rounded-md" />
            <div className="h-10 w-32 bg-gray-200 rounded-md" />
            <div className="h-10 w-32 bg-gray-200 rounded-md" />
        </div>
        <div className="flex justify-between items-center gap-4">
            <div className="flex justify-center items-center gap-2 lg:gap-4">
                <div className="h-10 w-full lg:w-40 bg-gray-200 rounded-md" />
                <div className="h-10 w-full lg:w-40 bg-gray-200 rounded-md" />
            </div>
            <div className="h-10 w-40 bg-gray-200 rounded-md" />
        </div>
    </div>
);
