"use client";

import { useState } from "react";
import OuterAccordion from "@/components/faq/OuterAccordion";
import InnerAccordion from "@/components/faq/InnerAccordion";

const data = [
    {
        title: "Getting Started",
        description: "Essential information for new users to begin their journey on ADPG Auto Marketplace",
        icon: "🚀",
        id: "gettingStarted",
        faq: [
            { q: "How does ADPG Auto Marketplace work?", a: "ADPG Auto Marketplace is a comprehensive platform connecting verified buyers, sellers, and dealers across the UAE. We facilitate secure vehicle transactions with professional inspections, escrow payments, and logistics support. Simply browse our inventory, add vehicles to your cart, schedule inspections, and complete your purchase with confidence." },
            { q: "Do I need to create an account to browse vehicles?", a: "No, you can browse our vehicle inventory without creating an account. However, to add items to your cart, schedule inspections, make purchases, or list vehicles for sale, you'll need to create a free account and complete our verification process." },
            { q: "What makes ADPG Auto different from other car marketplaces?", a: "ADPG Auto offers end-to-end services including professional vehicle inspections, escrow payment protection, verified seller network, comprehensive logistics support, and integration with AD Ports Group's infrastructure. We ensure every transaction is secure, transparent, and hassle-free." },
        ],
    },
    {
        title: "Buying Process",
        description: "Step-by-step guidance through our secure vehicle purchasing process and payment options",
        icon: "🛒",
        id: "buyingProcess",
        faq: [
            {
                q: "How do I purchase a vehicle on ADPG Auto?",
                a: "Browse and filter vehicles by your preferences "
            },
            {
                q: "What payment methods do you accept?",
                a: "We accept major credit cards, debit cards, bank transfers, and certified checks. All payments are processed through our secure escrow system to protect both buyers and sellers. You can pay a 10% token to reserve a vehicle or pay the full amount immediately."
            },
            {
                q: "Can I negotiate the price of a vehicle?",
                a: "Yes! Our platform includes built-in negotiation tools that allow you to communicate directly with sellers and make counter-offers. Many sellers are open to reasonable negotiations, especially for cash buyers or quick transactions."
            },
            {
                q: "What if I'm not satisfied with the vehicle after inspection?",
                a: "If the vehicle doesn't match the description or fails to meet your expectations during the professional inspection, you can withdraw from the purchase without penalty. Your deposit will be fully refunded through our buyer protection program. "
            },
        ],
    },
    {
        title: "Vehicle Inspection",
        description: "Comprehensive vehicle evaluation services to ensure quality and transparency in every purchase",
        icon: "🔍",
        id: "vehicleInspection",
        faq: [
            {
                q: "Are vehicle inspections mandatory?",
                a: "While not mandatory, we highly recommend professional inspections for all vehicles. Our certified inspectors provide comprehensive 150-point checks covering engine, transmission, brakes, electrical systems, body condition, and more. Inspection reports help you make informed decisions.",
            },
            {
                q: "How much do inspections cost?",
                a: "Inspection fees are included in our service at no additional cost to buyers. This is part of our commitment to transparency and ensuring every vehicle meets quality standards before purchase.",
            },
            {
                q: "How long does an inspection take?",
                a: "Standard inspections take 2-4 hours depending on the vehicle type and condition. Rush inspections can be completed within 24 hours for an additional fee. You'll receive a detailed report with photos and videos within 6 hours of completion.",
            },
            {
                q: "Can I be present during the inspection?",
                a: "Absolutely! We encourage buyers to attend inspections when possible. You can also request live video calls during the inspection process if you cannot be physically present. This ensures complete transparency in the evaluation process.",
            },
        ],
    },
    {
        title: "Selling Process",
        description: "Everything you need to know about listing and selling your vehicle on our trusted platform",
        icon: "💰",
        id: "sellingProcess",
        faq: [
            {
                q: "How do I list my vehicle for sale?",
                a: "Create a seller account and complete verification",
            },
            {
                q: "What are the seller fees?",
                a: "Individual sellers pay a 3% commission only when the vehicle is sold. Dealers have subscription plans starting from AED 299/month. There are no upfront listing fees - you only pay when you successfully sell your vehicle.",
            },
            {
                q: "How long does it take to sell a vehicle?",
                a: "Average selling time varies by vehicle type, condition, and pricing. Most well-priced vehicles sell within 30-45 days. Premium vehicles may take longer, while competitively priced economy cars often sell within 2-3 weeks.",
            },
            {
                q: "Can I sell multiple vehicles?",
                a: "Yes! Individual sellers can list up to 5 vehicles at a time. If you regularly sell vehicles, consider upgrading to a dealer account for unlimited listings and additional features like inventory management tools and priority support.",
            },
        ],
    },
    {
        title: "Shipping & Delivery",
        description: "Reliable logistics solutions and delivery services across the UAE and international markets",
        icon: "🚛",
        id: "shippingDelivery",
        faq: [
            {
                q: "Do you provide vehicle delivery services?",
                a: "Yes, we offer comprehensive logistics solutions through our network of certified transporters. We can deliver vehicles anywhere in the UAE and to select international destinations. Delivery costs are calculated based on distance and vehicle type.",
            },
            {
                q: "How much does delivery cost?",
                a: "Delivery within UAE emirates ranges from AED 300-800 depending on the distance. International shipping costs vary by destination. You'll see exact delivery costs before completing your purchase. Some sellers offer free local delivery for qualified buyers.",
            },
            {
                q: "Is my vehicle insured during transport?",
                a: "Yes, all vehicles are fully insured during transport through our logistics partners. Coverage includes protection against damage, theft, or loss during the delivery process. Insurance is included at no additional cost to buyers.",
            },
            {
                q: "Can I track my vehicle delivery?",
                a: "Absolutely! You'll receive real-time tracking updates via SMS and email once your vehicle is dispatched. Our logistics dashboard provides live GPS tracking, estimated delivery times, and direct contact with the driver.",
            },
        ],
    },
    {
        title: "Account & Security",
        description: "Information about user verification, data protection, and maintaining secure account access",
        icon: "🔒",
        id: "accountSecurity",
        faq: [
            {
                q: "How do you verify users on the platform?",
                a: "We use a comprehensive KYC (Know Your Customer) process that includes Emirates ID verification, phone number confirmation, and address verification. Dealers undergo additional business license and trade license verification. This ensures all users are legitimate and trustworthy.",
            },
            {
                q: "Is my personal information secure?",
                a: "Yes, we use bank-level encryption and security measures to protect your personal and financial information. We comply with UAE data protection regulations and never share your information with third parties without your consent.",
            },
            {
                q: "What should I do if I suspect fraudulent activity?",
                a: "Report any suspicious activity immediately through our 24/7 support channels. We have dedicated fraud prevention teams and advanced monitoring systems. Never share personal information or make payments outside our secure platform.",
            },
            {
                q: "Can I delete my account?",
                a: "Yes, you can request account deletion at any time. Contact our support team, and we'll process your request within 7 business days. Note that some transaction records may be retained as required by UAE regulations.",
            },
        ],
    },
    {
        title: "Dealer Services",
        description: "Professional dealer onboarding, enhanced features, and business growth opportunities",
        icon: "🏢",
        id: "dealerServices",
        faq: [
            {
                q: "How do I become a verified dealer?",
                a: "To become a verified dealer: 1) Submit your trade license and business registration 2) Complete our dealer verification process 3) Choose a subscription plan 4) Upload your inventory 5) Start selling with enhanced features like bulk listing tools, analytics dashboard, and priority support.",
            },
            {
                q: "What are the benefits of a dealer account?",
                a: "Dealer accounts include: unlimited vehicle listings, advanced inventory management, detailed analytics, priority customer support, bulk upload tools, custom branding options, featured listing privileges, and access to dealer financing programs.",
            },
            {
                q: "Do you offer dealer financing programs?",
                a: "Yes, we partner with leading financial institutions to offer competitive financing options to your customers. Dealers can access wholesale financing, floor plan financing, and customer financing programs to boost sales and profitability.",
            },

        ],
    },
    {
        title: "Technical Support",
        description: "Troubleshooting guides and technical assistance for platform usage and common issues",
        icon: "⚙️",
        id: "technicalSupport",
        faq: [
            {
                q: "I'm having trouble uploading photos. What should I do?",
                a: "Ensure your photos are in JPG or PNG format and under 10MB each. Use high-resolution images (minimum 1280x720). Clear your browser cache or try a different browser. If problems persist, contact our technical support team for assistance.",
            },
            {
                q: "The website is running slowly. How can I fix this?",
                a: "Try clearing your browser cache and cookies, disable browser extensions temporarily, ensure you have a stable internet connection, or try accessing the site from a different device. If issues continue, it may be temporary server maintenance.",
            },
            {
                q: "Can I use the platform on my mobile device?",
                a: "Yes! Our platform is fully optimized for mobile devices. You can browse, buy, sell, and manage your account from any smartphone or tablet. We also plan to launch dedicated mobile apps for iOS and Android soon.",
            },

        ],
    },
];

const initialOuterState = data.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
}, {} as Record<string, boolean>);

export default function NestedAccordions() {
    const [outerState, setOuterState] = useState < Record < string, boolean>> (initialOuterState);
    const [activeInnerItems, setActiveInnerItems] = useState < Record < string, number | null >> ({});

    const handleOuterToggle = (id: string) => {
        setOuterState((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleInnerToggle = (outerId: string, innerIdx: number) => {
        setActiveInnerItems((prev) => ({
            ...prev,
            [outerId]: prev[outerId] === innerIdx ? null : innerIdx,
        }));
    };

    return (
        <div className="mx-auto mt-6">
            {data.map((outer, outerIdx) => (
                <OuterAccordion
                    key={outerIdx}
                    title={outer.title}
                    icon={outer.icon}
                    description={outer.description}
                    isOpen={outerState[outer.id]}
                    onClick={() => handleOuterToggle(outer.id)}
                >
                    {outer.faq.map((item, innerIdx) => (
                        <InnerAccordion
                            key={innerIdx}
                            question={item.q}
                            answer={item.a}
                            isOpen={activeInnerItems[outer.id] === innerIdx}
                            onClick={() => handleInnerToggle(outer.id, innerIdx)}
                            isLast={innerIdx === outer.faq.length - 1}
                        />
                    ))}
                </OuterAccordion>
            ))}
        </div>
    );
}
