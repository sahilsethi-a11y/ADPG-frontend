import TopBanner from "@/components/TopBanner";
import GetStartVisit from "@/components/GetStartVisit";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";
import Image from "@/elements/Image";

const data = {
    topBanner: {
        title: "Join the Marketplace",
        description: "Join ADPG Auto Marketplace as a buyer from UAE or seller from China. Access thousands of verified vehicles and trusted partners.",
        image: "/assets/get-started-banner.webp",
        link: "#signup",
    },
    buyers: {
        title: "Trusted by Thousands of Buyers",
        subTitle: "Join a thriving community of car buyers who trust ADPG Auto for their vehicle purchases",
        List: [
            {
                icon: "/assets/users.svg",
                title: "0",
                subTitle: "Active Buyers",
            },
            {
                icon: "/assets/car.svg",
                title: "1",
                subTitle: "Vehicles Available",
            },
            {
                icon: "/assets/star.svg",
                title: "2",
                subTitle: "Buyer Satisfaction",
            },
            {
                icon: "/assets/trend-up.svg",
                title: "3",
                subTitle: "Platform Transaction Value",
            },
        ],
    },
    whyus: {
        title: "Why Buy with ADPG Auto?",
        subTitle: "Experience the most secure and comprehensive car buying platform in the UAE",
        List: [
            {
                icon: "/assets/dollar.svg",
                title: "Best Market Prices",
                subTitle: "Get the best value when buying vehicles with transparent pricing and no hidden fees from verified dealers.",
            },
            {
                icon: "/assets/shield.svg",
                title: "Verified Dealers Only",
                subTitle: "All dealers and vehicles on our platform are thoroughly verified, ensuring secure transactions and quality vehicles",
            },
            {
                icon: "/assets/clock.svg",
                title: "Quick Purchase Process",
                subTitle: "Complete your vehicle purchase in 7-14 days with our streamlined process and extensive dealer network.",
            },
            {
                icon: "/assets/star.svg",
                title: "Buyer Protection",
                subTitle: "Comprehensive buyer protection with professional inspections, secure payments, and dedicated customer support.",
            },
        ],
    },
    process: {
        title: "How It Works",
        subTitle: "Our streamlined process makes becoming a verified buyer simple and secure",
        List: [
            {
                icon: "/assets/user-check.svg",
                title: "Create Account",
                subTitle: "Fill out the buyer registration form with your personal details.",
            },
            {
                icon: "/assets/document.svg",
                title: "Upload Documents",
                subTitle: "Upload required documents for identity verification.",
            },
            {
                icon: "/assets/check-circle.svg",
                title: "Verification Process",
                subTitle: "Our team reviews your application and documents for approval.",
            },
            {
                icon: "/assets/target.svg",
                title: "Start Shopping",
                subTitle: "Once approved, browse and purchase vehicles from verified dealers.",
            },
        ],
    },
    signup: {
        title: "Choose Your Account Type",
        subTitle: "Select whether you want to join as a buyer from UAE or seller from China to get started with the right registration process",
        List: [
            {
                icon: "/assets/users.svg",
                title: "Buyer",
                subTitle: "UAE based individuals",
                link: "/signup/buyer",
            },
            {
                icon: "/assets/briefcase.svg",
                title: "Seller",
                subTitle: "Seller based out of china",
                link: "/signup/seller",
            },
        ],
    },
};

export default function page() {
    return (
        <main>
            <div className="min-h-screen">
                <TopBanner verticalCenter={true} title={data.topBanner.title} description={data.topBanner.description} image={data.topBanner.image}>
                    <div className="flex justify-center lg:mt-8">
                        <Link
                            href={data.topBanner.link}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-white text-brand-blue py-3 text-xs font-medium px-6 rounded-md hover:bg-gray-100">
                            Get Started Today
                            <ArrowRightIcon className="h-3.5 w-3.5 mr-1 lg:mr-2" />
                        </Link>
                    </div>
                </TopBanner>
            </div>
            <GetStartVisit
                data={data.buyers}
                cardCls="rounded-xl text-center shadow-lg hover:shadow-xl transition-shadow border border-black/10"
                grid="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                cardTitleCls="text-2xl font-bold mb-1"
            />
            <GetStartVisit
                data={data.whyus}
                parentBg="bg-gray-50"
                grid="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                cardCls="rounded-xl border border-black/10 text-center hover:shadow-lg transition-shadow"
                cardTitleCls="mb-3"
            />
            <GetStartVisit
                data={data.process}
                cardCls="text-center"
                grid="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                cardTitleCls="mb-3 text-lg"
                imgBgCls="bg-brand-blue w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                imgCls="invert"
            />
            <section id="signup" className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <div className="text-3xl mb-4 text-[#202C4A]">Choose Your Account Type</div>
                        <p className="text-gray-600 max-w-2xl mx-auto">Select whether you want to join as a buyer from UAE or seller from China to get started with the right registration process</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {data.signup.List.map((item) => (
                            <div key={item.title} className="group">
                                <Link
                                    href={item.link}
                                    className="w-full h-40 bg-white text-brand-blue border-2 border-gray-200 hover:border-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl group-hover:scale-105 flex flex-col items-center justify-center space-y-4 p-8">
                                    <div className="p-4 rounded-full bg-brand-blue group-hover:bg-white transition-colors duration-300">
                                        <Image alt={item.title} src={item.icon} height={20} width={20} className="group-[:not(:hover)]:invert" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-semibold mb-1">{item.title}</div>
                                        <div className="text-sm opacity-80">{item.subTitle}</div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
