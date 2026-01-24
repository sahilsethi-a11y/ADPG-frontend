import MissonVision from "@/components/about-us/MissonVision";
import OurJourney from "@/components/about-us/OurJourney";
import CoreValue from "@/components/Features";
import TopBanner from "@/components/about-us/TopBanner";
import CustomerReviews from "@/components/about-us/CustomerReviews";

const data = {
    topBanner: {
        title: "AD PORTS GROUP",
        subTitle: "Our Story",
        description:
            "Building the UAE's most trusted automotive marketplace with transparency, quality, and exceptional service at our core.",
        image: "/assets/home-banner.avif",
    },
    visions: {
        title: "Our Mission & Vision",
        mission: {
            title: "Mission",
            description:
                "To revolutionize the automotive marketplace in the UAE by providing a transparent, efficient, and trustworthy platform that connects buyers with verified vehicles and trusted dealers while promoting sustainable transportation solutions.",
        },
        vision: {
            title: "Vision",
            description:
                "To become the most trusted and innovative automotive marketplace in the Middle East, leading the transition to sustainable mobility and setting new standards for transparency, quality, and customer satisfaction in vehicle transactions.",
            list: [
                "Sustainable Transportation",
                "Digital Innovation",
                "Customer-Centric Excellence",
            ],
        },
        statics: [
            {
                icon: "/assets/shield.svg",
                title: "0",
                subTitle: "Verified Vehicles",
                description: "Verified vehicles currently available",
            },
            {
                icon: "/assets/quality-assurance.svg",
                title: "0",
                subTitle: "Trusted Dealers",
                description: "Trusted dealer partners",
            },
            {
                icon: "/assets/globe.svg",
                title: "0",
                subTitle: "Happy Customers",
                description: "Successfully completed transactions",
            },
            {
                icon: "/assets/support.svg",
                title: "0",
                subTitle: "Emirates Covered",
                description: "Destination countries supported",
            },
        ],
    },
    coreValues: {
        title: "Our Core Values",
        description:
            "The principles that guide our daily operations and long-term strategic decisions.",
        list: [
            {
                icon: "/assets/shield.svg",
                title: "Trust & Transparency",
                description:
                    "Every transaction is built on complete transparency with verified information and honest dealings.",
            },
            {
                icon: "/assets/quality-assurance.svg",
                title: "Quality Excellence",
                description:
                    "We maintain the highest standards in vehicle quality, service delivery, and customer experience.",
            },
            {
                icon: "/assets/globe.svg",
                title: "Customer Focus",
                description:
                    "Our customers are at the heart of everything we do, driving our innovation and service improvements.",
            },
            {
                icon: "/assets/support.svg",
                title: "Innovation Leadership",
                description:
                    "Continuously evolving our platform with the latest technology to serve our community better.",
            },
        ],
    },
    ourJourney: {
        title: "Our Journey",
        description:
            "Key milestones in our mission to transform the automotive marketplace.",
        list: [
            {
                year: "2024",
                title: "Innovation Hub",
                description:
                    "Launched AI-powered features and advanced logistics solutions for seamless experiences.",
            },
            {
                year: "2023",
                title: "Regional Expansion",
                description:
                    "Expanded operations and became the leading automotive marketplace in the UAE.",
            },
            {
                year: "2022",
                title: "Inspection Network",
                description:
                    "Established our professional vehicle inspection network across all seven emirates.",
            },
            {
                year: "2021",
                title: "Platform Launch",
                description:
                    "Launched our comprehensive digital platform connecting buyers, sellers, and dealers.",
            },
            {
                year: "2020",
                title: "Company Founded",
                description:
                    "ADPG Auto was established with a vision to transform the UAE's automotive marketplace.",
            },
        ],
    },
    reviews: {
        title: "What Our Customers Say",
        totalRating: "4.8",
        reviewsCount: "2,487",
        description:
            "Real experiences from satisfied customers who trust ADPG Auto for their automotive needs.",
        authors: [
            {
                rating: "4",
                message:
                    "ADPG  sdbahsdkasda saskhdksahdkas kashdkjahsdksah ksdhkjahsdkjas kjhsdkjahsdkjhaskdjh kshdkjashkdjhas khkjhAuto made buying my fleet vehicles incredibly easy. The transparency and quality assurance gave me complete confidence in my purchase.",
                imgUrl: "/assets/home-banner.avif",
                name: "Ahmed Al-Rashid",
                designation: "Business Owner",
                location: "Dubai, UAE",
            },
            {
                rating: "3",
                message:
                    "The inspection process was thorough and professional. I knew exactly what I was buying, and the car exceeded my expectations.",
                imgUrl: "/assets/home-banner.avif",
                name: "Sarah Johnson",
                designation: "Marketing Executive",
                location: "Abu Dhabi, UAE",
            },
            {
                rating: "5",
                message:
                    "Outstanding service from start to finish. The negotiation process was fair, and the logistics team handled delivery perfectly.",
                imgUrl: "/assets/home-banner.avif",
                name: "Mohammed Hassan",
                designation: "Sales Manager",
                location: "Sharjah, UAE",
            },
            {
                rating: "5",
                message:
                    "As a first-time car buyer, ADPG Auto guided me through every step. Their customer service is exceptional and truly puts customers first.",
                imgUrl: "/assets/home-banner.avif",
                name: "Fatima Al-Zahra",
                designation: "Consultant",
                location: "Ajman, UAE",
            },
        ],
    },
};

export default function page() {
    return (
        <main>
            <TopBanner data={data.topBanner} />
            <MissonVision data={data.visions} />
            <CoreValue data={data.coreValues} />
            <OurJourney data={data.ourJourney} />
            <CustomerReviews data={data.reviews} />
        </main>
    );
}
